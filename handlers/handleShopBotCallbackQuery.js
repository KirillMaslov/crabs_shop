import {
    channelChatId
} from "../config.js";
import getShopBotCategoryFromDbById from "../middlewares/getShopBotCategoryFromDbById.js";
import getShopCategoryGoodsFromDb from "../middlewares/getShopCategoryGoodsFromDb.js";
import getShopBotUserOrNullByChatId from "../middlewares/getShopBotUserOrNullByChatId.js";
import {
    shopBotMainMenuKeyboard
} from "../utils/keyboards.js";
import CryptoBotAPI from 'crypto-bot-api';
import fs from 'fs';
import shopBot from "../utils/shopBot.js";
import getAllShopCategoriesFromDb from "../middlewares/getAllShopCategoriesFromDb.js";
import getShopBotGoodFromDbById from "../middlewares/getShopBotGoodFromDbById.js";
import getShopBotAdminsFromDb from "../middlewares/getShopBotAdminsFromDb.js";
import getAllShopBotGoodsFromDb from "../middlewares/getAllShopBotGoodsFromDb.js";


const CryptoBotClient = new CryptoBotAPI('255970:AAICw6YxXC7rUHjDyEIK8dODCXLOEs61Ch9');

export default async function handleShopBotCallbackQuery(db) {
    shopBot.on('callback_query', async (query) => {
        const queryId = query.id;
        const chatId = query.message.chat.id;
        const messageId = query.message.message_id;
        const foundUserOrNull = await getShopBotUserOrNullByChatId(chatId.toString(), db);

        if (query.data === 'soldOut') {
            return await shopBot.answerCallbackQuery(queryId, {
                text: 'Данный товар распродан, ожидайте его поступления!',
                show_alert: true,
            });
        }

        if (query.data === 'no_goods') {
            return await shopBot.answerCallbackQuery(queryId, {
                text: 'В данном разделе нету товаров, ожидайте пока админ их добавит',
                show_alert: true,
            });
        }

        if (query.data.includes('choose__lang')) {
            await shopBot.answerCallbackQuery(queryId);
            const language = query.data.split('--')[1];
            if (!foundUserOrNull) {
                const userFirstName = query.from.first_name;
                const username = query.from.username ? query.from.username : 'NO USERNAME';

                await shopBot.editMessageText("*You have successfully chosen lang*", {
                    inline_keyboard: [],
                    parse_mode: "Markdown",
                    chat_id: chatId,
                    message_id: messageId,
                });

                await shopBot.sendMessage(chatId, await selectMenuItemText(language), {
                    reply_markup: {
                        keyboard: await userMenuKeyboard(language),
                    }
                })
            } else {
                await changeUserLanguage(db, chatId, language);

                await shopBot.editMessageText(await userProfileText(foundUserOrNull.firstName, foundUserOrNull.username, foundUserOrNull.AEDamount, foundUserOrNull.hash, foundUserOrNull.minerLVL, foundUserOrNull.refferals, language), {
                    reply_markup: {
                        inline_keyboard: [
                            language === 'english' ? [{
                                text: 'اللغة العربية 🇦🇪',
                                callback_data: 'choose__lang--arabic'
                            }] : [{
                                text: "English 🇬🇧",
                                callback_data: 'choose__lang--english'
                            }]
                        ]
                    },
                    chat_id: chatId,
                    message_id: messageId,
                });

                await shopBot.sendMessage(chatId, await selectMenuItemText(language), {
                    reply_markup: {
                        keyboard: await userMenuKeyboard(language),
                    }
                })
            }
        }

        if (query.data === 'check_subscription') {
            const chatMembership = await shopBot.getChatMember(channelChatId, chatId);

            console.log(chatMembership);

            if (chatMembership.status !== 'left') {
                try {
                    db.run('UPDATE shop_users SET isSubscribed = ? WHERE chatId = ?', [
                        1,
                        chatId.toString(),
                    ], function (err) {
                        if (err) {
                            return console.error(err.message);
                        }

                        console.log(`Email adress was updated`);
                    });
                } catch (e) {
                    throw new Error(e);
                }

                await shopBot.answerCallbackQuery(queryId, {
                    text: 'Вы успешно подписались на канал',
                    show_alert: true,
                });

                await shopBot.editMessageText('✅ Вы подписались на наш канал', {
                    reply_markup: {
                        inline_keyboard: []
                    },
                    chat_id: chatId,
                    message_id: messageId
                });

                const goodsKeyboard = [];

                const goodsFromDb = await getAllShopCategoriesFromDb(db);

                console.log(goodsFromDb);

                if (goodsFromDb) {
                    for (const good of goodsFromDb) {
                        goodsKeyboard.push([{
                            text: good.name,
                            callback_data: `selectCategory_${good.id}`
                        }]);
                    }
                } else {
                    goodsKeyboard.push([{
                        text: 'В боте нету категорий',
                        callback_data: `no_categories`,
                    }]);
                }

                await shopBot.sendPhoto(chatId, './images/shop_info.jpg', {
                    parse_mode: "HTML",
                    caption: '⚡️ <b>Вы попали в магазин Хардкора</b>.' + '\n' +
                        '┗ <i>Здесь вы сможете приобрести эксклюзивные товары для ваших потребностей:</i>',
                    reply_markup: {
                        keyboard: shopBotMainMenuKeyboard
                    }
                });

                return await shopBot.sendAnimation(chatId, './images/shop_goods-video.MP4', {
                    parse_mode: "HTML",
                    caption: '<b>Товары от Харда</b> 📦' + '\n' +
                        '<u>Только качественные и проверенные товары</u> ✅',
                    reply_markup: {
                        inline_keyboard: goodsKeyboard
                    }
                });

            }

            await shopBot.answerCallbackQuery(queryId, {
                text: 'Подписка на канал не найдена, подпишитесь на канал и нажмите кнопку повторно',
                show_alert: true,
            });

        }

        if (query.data.includes('selectCategory')) {
            const categoryId = query.data.split('_')[1];
            const category = await getShopBotCategoryFromDbById(categoryId, db);

            if (category) {
                const categoryGoods = await getShopCategoryGoodsFromDb(categoryId, db);

                const goodsKeyboard = []

                if (categoryGoods) {
                    console.log(categoryGoods);
                    for (const good of categoryGoods) {
                        goodsKeyboard.push([{
                            text: good.soldOut ? good.name + '❌Распродано❌' : `${good.name}`,
                            callback_data: good.soldOut ? 'soldOut' : `selectGood_${good.id}`
                        }])
                    }
                } else {
                    goodsKeyboard.push([{
                        text: 'В данном разделе нету товаров',
                        callback_data: 'no_goods'
                    }])
                }

                await shopBot.deleteMessage(chatId, messageId);

                return await shopBot.sendPhoto(chatId, `./images/${categoryId}__photo.jpg`, {
                    caption: category.subscription,
                    reply_markup: {
                        inline_keyboard: [
                            ...goodsKeyboard,
                            [{
                                text: 'Назад 🔙',
                                callback_data: `backToGoods`
                            }]
                        ]
                    }
                })
            }
        }

        if (query.data.includes('selectGood')) {
            const goodId = query.data.split('_')[1];

            const good = await getShopBotGoodFromDbById(goodId, db);

            if (good) {
                await shopBot.deleteMessage(chatId, messageId);

                return await shopBot.sendMessage(chatId, `<b>${good.name}</b>` + '\n' +
                    `<b>Цена: ${good.cost} $</b>` + '\n \n' +
                    good.description, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                    text: '💳 Pay with CryptoBot',
                                    callback_data: `payWithCryptoBot_${goodId}`
                                }],
                                [{
                                    text: '💳 Pay with balance',
                                    callback_data: `payWithBalance_${goodId}`
                                }],
                                [{
                                    text: 'Назад 🔙',
                                    callback_data: `selectCategory_${good.categoryId}`
                                }]
                            ]
                        }
                    })
            }
        }

        if (query.data.includes('payWithBalance')) {
            const goodId = query.data.split('_')[1];

            const good = await getShopBotGoodFromDbById(goodId, db);

            if (good) {
                if (Number(good.cost) > Number(foundUserOrNull.balance)) {
                    return await shopBot.answerCallbackQuery(queryId, {
                        text: 'На вашем балансе недостаточно средств для преобретения данного товара',
                        show_alert: true,
                    });
                }
                const adminsArr = await getShopBotAdminsFromDb(db);

                try {
                    await db.run('UPDATE shop_users SET balance = ? WHERE chatId = ?', [Number(foundUserOrNull.balance) - Number(good.cost), chatId.toString()], function (err) {
                        if (err) {
                            return console.error(err.message);
                        }

                        console.log('language is updated');
                    });
                } catch (e) {
                    throw new Error(e);
                }

                for (const admin of adminsArr) {
                    await shopBot.sendMessage(admin.chatId, `💸 <b>Только что была совершена оплата товара.</b>` + '\n' +
                        `Название: ${good.name}, Цена: ${good.cost} USDT` + '\n \n' +
                        `Покупатель: ${query.from.first_name}. Username: ${query.from.username ? `@${query.from.username}` : '<code>НЕТУ ЮЗЕРНЕЙМА</code>'}, ChatId <code>${chatId}</code>`, {
                            parse_mode: "HTML"
                        }
                    );
                }

                return await shopBot.editMessageText('💸 <b>Ваша покупка успешно завершена!</b>.' + "\n" +
                    '🥰 <b><i>Спасибо за покупку, теперь вы можете связаться с поддержкой для получения товара.</i></b>' + '\n \n' +
                    '<i>Обычно ответ занимает 5-10 минут.</i>🔹', {
                        chat_id: chatId,
                        message_id: messageId,
                        parse_mode: "HTML",
                        reply_markup: {
                            inline_keyboard: []
                        }
                    }
                );
            }
        }

        if (query.data.includes('payWithCryptoBot')) {
            const goodId = query.data.split('_')[1];
            const good = await getShopBotGoodFromDbById(goodId, db);
            if (!good) {
                return await shopBot.editMessageText('Данного товара уже нету в боте, воспользуйтесь меню', {
                    chat_id: chatId,
                    message_id: messageId
                })
            }

            const newInvoice = await CryptoBotClient.createInvoice({
                amount: good.cost,
                currency: "USDT"
            });

            console.log(newInvoice);

            return await shopBot.editMessageText('✅ Счет на оплату CryptoBot создан, нажмите "<b>Перейти к оплате</b>" и оплатите товар.' + '\n \n' +
                `Сумма к оплате: <b>${good.cost} USDT</b>` + '\n \n' +
                'После оплаты бот передаст ваш заказ администрации и вы получите товар.', {
                    parse_mode: "HTML",
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: '✅ Перейти к оплате',
                                url: newInvoice.payUrl
                            }],
                            [{
                                text: '☑️ Проверить оплату',
                                callback_data: `checkCryptoBotPayment_${goodId}_${newInvoice.id}`
                            }],
                            [{
                                text: 'Назад 🔙',
                                callback_data: `selectGood_${goodId}`
                            }]
                        ]
                    }
                });
        }

        if (query.data.includes('checkCryptoBotPayment')) {
            const goodId = query.data.split('_')[1];
            const invoiceId = query.data.split('_')[2];

            const newInvoice = await CryptoBotClient.getInvoices({
                asset: "USDT",
                invoice_ids: [invoiceId],
                count: 1
            });

            if (newInvoice.items[0].status === 'active') {
                return await shopBot.answerCallbackQuery(queryId, {
                    text: 'Вы ещё не оплатили ваш товар! Оплатите его по ссылке под сообщением',
                    show_alert: true,
                });
            }

            const good = await getShopBotGoodFromDbById(goodId, db);

            const adminsArr = await getShopBotAdminsFromDb(db);

            if (foundUserOrNull.refferal_id) {
                const refferalUser = await getShopBotUserOrNullByChatId(foundUserOrNull.refferal_id.toString(), db);

                if (refferalUser) {
                    try {
                        await db.run('UPDATE shop_users SET balance = ? WHERE chatId = ?', [refferalUser.balance + (Number(good.cost) * 0.1), foundUserOrNull.refferal_id.toString()], function (err) {
                            if (err) {
                                return console.error(err.message);
                            }

                            console.log('language is updated');
                        });

                        await db.run('UPDATE shop_users SET totalEarned = ? WHERE chatId = ?', [refferalUser.balance + (Number(good.cost) * 0.1), foundUserOrNull.refferal_id.toString()], function (err) {
                            if (err) {
                                return console.error(err.message);
                            }

                            console.log('language is updated');
                        });
                    } catch (e) {
                        throw new Error(e);
                    }
                }
            }

            for (const admin of adminsArr) {
                await shopBot.sendMessage(admin.chatId, `💸 <b>Только что была совершена оплата товара.</b>` + '\n' +
                    `Название: ${good.name}, Цена: ${good.cost} USDT` + '\n \n' +
                    `Покупатель: ${query.from.first_name}. Username: ${query.from.username ? `@${query.from.username}` : '<code>НЕТУ ЮЗЕРНЕЙМА</code>'}, ChatId <code>${chatId}</code>`, {
                        parse_mode: "HTML"
                    }
                );
            }

            return await shopBot.editMessageText('💸 <b>Ваша покупка успешно завершена!</b>.' + "\n" +
                '🥰 <b><i>Спасибо за покупку, теперь вы можете связаться с поддержкой для получения товара.</i></b>' + '\n \n' +
                '<i>Обычно ответ занимает 5-10 минут.</i>🔹', {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: "HTML",
                    reply_markup: {
                        inline_keyboard: []
                    }
                }
            );
        }

        if (query.data === 'backToGoods') {
            const goodsKeyboard = [];

            const goodsFromDb = await getAllShopCategoriesFromDb(db);

            console.log(goodsFromDb);

            if (goodsFromDb) {
                for (const good of goodsFromDb) {
                    goodsKeyboard.push([{
                        text: good.name,
                        callback_data: `selectCategory_${good.id}`
                    }]);
                }
            } else {
                goodsKeyboard.push([{
                    text: 'В боте нету категорий',
                    callback_data: `no_categories`,
                }]);
            }

            await shopBot.deleteMessage(chatId, messageId);

            return await shopBot.sendAnimation(chatId, './images/shop_goods-video.MP4', {
                parse_mode: "HTML",
                caption: '<b>Товары от Харда</b> 📦' + '\n' +
                    '<u>Только качественные и проверенные товары</u> ✅',
                reply_markup: {
                    inline_keyboard: goodsKeyboard
                }
            });
        }

        if (query.data.includes('changeSoldOutGood')) {
            const goodId = Number(query.data.split('_')[1]);
            const isSoldOut = Number(query.data.split('_')[2]);
            const iterator = Number(query.data.split('_')[3]);

            try {
                await db.run('UPDATE shop_goods SET soldOut = ? WHERE id = ?', [isSoldOut ? 0 : 1, goodId], function (err) {
                    if (err) {
                        return console.error(err.message);
                    }

                    console.log('AEDamount is updated');
                });
            } catch (e) {
                throw new Error(e);
            }

            await shopBot.answerCallbackQuery(queryId, {
                text: `Вы успешно обновили статус распродано для товара, его новый статус: ${isSoldOut ? 'В наличии' : 'Распродано'}`,
                show_alert: true,
            });

            const cycleNum = iterator * 5;

            const goodsKeyboard = [];

            const goodsArr = await getAllShopBotGoodsFromDb(db);

            for (let i = cycleNum; i < cycleNum + 5; i++) {
                if (goodsKeyboard[i]) {
                    goodsKeyboard.push([{
                        text: `${goodsArr[i].name} - ${goodsArr[i].soldOut ? 'Распродано' : 'В наличии'}`,
                        callback_data: `changeSoldOutGood_${goodsArr[i].id}_${goodsArr[i].soldOut}_${iterator}`
                    }])
                }
            }

            const navigationButtons = [];

            if (iterator > 0) {
                navigationButtons.push({
                    text: `<<`,
                    callback_data: `changeSoldOutGoodsArr_${iterator - 1}`
                })
            }

            if (goodsArr.length > cycleNum + 5) {
                navigationButtons.push({
                    text: `>>`,
                    callback_data: `changeSoldOutGoodsArr_${iterator + 1}`
                });
            }

            goodsKeyboard.push(navigationButtons);

            return await shopBot.editMessageReplyMarkup({
                inline_keyboard: goodsArr.length ? goodsKeyboard : [{
                    text: "В боте нету товаров",
                    callback_data: 'empty'
                }]
            }, {
                chat_id: chatId,
                message_id: messageId
            });
        }

        if (query.data.includes('changeSoldOutGoodsArr')) {
            const iterator = Number(query.data.split('_')[1]);
            const cycleNum = iterator * 5;

            const goodsKeyboard = [];

            const goodsArr = await getAllShopBotGoodsFromDb(db);

            for (let i = cycleNum; i < cycleNum + 5; i++) {
                if (goodsArr[i]) {
                    goodsKeyboard.push([{
                        text: `${goodsArr[i].name} - ${goodsArr[i].soldOut ? 'Распродано' : 'В наличии'}`,
                        callback_data: `changeSoldOutGood_${goodsArr[i].id}_${goodsArr[i].soldOut}_${iterator}`
                    }])
                }
            }

            const navigationButtons = [];

            if (iterator > 0) {
                navigationButtons.push({
                    text: `<<`,
                    callback_data: `changeSoldOutGoodsArr_${iterator - 1}`
                })
            }

            if (goodsArr.length > cycleNum + 5) {
                navigationButtons.push({
                    text: `>>`,
                    callback_data: `changeSoldOutGoodsArr_${iterator + 1}`
                });
            }

            goodsKeyboard.push(navigationButtons);

            return await shopBot.editMessageReplyMarkup({
                inline_keyboard: goodsArr.length ? goodsKeyboard : [{
                    text: "В боте нету товаров",
                    callback_data: 'empty'
                }]
            }, {
                chat_id: chatId,
                message_id: messageId
            });
        }

        if (query.data.includes('deleteGood')) {
            const goodId = Number(query.data.split('_')[1]);

            try {
                await db.run('DELETE FROM shop_goods WHERE id = ?', [goodId], async function (err) {
                    if (err) {
                        throw new Error(err);
                    }
                });
            } catch (e) {
                throw new Error(e);
            }

            await shopBot.answerCallbackQuery(queryId, {
                text: `Вы успешно удалили товар из бота`,
                show_alert: true,
            });

            return await shopBot.editMessageText('Вы успешно удалили товар из бота', {
                reply_markup: {
                    inline_keyboard: []
                },
                chat_id: chatId,
                message_id: messageId
            });
        }

        if (query.data.includes('changeDeleteGoodsArr')) {
            const iterator = Number(query.data.split('_')[1]);
            const cycleNum = iterator * 5;

            const goodsKeyboard = [];

            const goodsArr = await getAllShopBotGoodsFromDb(db);

            for (let i = 0; i < 5; i++) {
                if (goodsKeyboard[i]) {
                    goodsKeyboard.push([{
                        text: `${goodsArr[i].name} - ${goodsArr[i].soldOut ? 'Распродано' : 'В наличие'}`,
                        callback_data: `deleteGood_${goodsArr[i].id}`
                    }])
                }
            }

            const navigationButtons = [];

            if (iterator > 0) {
                navigationButtons.push({
                    text: `<<`,
                    callback_data: `changeDeleteGoodsArr_${iterator - 1}`
                })
            }

            if (goodsArr.length > cycleNum + 5) {
                navigationButtons.push({
                    text: `>>`,
                    callback_data: `changeDeleteGoodsArr_${iterator + 1}`
                });
            }

            goodsKeyboard.push(navigationButtons);

            return await shopBot.editMessageReplyMarkup({
                inline_keyboard: goodsArr.length ? goodsKeyboard : [{
                    text: "В боте нету товаров",
                    callback_data: 'empty'
                }]
            }, {
                chat_id: chatId,
                message_id: messageId
            });
        }
    });
}