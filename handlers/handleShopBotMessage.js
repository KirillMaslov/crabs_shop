import getShopBotUserOrNullByChatId from "../middlewares/getShopBotUserOrNullByChatId.js";
import {
    channelChatId,
    channelLink,
    channelName,
    googleMapsLocation,
    shopBotAdminCommands,
    shopReceiveGoodLink,
    shopRulesLink,
    shopTikTokLink,
    techSuppportBotLink,
    workBotLink,
} from "../config.js";
import shopBot from "../utils/shopBot.js";
import {
    messageForAllShopBotUsers,
    newShopBotCategoryNameListener,
    shopBotCategoryToEditListener,
    shopBotCategoryToEditNewNameListener,
    newShopBotItemCategoryListener,
    newShopBotItemCost,
    newShopBotItemCostListener,
    newShopBotItemDescription,
    newShopBotItemDescriptionListener,
    newShopBotItemName,
    newShopBotItemNameListener,
    shopCategoryDeleteListener,
    userToBlockChatIdListener,
    newShopBotCategoryCostPerKiloListener,
    newShopBotCategoryCountPerKiloListener,
    shopBotCategoryToEditCostListener,
    shopBotCategoryToEditNewCostListener,
    shopBotCategoryToEditNewCountListener,
    shopBotCategoryToEditCountListener,
    setNewShopCardNumber,
    setNewShopCardHolderName,
    setNewShopCookingCost,
    orderReceiverNameListener,
    orderReceiverName,
    orderReceiverPhoneNumberListener,
    orderReceiverPhoneNumber,
    orderReceiverCityListener,
    orderReceiverCity,
    orderReceiverDeliveryInfoListener,
    orderReceiverDeliveryInfo,
    orderCategoryListener,
    orderCategory,
    orderWeightListener,
    orderIsCookedListener,
    orderWeight,
    documentReceiptListener,
    orderIsCooked,
    orderCookingTypeListener,
    orderCookingType
} from "../utils/maps.js";
import giveShopUserAdminStatus from "../services/giveShopUserAdminStatus.js";
import getShopBotUsersCountFromDb from "../middlewares/getShopBotUsersCountFromDb.js";
import getShopBotUsersChatIds from "../middlewares/getShopBotUsersChatIds.js";
import {
    shopBotMainMenuKeyboard
} from "../utils/keyboards.js";
import insertNewShopBotCategoryInDb from "../services/insertNewShopBotCategoryInDb.js";
import getAllShopCategoriesFromDb from "../middlewares/getAllShopCategoriesFromDb.js";
import getShopBotCategoryFromDbByName from "../middlewares/getShopBotCategoryFromDbByName.js";
import insertNewShopBotGoodInDb from "../services/insertNewShopBotGoodInDb.js";
import getAllShopBotGoodsFromDb from "../middlewares/getAllShopBotGoodsFromDb.js";
import getShopBotUserRefferalsCount from "../middlewares/getShopBotUserRefferalsCount.js";
import getAllCrabsGoodsFromDb from "../middlewares/getAllCrabsGoodsFromDb.js";
import getCardFromDb from "../middlewares/getCardFromDb.js";
import getCookingCostPerKiloFromDb from "../middlewares/getCookingCostPerKiloFromDb.js";

export default async function handleShopBotMessage(db) {
    shopBot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        const foundUserOrNull = await getShopBotUserOrNullByChatId(chatId.toString(), db);
        // checking access
        if (!foundUserOrNull) {
            return 0;
        }

        if (foundUserOrNull.isBlocked) {
            return await shopBot.sendMessage(chatId, 'Вы заблокированы в боте. Для разблокировки можете написать @Hard_support (https://t.me/Hard_support)', {
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: 'Написать для разблокировки',
                            url: 'https://t.me/Hard_support'
                        }]
                    ]
                }
            })
        }

        // const chatMembership = await shopBot.getChatMember(channelChatId, chatId);

        // if (chatMembership.status === 'left') {
        //     if (text !== '/start') {
        //         console.log('sosi')
        //         return await shopBot.sendMessage(chatId, 'Для начала Вам нужно подписаться на канал!', {
        //             reply_markup: {
        //                 inline_keyboard: [
        //                     [{
        //                         text: channelName,
        //                         url: channelLink
        //                     }],
        //                     [{
        //                         text: "🔎 Проверить подписку",
        //                         callback_data: 'check_subscription'
        //                     }]
        //                 ]
        //             }
        //         })
        //     }

        //     return 0;
        // } // end of checking Access


        // check if user is admin
        if (foundUserOrNull.status === 'admin') {
            if (text === '/sendAdvertisingMessage') {
                await shopBot.sendMessage(chatId, 'Введите сообщение для пользователей бота', {
                    reply_markup: {
                        keyboard: [
                            [{
                                text: "Отменить"
                            }]
                        ]
                    }
                });

                return messageForAllShopBotUsers.set(chatId.toString(), 'true');
            }

            if (text === '/statistic') {
                const {
                    usersNum
                } = await getShopBotUsersCountFromDb(db);

                return await shopBot.sendMessage(chatId, '<b>Статистика пользователей</b>' + '\n \n' +
                    `<i>Всего пользователей в боте</i>: ${usersNum}`, {
                        parse_mode: "HTML"
                    }
                );
            }

            if (text === '/addCategory') {
                newShopBotCategoryNameListener.set(chatId.toString(), 'true');

                return await shopBot.sendMessage(chatId, '<b>Введіть назву нової категорії раків </b>' + '\n \n' +
                    `<i>Натисніть на кнопку "Відмінити" щоб відмінити додавання категорії</i>`, {
                        parse_mode: "HTML",
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: "Відмінити"
                                }]
                            ]
                        }
                    }
                );
            }

            if (text === '/deleteCategory') {
                const crabsCategoriesFromDB = await getAllCrabsGoodsFromDb(db);

                if (!crabsCategoriesFromDB) {
                    return await shopBot.sendMessage(chatId, '<b>В боті немає раків</b>', {
                        parse_mode: "HTML"
                    })
                }

                const crabsList = crabsCategoriesFromDB.map((crab) => [{
                    text: crab.name
                }]);

                shopCategoryDeleteListener.set(chatId.toString(), 'true');

                return await shopBot.sendMessage(chatId, 'Натисність на категорію яку хочете видалити на клавіатурі нижче' + '\n \n' +
                    '<b>Якщо хочете відмінити видалення категорії раків натисніть кнопку <code>Відмінити</code></b>', {
                        parse_mode: "HTML",
                        reply_markup: {
                            keyboard: [
                                ...crabsList,
                                [{
                                    text: "Відмінити"
                                }]
                            ]
                        }
                    }
                )
            }

            if (text === '/editCategoryName') {
                const crabsCategoriesFromDB = await getAllCrabsGoodsFromDb(db);

                if (!crabsCategoriesFromDB) {
                    return await shopBot.sendMessage(chatId, '<b>В боті немає раків</b>', {
                        parse_mode: "HTML"
                    })
                }

                const crabsList = crabsCategoriesFromDB.map((crab) => [{
                    text: crab.name
                }]);

                shopBotCategoryToEditListener.set(chatId.toString(), 'true');

                return await shopBot.sendMessage(chatId, 'Натисність на категорію для якої хочете замінити назву на клавіатурі нижче' + '\n \n' +
                    '<b>Якщо хочете відмінити зміну назви для категорії раків натисніть кнопку <code>Відмінити</code></b>', {
                        parse_mode: "HTML",
                        reply_markup: {
                            keyboard: [
                                ...crabsList,
                                [{
                                    text: "Відмінити"
                                }]
                            ]
                        }
                    }
                )

            }

            if (text === '/editCategoryCost') {
                const crabsCategoriesFromDB = await getAllCrabsGoodsFromDb(db);

                if (!crabsCategoriesFromDB) {
                    return await shopBot.sendMessage(chatId, '<b>В боті немає раків</b>', {
                        parse_mode: "HTML"
                    })
                }

                const crabsList = crabsCategoriesFromDB.map((crab) => [{
                    text: crab.name
                }]);

                shopBotCategoryToEditCostListener.set(chatId.toString(), 'true');

                return await shopBot.sendMessage(chatId, 'Натисність на категорію для якої хочете змінити ціну на клавіатурі нижче' + '\n \n' +
                    '<b>Якщо хочете відмінити зміну ціни для категорії раків натисніть кнопку <code>Відмінити</code></b>', {
                        parse_mode: "HTML",
                        reply_markup: {
                            keyboard: [
                                ...crabsList,
                                [{
                                    text: "Відмінити"
                                }]
                            ]
                        }
                    }
                )
            }

            if (text === '/editCategoryCount') {
                const crabsCategoriesFromDB = await getAllCrabsGoodsFromDb(db);

                if (!crabsCategoriesFromDB) {
                    return await shopBot.sendMessage(chatId, '<b>В боті немає раків</b>', {
                        parse_mode: "HTML"
                    })
                }

                const crabsList = crabsCategoriesFromDB.map((crab) => [{
                    text: crab.name
                }]);

                shopBotCategoryToEditCountListener.set(chatId.toString(), 'true');

                return await shopBot.sendMessage(chatId, 'Натисність на категорію для якої хочете змінити кількість раків на кілограм на клавіатурі нижче' + '\n \n' +
                    '<b>Якщо хочете відмінити зміну кількості раків для категорії натисніть кнопку <code>Відмінити</code></b>', {
                        parse_mode: "HTML",
                        reply_markup: {
                            keyboard: [
                                ...crabsList,
                                [{
                                    text: "Відмінити"
                                }]
                            ]
                        }
                    }
                )
            }

            if (text === '/changeBlockStatusUser') {
                userToBlockChatIdListener.set(chatId.toString(), 'true');

                return await shopBot.sendMessage(chatId, '<b>Введите чатИД пользователя для которого хотите изменить статус блокировки</b>' + '\n \n' +
                    `<i>Нажмите кнопку "Отменить" чтобы отменить блокировку пользователя</i>`, {
                        parse_mode: "HTML",
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: 'Отменить'
                                }]
                            ]
                        }
                    }
                );
            }

            if (text === '/setNewCard') {
                setNewShopCardNumber.set(chatId.toString());

                return await shopBot.sendMessage(chatId, 'Введіть новий номер карти для прийому платежів' + '\n \n' +
                    'Якщо хочете відмінити зміну карти в боті, натисність кнопку "Відмінити"', {
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: "Відмінити"
                                }]
                            ]
                        }
                    });
            }

            if (text === '/setNewCookingCost') {
                setNewShopCookingCost.set(chatId.toString(), 'true');

                return await shopBot.sendMessage(chatId, 'Введіть нову ціну варіння за кілограм раків ЧИСЛОМ' + '\n \n' +
                    'Якщо хочете додавання нової ціни варіння, натисність кнопку "Відмінити"', {
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: "Відмінити"
                                }]
                            ]
                        }
                    });
            }

            if (setNewShopCookingCost.has(chatId.toString())) {
                setNewShopCookingCost.delete(chatId.toString());

                if (text === "Відмінити") {
                    return await shopBot.sendMessage(chatId, 'Ви успішно відмінили додавання нової ціни варіння' + '\n \n' + shopBotAdminCommands)
                }

                const kilogramCost = await getCookingCostPerKiloFromDb(db);

                if (kilogramCost) {
                    try {
                        await db.run('UPDATE kilogram_cost SET number = ? WHERE id = ?', [Number(text.trim()), kilogramCost.id], function (err) {
                            if (err) {
                                return console.error(err.message);
                            }

                            console.log('language is updated');
                        });
                    } catch (e) {
                        throw new Error(e);
                    }
                } else {
                    try {
                        const sql = `
                            INSERT INTO kilogram_cost (
                                number
                            )
                            VALUES(?)
                        `;

                        await db.run(sql, [
                            text.trim()
                        ], function (err) {
                            if (err) {
                                return console.error(err.message);
                            }

                            console.log(`User with ID ${this.lastID} has been added to the database.`);
                        });
                    } catch (e) {
                        throw new Error(e);
                    }
                }

                return await shopBot.sendMessage(chatId, `<b>Ви успішно замінили ціну варіння раків, нова ціна - ${text}</b>` + '\n \n' +
                    shopBotAdminCommands, {
                        reply_markup: {
                            remove_keyboard: true
                        },
                        parse_mode: "HTML"
                    }
                )
            }

            if (setNewShopCardNumber.has(chatId.toString())) {
                setNewShopCardNumber.delete(chatId.toString());

                if (text === "Відмінити") {
                    return await shopBot.sendMessage(chatId, 'Ви успішно відмінили зміну карти для платежів' + '\n \n' + shopBotAdminCommands)
                }

                const cardFromDb = await getCardFromDb(db);

                if (cardFromDb) {
                    try {
                        await db.run('UPDATE cards SET number = ? WHERE id = ?', [text.trim(), cardFromDb.id], function (err) {
                            if (err) {
                                return console.error(err.message);
                            }

                            console.log('language is updated');
                        });
                    } catch (e) {
                        throw new Error(e);
                    }
                } else {
                    try {
                        const sql = `
                            INSERT INTO cards (
                                number
                            )
                            VALUES(?)
                        `;

                        await db.run(sql, [
                            text.trim()
                        ], function (err) {
                            if (err) {
                                return console.error(err.message);
                            }

                            console.log(`User with ID ${this.lastID} has been added to the database.`);
                        });
                    } catch (e) {
                        throw new Error(e);
                    }
                }

                setNewShopCardHolderName.set(chatId.toString(), 'true');

                return await shopBot.sendMessage(chatId, '<b>Введіть ПІБ власника карти</b>' + '\n \n' +
                    '<i>Якщо хочете змінити номер карти в боті, натисність кнопку "Змінити"</i>', {
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: 'Змінити'
                                }]
                            ],
                        },
                        parse_mode: "HTML"
                    }
                )
            }

            if (setNewShopCardHolderName.has(chatId.toString())) {
                setNewShopCardHolderName.delete(chatId.toString());

                if (text === 'Змінити') {
                    setNewShopCardNumber.set(chatId.toString());

                    return await shopBot.sendMessage(chatId, 'Введіть новий номер карти для прийому платежів', {
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });
                }

                const cardFromDb = await getCardFromDb(db);

                console.log('found card: ', cardFromDb);

                if (!cardFromDb) {
                    try {
                        const sql = `
                            INSERT INTO cards (
                                holderName
                            )
                            VALUES(?)
                        `;

                        await db.run(sql, [
                            text.trim()
                        ], function (err) {
                            if (err) {
                                return console.error(err.message);
                            }

                            console.log(`User with ID ${this.lastID} has been added to the database.`);
                        });
                    } catch (e) {
                        throw new Error(e);
                    }
                } else {
                    try {
                        await db.run('UPDATE cards SET holderName = ? WHERE id = ?', [text.trim(), cardFromDb.id], function (err) {
                            if (err) {
                                return console.error(err.message);
                            }

                            console.log('language is updated');
                        });
                    } catch (e) {
                        throw new Error(e);
                    }
                }

                return await shopBot.sendMessage(chatId, '<b>Ви успішно встановили нові данні для прийому платежів</b>, а саме:' + '\n' +
                    `<code>${cardFromDb.number}</code>` + '\n' +
                    text + '\n\n' + shopBotAdminCommands, {
                        parse_mode: "HTML"
                    }
                )
            }

            if (shopBotCategoryToEditCostListener.has(chatId.toString())) {
                shopBotCategoryToEditCostListener.delete(chatId.toString());

                if (text === "Відмінити") {
                    return await shopBot.sendMessage(chatId, '<b>Ви видмінили зміну ціни для категорії крабів</b>', {
                        parse_mode: "HTML",
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });
                }

                const category = await getShopBotCategoryFromDbByName(text, db);

                if (!category) {
                    const crabsCategoriesFromDB = await getAllCrabsGoodsFromDb(db);

                    if (!crabsCategoriesFromDB) {
                        return await shopBot.sendMessage(chatId, '<b>В боті немає раків</b>', {
                            parse_mode: "HTML"
                        })
                    }

                    const crabsList = crabsCategoriesFromDB.map((crab) => [{
                        text: crab.name
                    }]);

                    shopBotCategoryToEditCostListener.set(chatId.toString(), 'true');

                    return await shopBot.sendMessage(chatId, 'Натисність на категорію для якої хочете змінити ціну на клавіатурі нижче' + '\n \n' +
                        '<b>Якщо хочете відмінити зміну ціни для категорії раків натисніть кнопку <code>Відмінити</code></b>', {
                            parse_mode: "HTML",
                            reply_markup: {
                                keyboard: [
                                    ...crabsList,
                                    [{
                                        text: "Відмінити"
                                    }]
                                ]
                            }
                        }
                    )
                }

                shopBotCategoryToEditNewCostListener.set(chatId.toString(), category.id);

                return await shopBot.sendMessage(chatId, 'Ви обрали категорію. Тепер напишіть нову ціну для цієї категорії' + '\n' +
                    'Якщо хочете обрати іншу категорію для зміни ціни "Обрати нову категорію".', {
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: "Обрати нову категорію"
                                }]
                            ]
                        }
                    })
            }

            if (shopBotCategoryToEditCountListener.has(chatId.toString())) {
                shopBotCategoryToEditCountListener.delete(chatId.toString());

                if (text === "Відмінити") {
                    return await shopBot.sendMessage(chatId, '<b>Ви видмінили зміну ціни для категорії крабів</b>', {
                        parse_mode: "HTML",
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });
                }

                const category = await getShopBotCategoryFromDbByName(text, db);

                if (!category) {
                    const crabsCategoriesFromDB = await getAllCrabsGoodsFromDb(db);

                    if (!crabsCategoriesFromDB) {
                        return await shopBot.sendMessage(chatId, '<b>В боті немає раків</b>', {
                            parse_mode: "HTML"
                        })
                    }

                    const crabsList = crabsCategoriesFromDB.map((crab) => [{
                        text: crab.name
                    }]);

                    shopBotCategoryToEditCountListener.set(chatId.toString(), 'true');

                    return await shopBot.sendMessage(chatId, 'Натисність на категорію для якої хочете змінити кількість раків на кілограм на клавіатурі нижче' + '\n \n' +
                        '<b>Якщо хочете відмінити зміну кількості раків на кілограм для категорії натисніть кнопку <code>Відмінити</code></b>', {
                            parse_mode: "HTML",
                            reply_markup: {
                                keyboard: [
                                    ...crabsList,
                                    [{
                                        text: "Відмінити"
                                    }]
                                ]
                            }
                        }
                    )
                }

                shopBotCategoryToEditNewCountListener.set(chatId.toString(), category.id);

                return await shopBot.sendMessage(chatId, 'Ви обрали категорію. Тепер напишіть нову кількість раків на кілограм для цієї категорії' + '\n' +
                    'Якщо хочете обрати іншу категорію для зміни ціни "Обрати нову категорію".', {
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: "Обрати нову категорію"
                                }]
                            ]
                        }
                    })
            }

            if (shopBotCategoryToEditNewCountListener.has(chatId.toString())) {
                const categoryId = shopBotCategoryToEditNewCountListener.get(chatId.toString());
                shopBotCategoryToEditNewCountListener.delete(chatId.toString());

                if (text === "Обрати нову категорію") {
                    const crabsCategoriesFromDB = await getAllCrabsGoodsFromDb(db);

                    if (!crabsCategoriesFromDB) {
                        return await shopBot.sendMessage(chatId, '<b>В боті немає раків</b>', {
                            parse_mode: "HTML"
                        })
                    }

                    const crabsList = crabsCategoriesFromDB.map((crab) => [{
                        text: crab.name
                    }]);

                    shopBotCategoryToEditCountListener.set(chatId.toString(), 'true');

                    return await shopBot.sendMessage(chatId, 'Натисність на категорію для якої хочете змінити кількість раків на кілограм на клавіатурі нижче' + '\n \n' +
                        '<b>Якщо хочете відмінити зміну кількості раків на кілограм для категорії натисніть кнопку <code>Відмінити</code></b>', {
                            parse_mode: "HTML",
                            reply_markup: {
                                keyboard: [
                                    ...crabsList,
                                    [{
                                        text: "Відмінити"
                                    }]
                                ]
                            }
                        }
                    )
                }

                console.log('categoryId: ', categoryId)

                try {
                    await db.run('UPDATE crabs_goods SET countPerKilo = ? WHERE id = ?', [Number(text), categoryId], function (err) {
                        if (err) {
                            return console.error(err.message);
                        }

                        console.log('language is updated');
                    });
                } catch (e) {
                    throw new Error(e);
                }

                return await shopBot.sendMessage(chatId.toString(), 'Ви успішно замінили кількість раків на кілограм для категорії раків.' + '\n' + shopBotAdminCommands, {
                    reply_markup: {
                        remove_keyboard: true
                    }
                });
            }

            if (shopBotCategoryToEditNewCostListener.has(chatId.toString())) {
                const categoryId = shopBotCategoryToEditNewCostListener.get(chatId.toString());
                shopBotCategoryToEditNewCostListener.delete(chatId.toString());

                if (text === "Обрати нову категорію") {
                    const crabsCategoriesFromDB = await getAllCrabsGoodsFromDb(db);

                    if (!crabsCategoriesFromDB) {
                        return await shopBot.sendMessage(chatId, '<b>В боті немає раків</b>', {
                            parse_mode: "HTML"
                        })
                    }

                    const crabsList = crabsCategoriesFromDB.map((crab) => [{
                        text: crab.name
                    }]);

                    shopBotCategoryToEditCostListener.set(chatId.toString(), 'true');

                    return await shopBot.sendMessage(chatId, 'Натисність на категорію для якої хочете змінити ціну на клавіатурі нижче' + '\n \n' +
                        '<b>Якщо хочете відмінити зміну ціни для категорії раків натисніть кнопку <code>Відмінити</code></b>', {
                            parse_mode: "HTML",
                            reply_markup: {
                                keyboard: [
                                    ...crabsList,
                                    [{
                                        text: "Відмінити"
                                    }]
                                ]
                            }
                        }
                    );
                }

                console.log('categoryId: ', categoryId)

                try {
                    await db.run('UPDATE crabs_goods SET costPerKilo = ? WHERE id = ?', [Number(text), categoryId], function (err) {
                        if (err) {
                            return console.error(err.message);
                        }

                        console.log('language is updated');
                    });
                } catch (e) {
                    throw new Error(e);
                }

                return await shopBot.sendMessage(chatId.toString(), 'Ви успішно замінили ціну для категорії раків.' + '\n' + shopBotAdminCommands, {
                    reply_markup: {
                        remove_keyboard: true
                    }
                });
            }

            if (userToBlockChatIdListener.has(chatId.toString())) {
                userToBlockChatIdListener.delete(chatId.toString());

                if (text == 'Отменить') {
                    return await shopBot.sendMessage(chatId, '<b>Вы отменили блокировку пользователя</b>' + '\n' + shopBotAdminCommands, {
                        parse_mode: "HTML",
                        reply_markup: {
                            remove_keyboard: true,
                        }
                    });
                }


                const userToBlock = await getShopBotUserOrNullByChatId(text, db);

                if (!userToBlock) {
                    return await shopBot.sendMessage(chatId, '<b>ПОЛЬЗОВАТЕЛЬ НЕ НАЙДЕН!! Введите чатИД пользователя для которого хотите изменить статус блокировки</b>' + '\n \n' +
                        `<i>Нажмите кнопку "Отменить" чтобы отменить блокировку пользователя</i>`, {
                            parse_mode: "HTML",
                            reply_markup: {
                                keyboard: [
                                    [{
                                        text: 'Отменить'
                                    }]
                                ]
                            }
                        }
                    );
                }

                try {
                    await db.run('UPDATE shop_users SET status = ? WHERE chatId = ?', [Number(userToBlock.isBlocked) ? 0 : 1, userToBlock.chatId], function (err) {
                        if (err) {
                            return console.error(err.message);
                        }

                        console.log('language is updated');
                    });
                } catch (e) {
                    throw new Error(e);
                }

                return await shopBot.sendMessage(chatId, `<b>Вы успешно ${Number(userToBlock.isBlocked) ? 'Разблокировали' : 'Заблокировали'} пользователя</b>` + '\n' + shopBotAdminCommands, {
                    parse_mode: "HTML",
                    reply_markup: {
                        remove_keyboard: true,
                    }
                });
            }

            if (shopCategoryDeleteListener.has(chatId.toString())) {
                shopCategoryDeleteListener.delete(chatId.toString());

                if (text === "Відмінити") {
                    return await shopBot.sendMessage(chatId, '<b>Ви видмінили видалення категорії крабів</b>', {
                        parse_mode: "HTML",
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });
                }

                const category = await getShopBotCategoryFromDbByName(text, db);

                if (!category) {
                    const crabsCategoriesFromDB = await getAllCrabsGoodsFromDb(db);

                    if (!crabsCategoriesFromDB) {
                        return await shopBot.sendMessage(chatId, '<b>В боті немає раків</b>', {
                            parse_mode: "HTML"
                        })
                    }

                    const crabsList = crabsCategoriesFromDB.map((crab) => [{
                        text: crab.name
                    }]);

                    shopCategoryDeleteListener.set(chatId.toString(), 'true');

                    return await shopBot.sendMessage(chatId, 'Натисність на категорію яку хочете видалити на клавіатурі нижче' + '\n \n' +
                        '<b>Якщо хочете відмінити видалення категорії раків натисніть кнопку <code>Відмінити</code></b>', {
                            parse_mode: "HTML",
                            reply_markup: {
                                keyboard: [
                                    ...crabsList,
                                    [{
                                        text: "Відмінити"
                                    }]
                                ]
                            }
                        }
                    )
                }

                try {
                    await db.run('DELETE FROM crabs_goods WHERE id = ?', [category.id], async function (err) {
                        if (err) {
                            throw new Error(err);
                        }
                    });
                } catch (e) {
                    throw new Error(e);
                }

                return await shopBot.sendMessage(chatId, 'Категорія крабів була успішно видалена', {
                    reply_markup: {
                        keyboard: shopBotMainMenuKeyboard
                    }
                })
            }

            if (shopBotCategoryToEditListener.has(chatId.toString())) {
                shopBotCategoryToEditListener.delete(chatId.toString());

                if (text === "Відмінити") {
                    return await shopBot.sendMessage(chatId, '<b>Ви видмінили зміну назви для категорії крабів</b>', {
                        parse_mode: "HTML",
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });
                }

                const category = await getShopBotCategoryFromDbByName(text, db);

                if (!category) {
                    const crabsCategoriesFromDB = await getAllCrabsGoodsFromDb(db);

                    if (!crabsCategoriesFromDB) {
                        return await shopBot.sendMessage(chatId, '<b>В боті немає раків</b>', {
                            parse_mode: "HTML"
                        })
                    }

                    const crabsList = crabsCategoriesFromDB.map((crab) => [{
                        text: crab.name
                    }]);

                    shopBotCategoryToEditListener.set(chatId.toString(), 'true');

                    return await shopBot.sendMessage(chatId, 'Натисність на категорію назву якої ви хочете замінити на клавіатурі нижче' + '\n \n' +
                        '<b>Якщо хочете відмінити зміну назви для категорії раків натисніть кнопку <code>Відмінити</code></b>', {
                            parse_mode: "HTML",
                            reply_markup: {
                                keyboard: [
                                    ...crabsList,
                                    [{
                                        text: "Відмінити"
                                    }]
                                ]
                            }
                        }
                    )
                }

                shopBotCategoryToEditNewNameListener.set(chatId.toString(), category.id);

                return await shopBot.sendMessage(chatId, 'Ви обрали категорію. Тепер напишіть нову назву для цієї категорії' + '\n' +
                    'Якщо хочете обрати іншу категорію для зміни назви "Обрати нову категорію".', {
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: "Обрати нову категорію"
                                }]
                            ]
                        }
                    })
            }

            if (shopBotCategoryToEditNewNameListener.has(chatId.toString())) {
                const categoryId = shopBotCategoryToEditNewNameListener.get(chatId.toString());
                shopBotCategoryToEditNewNameListener.delete(chatId.toString());

                if (text === "Обрати нову категорію") {
                    const crabsCategoriesFromDB = await getAllCrabsGoodsFromDb(db);

                    if (!crabsCategoriesFromDB) {
                        return await shopBot.sendMessage(chatId, '<b>В боті немає раків</b>', {
                            parse_mode: "HTML"
                        })
                    }

                    const crabsList = crabsCategoriesFromDB.map((crab) => [{
                        text: crab.name
                    }]);

                    shopCategoryDeleteListener.set(chatId.toString(), 'true');

                    return await shopBot.sendMessage(chatId, 'Натисність на категорію назву якої ви хочете замінити на клавіатурі нижче' + '\n \n' +
                        '<b>Якщо хочете відмінити зміну назви для категорії раків натисніть кнопку <code>Відмінити</code></b>', {
                            parse_mode: "HTML",
                            reply_markup: {
                                keyboard: [
                                    ...crabsList,
                                    [{
                                        text: "Відмінити"
                                    }]
                                ]
                            }
                        }
                    );
                }

                try {
                    await db.run('UPDATE crabs_goods SET name = ? WHERE id = ?', [text, categoryId], function (err) {
                        if (err) {
                            return console.error(err.message);
                        }

                        console.log('language is updated');
                    });
                } catch (e) {
                    throw new Error(e);
                }

                return await shopBot.sendMessage(chatId.toString(), 'Ви успішно замінили назву для категорії.' + '\n' + shopBotAdminCommands, {
                    reply_markup: {
                        remove_keyboard: true
                    }
                });
            }

            if (newShopBotCategoryNameListener.has(chatId.toString())) {
                newShopBotCategoryNameListener.delete(chatId.toString());

                if (text === 'Отменить') {
                    return await shopBot.sendMessage(chatId, 'Вы успешно отменили добавление новой категории.' + '\n' + shopBotAdminCommands);
                }

                const newCategoryId = await insertNewShopBotCategoryInDb(text, db);

                newShopBotCategoryCostPerKiloListener.set(chatId.toString(), newCategoryId);

                return await shopBot.sendMessage(chatId, '<b>Напишіть, будь ласка, ціну раків цієї категорії за кілограм *ЧИСЛОМ*!!</b>', {
                    parse_mode: "HTML",
                    reply_markup: {
                        remove_keyboard: true,
                    }
                });
            }

            if (newShopBotCategoryCostPerKiloListener.has(chatId.toString())) {
                const newCategoryId = newShopBotCategoryCostPerKiloListener.get(chatId.toString());
                newShopBotCategoryCostPerKiloListener.delete(chatId.toString());

                try {
                    await db.run('UPDATE crabs_goods SET costPerKilo = ? WHERE id = ?', [Number(text), newCategoryId], function (err) {
                        if (err) {
                            return console.error(err.message);
                        }

                        console.log('language is updated');
                    });
                } catch (e) {
                    throw new Error(e);
                }

                newShopBotCategoryCountPerKiloListener.set(chatId.toString(), newCategoryId);

                return await shopBot.sendMessage(chatId, '<b>Напишіть кількість раків на кілограм цієї категорії. Повідомлення писати числом!!</b>' + '\n \n' +
                    'Щоб замінити ціну за кілограм раків цієї категорії, натисніть кнопку "Змінити"', {
                        parse_mode: "HTML",
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: "Змінити"
                                }]
                            ]
                        }
                    });
            }

            if (newShopBotCategoryCountPerKiloListener.has(chatId.toString())) {
                const newCategoryId = newShopBotCategoryCountPerKiloListener.get(chatId.toString());
                newShopBotCategoryCountPerKiloListener.delete(chatId.toString());

                if (text === "Змінити") {
                    newShopBotCategoryCostPerKiloListener.set(chatId.toString(), newCategoryId);

                    return await shopBot.sendMessage(chatId, '<b>Напишіть, будь ласка, ціну раків цієї категорії за кілограм *ЧИСЛОМ*!!</b>', {
                        parse_mode: "HTML",
                        reply_markup: {
                            remove_keyboard: true,
                        }
                    });
                } else if (isNaN(text)) {
                    newShopBotCategoryCountPerKiloListener.set(chatId.toString(), newCategoryId);

                    return await shopBot.sendMessage(chatId, '<b><u>ВИ ВВЕЛИ ЧИСЛО В НЕПРАВИЛЬНОМУ ФОРМАТІ!!!</u></b>' + '\n' + '<b>Напишіть кількість раків на кілограм цієї категорії. Повідомлення писати числом!!</b>' + '\n \n' +
                        'Щоб замінити ціну за кілограм раків цієї категорії, натисніть кнопку "Змінити"', {
                            parse_mode: "HTML",
                            reply_markup: {
                                keyboard: [
                                    [{
                                        text: "Змінити"
                                    }]
                                ]
                            }
                        });
                }

                try {
                    await db.run('UPDATE crabs_goods SET countPerKilo = ? WHERE id = ?', [Number(text), newCategoryId], function (err) {
                        if (err) {
                            return console.error(err.message);
                        }

                        console.log('language is updated');
                    });
                } catch (e) {
                    throw new Error(e);
                }

                return await shopBot.sendMessage(chatId, '<b>Ви успішно додали категорію в бот!</b>' + '\n \n' +
                    shopBotAdminCommands, {
                        parse_mode: "HTML",
                        reply_markup: {
                            remove_keyboard: true
                        }
                    });
            }

            if (messageForAllShopBotUsers.has(chatId.toString())) {
                messageForAllShopBotUsers.delete(chatId.toString());

                if (text === "Отменить") {
                    return await shopBot.sendMessage(chatId, '<b>Вы отменили рассылку сообщения пользователям</b>', {
                        parse_mode: "HTML"
                    });
                }

                const userIds = await getShopBotUsersChatIds(db);

                console.log(userIds);

                for (const userId of userIds) {
                    try {
                        await shopBot.copyMessage(userId, chatId, msg.message_id);
                    } catch (error) {
                        if (error.response && error.response.body && error.response.body.error_code === 403) {
                            console.log(`Пользователь ${userId} заблокировал бота.`);

                            db.run('DELETE FROM shop_users WHERE chatId = ?', [userId], (err) => {
                                if (err) {
                                    throw new Error(`Ошибка при удалении пользователя ${userId}:`, err.message);
                                } else {
                                    console.log(`Пользователь ${userId} был удален из базы данных.`);
                                }
                            });
                        }
                    }
                }

                return await shopBot.sendMessage(chatId, 'Вы успешно разослали сообщение всем пользователям' + '\n' + shopBotAdminCommands, {
                    parse_mode: "HTML",
                    reply_markup: {
                        keyboard: shopBotMainMenuKeyboard
                    }
                })
            }
        }

        switch (text) {
            case 'xG7hJm2uNs5kL8oQ': {
                await giveShopUserAdminStatus(chatId.toString(), db);

                return await shopBot.sendMessage(chatId, 'Вітаю, ви успішно отримали доступ до адмінської панелі бота' + shopBotAdminCommands);
            }

            case 'Ціни / Прайс': {
                const crabsCategoriesFromDB = await getAllCrabsGoodsFromDb(db);

                if (!crabsCategoriesFromDB) {
                    return await shopBot.sendMessage(chatId, '<b>В боті немає раків</b>', {
                        parse_mode: "HTML"
                    })
                }

                const crabsList = crabsCategoriesFromDB.map((crab) => (`🦞 <b>${crab.name}</b> <i>${crab.costPerKilo}</i> грн/кг`)).join('\n');

                console.log(crabsList);

                return await shopBot.sendMessage(chatId, '<b>Ціни / Прайс</b>' + '\n \n' +
                    crabsList, {
                        parse_mode: "HTML"
                    });
            }

            case 'Розміри': {
                const crabsCategoriesFromDB = await getAllCrabsGoodsFromDb(db);

                if (!crabsCategoriesFromDB) {
                    return await shopBot.sendMessage(chatId, '<b>В боті немає раків</b>', {
                        parse_mode: "HTML"
                    })
                }

                const crabsList = crabsCategoriesFromDB.map((crab) => (`🦞 <b>${crab.name}</b> - <i>${crab.countPerKilo}</i> шт/кг`)).join('\n');

                console.log(crabsList);

                return await shopBot.sendMessage(chatId, '<b>Розміри раків</b>' + '\n \n' +
                    crabsList, {
                        parse_mode: "HTML"
                    });
            }

            case 'Методи приготування': {
                const kilogramCost = await getCookingCostPerKiloFromDb(db);

                if (!kilogramCost) {
                    return await shopBot.sendMessage(chatId, '<b>Сталася помилка! Ціна приготування не зазначена. </b>' + '\n \n' +
                        '• <i>класичне приготування</i> 🥗' + '\n' +
                        '• <i>смаження у медовому соусі</i> 🐝' + '\n' +
                        '• <i>смаження по-тайськи</i> 🍝' + '\n' +
                        '• <i>смаження у вершковому соусі</i> 🥛' + '\n' +
                        '• <i>смаження у соусі том-ям</i> 🌶️' + '\n' +
                        '• <i>варені по-американськи</i> 🍻' + '\n', {
                            parse_mode: "HTML"
                        });
                }

                return await shopBot.sendMessage(chatId, '<b>Методи приготування:</b>' + '\n \n' +
                    `Ціна варки <b><u>${kilogramCost.number}</u> грн/кг</b>:` + '\n \n' +
                    '• <i>класичне приготування</i> 🥗' + '\n' +
                    '• <i>смаження у медовому соусі</i> 🐝' + '\n' +
                    '• <i>смаження по-тайськи</i> 🍝' + '\n' +
                    '• <i>смаження у вершковому соусі</i> 🥛' + '\n' +
                    '• <i>смаження у соусі том-ям</i> 🌶️' + '\n' +
                    '• <i>варені по-американськи</i> 🍻' + '\n', {
                        parse_mode: "HTML"
                    });
            }

            case "Розташування": {
                return await shopBot.sendMessage(chatId, '<b>Розташування магазину:</b>' + '\n \n' +
                    `<a href="${googleMapsLocation}">вул. Степана Бандери 30, місто Бровари, Київська область</a>`, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
            }

            case 'Соціальні мережі': {
                return await shopBot.sendMessage(chatId, '<b>Наші соціальні мережі:</b>' + '\n \n' +
                    `<a href="${shopTikTokLink}">Tik tok</a>`, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
            }

            case "Замовити": {
                orderReceiverNameListener.set(chatId.toString(), 'true');

                return await shopBot.sendMessage(chatId, '<b>Введіть ПІБ отримувача</b>' + '\n \n' +
                    'Якщо хочете відмінити замовлення то натисність "Відмінити"', {
                        parse_mode: "HTML",
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: "Відмінити"
                                }]
                            ]
                        }
                    })
            }
        }

        if (orderReceiverNameListener.has(chatId.toString())) {
            orderReceiverNameListener.delete(chatId.toString());

            if (text === "Відмінити") {
                return await shopBot.sendMessage(chatId, 'Ви успішно відмінили замовлення раків, скористайтесь клавіатурою', {
                    reply_markup: {
                        keyboard: shopBotMainMenuKeyboard
                    }
                })
            }

            orderReceiverName.set(chatId.toString(), text.trim());
            orderReceiverPhoneNumberListener.set(chatId.toString(), 'true');

            return await shopBot.sendMessage(chatId, '<b>Введіть номер телефону отримувача</b>' + '\n \n' +
                'Якщо хочете змінити ПІБ отримувача, натисність "Змінити"', {
                    parse_mode: "HTML",
                    reply_markup: {
                        keyboard: [
                            [{
                                text: "Змінити"
                            }]
                        ]
                    }
                })
        }

        if (orderReceiverPhoneNumberListener.has(chatId.toString())) {
            orderReceiverPhoneNumberListener.delete(chatId.toString());

            if (text === "Змінити") {
                orderReceiverNameListener.set(chatId.toString(), 'true');

                return await shopBot.sendMessage(chatId, '<b>Введіть ПІБ отримувача</b>' + '\n \n' +
                    'Якщо хочете відмінити замовлення то натисність "Відмінити"', {
                        parse_mode: "HTML",
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: "Відмінити"
                                }]
                            ]
                        }
                    })
            }

            orderReceiverPhoneNumber.set(chatId.toString(), text.trim());
            orderReceiverCityListener.set(chatId.toString(), 'true');

            return await shopBot.sendMessage(chatId, '<b>Введіть місто або населений пункт отримувача</b>' + '\n \n' +
                'Якщо хочете змінити номер телефону отримувача, натисність "Змінити"', {
                    parse_mode: "HTML",
                    reply_markup: {
                        keyboard: [
                            [{
                                text: "Змінити"
                            }]
                        ]
                    }
                })
        }

        if (orderReceiverCityListener.has(chatId.toString())) {
            orderReceiverCityListener.delete(chatId.toString());

            if (text === "Змінити") {
                orderReceiverPhoneNumberListener.set(chatId.toString(), 'true');

                return await shopBot.sendMessage(chatId, '<b>Введіть номер телефону отримувача</b>' + '\n \n' +
                    'Якщо хочете змінити ПІБ отримувача, натисність "Змінити"', {
                        parse_mode: "HTML",
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: "Змінити"
                                }]
                            ]
                        }
                    })
            }

            orderReceiverCity.set(chatId.toString(), text.trim());
            orderReceiverDeliveryInfoListener.set(chatId.toString(), 'true');

            return await shopBot.sendMessage(chatId, '<b>Введіть додаткову інформацію за одним з двух варіантів:</b>' + '\n' +
                '1. <i>Доставка поштою: Вказати номер відділення, та адресу пошти</i>' + '\n' +
                '2. <i>Кур\'єрська доставка по Києву та Київській області: Вказати адресу місця до якого треба доставити</i>' + '\n \n' +
                'Якщо хочете змінити місто/населений отримувача, натисність "Змінити"', {
                    parse_mode: "HTML",
                    reply_markup: {
                        keyboard: [
                            [{
                                text: "Змінити"
                            }]
                        ]
                    }
                })
        }

        if (orderReceiverDeliveryInfoListener.has(chatId.toString())) {
            orderReceiverDeliveryInfoListener.delete(chatId.toString());

            if (text === "Змінити") {
                orderReceiverCityListener.set(chatId.toString(), 'true');

                return await shopBot.sendMessage(chatId, '<b>Введіть місто або населений пункт отримувача</b>' + '\n \n' +
                    'Якщо хочете змінити номер телефону отримувача, натисність "Змінити"', {
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: "Змінити"
                                }]
                            ]
                        },
                        parse_mode: "HTML"
                    })
            }

            orderReceiverDeliveryInfo.set(chatId.toString(), text.trim());
            orderCategoryListener.set(chatId.toString(), 'true');

            const crabsCategoriesFromDB = await getAllCrabsGoodsFromDb(db);

            if (!crabsCategoriesFromDB) {
                return await shopBot.sendMessage(chatId, '<b>В боті немає раків</b>', {
                    parse_mode: "HTML"
                })
            }

            const crabsList = crabsCategoriesFromDB.map((crab) => [{
                text: crab.name
            }]);

            return await shopBot.sendMessage(chatId, '<b>Оберіть розмір раків які ви хочете замовити</b>' + '\n \n' +
                'Щоб змінити інформацію про доставку, натисність "Змінити"', {
                    parse_mode: "HTML",
                    reply_markup: {
                        keyboard: [
                            ...crabsList,
                            [{
                                text: "Змінити"
                            }]
                        ]
                    }
                })
        }

        if (orderCategoryListener.has(chatId.toString())) {
            orderCategoryListener.delete(chatId.toString());

            if (text === "Змінити") {
                orderReceiverDeliveryInfoListener.set(chatId.toString(), 'true');

                return await shopBot.sendMessage(chatId, '<b>Введіть додаткову інформацію за одним з двух варіантів:</b>' + '\n' +
                    '1. Доставка поштою: Вказати номер відділення, та адресу пошти' + '\n' +
                    '2. Кур\'єрська доставка по Києву та Київській області: Вказати адресу місця до якого треба доставити' + '\n \n' +
                    'Якщо хочете змінити місто/населений отримувача, натисність "Змінити"', {
                        parse_mode: "HTML",
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: "Змінити"
                                }]
                            ]
                        }
                    })
            }

            const category = await getShopBotCategoryFromDbByName(text, db);

            if (!category) {
                const crabsCategoriesFromDB = await getAllCrabsGoodsFromDb(db);

                if (!crabsCategoriesFromDB) {
                    return await shopBot.sendMessage(chatId, '<b>В боті немає раків</b>', {
                        parse_mode: "HTML"
                    })
                }

                const crabsList = crabsCategoriesFromDB.map((crab) => [{
                    text: crab.name
                }]);

                shopBotCategoryToEditCostListener.set(chatId.toString(), 'true');

                return await shopBot.sendMessage(chatId, '<b>Оберіть розмір раків які ви хочете замовити</b>' + '\n \n' +
                    'Щоб змінити інформацію про доставку, натисність "Змінити"', {
                        reply_markup: {
                            keyboard: [
                                ...crabsList,
                                [{
                                    text: "Змінити"
                                }]
                            ]
                        }
                    })
            }

            orderCategory.set(chatId.toString(), text);
            orderWeightListener.set(chatId.toString(), 'true');

            return await shopBot.sendMessage(chatId, '<b>Введіть числом скільки кілограмів раків яку ви хочете замовити</b>' + '\n \n' +
                'Щоб змінити розмір раків, натисність "Змінити"', {
                    parse_mode: "HTML",
                    reply_markup: {
                        keyboard: [
                            [{
                                text: "Змінити"
                            }]
                        ]
                    }
                })
        }

        if (orderWeightListener.has(chatId.toString())) {
            orderWeightListener.delete(chatId.toString());

            if (text === "Змінити") {
                orderCategoryListener.set(chatId.toString(), 'true');

                return await shopBot.sendMessage(chatId, '<b>Оберіть розмір раків які ви хочете замовити</b>' + '\n \n' +
                    'Щоб змінити інформацію про доставку, натисність "Змінити"', {
                        reply_markup: {
                            keyboard: [
                                ...crabsList,
                                [{
                                    text: "Змінити"
                                }]
                            ]
                        },
                        parse_mode: "HTML"
                    })
            }

            orderIsCookedListener.set(chatId.toString(), 'true');
            orderWeight.set(chatId.toString(), text);

            return await shopBot.sendMessage(chatId, '<b>Бажаєте замовити варені чи живі раки?</b>' + '\n \n' +
                'Щоб змінити розмір раків, натисність "Змінити"', {
                    parse_mode: "HTML",
                    reply_markup: {
                        keyboard: [
                            [{
                                text: "Варені"
                            }, {
                                text: 'Живі'
                            }],
                            [{
                                text: "Змінити"
                            }]
                        ]
                    }
                })
        }

        if (orderIsCookedListener.has(chatId.toString())) {
            const kilogramCost = await getCookingCostPerKiloFromDb(db);
            orderIsCookedListener.delete(chatId.toString());

            if (text === "Змінити") {
                orderWeightListener.set(chatId.toString(), 'true');

                return await shopBot.sendMessage(chatId, '<b>Введіть числом скільки кілограмів раків яку ви хочете замовити</b>' + '\n \n' +
                    'Щоб змінити розмір раків, натисність "Змінити"', {
                        parse_mode: "HTML",
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: "Змінити"
                                }]
                            ]
                        }
                    })
            }

            if (text === 'Живі') {
                const category = await getShopBotCategoryFromDbByName(orderCategory.get(chatId.toString()), db);

                const orderWeightInKilos = orderWeight.get(chatId.toString());
                const costPerKilo = category.costPerKilo;

                console.log('orderWeightInKilos: ', orderWeightInKilos);
                console.log('costPerKilo: ', costPerKilo);
                console.log('costPerKilo: ', costPerKilo);
                console.log('kilogramCost: ', kilogramCost.number);


                const card = await getCardFromDb(db);

                console.log(card);

                const finalCost = Number(orderWeightInKilos) * Number(costPerKilo);

                orderIsCooked.set(chatId.toString(), text);
                documentReceiptListener.set(chatId.toString(), 'true');

                return await shopBot.sendMessage(chatId, '<b>Реквізити для оплати</b>:' + '\n \n' +
                    `<code>${card.number}</code> (Натисніть щоб скопіювати номер карти)` + '\n' +
                    `<i>${card.holderName}</i>` + '\n \n' +
                    `Сума: <b><i>${finalCost}</i></b> грн` + '\n \n' +
                    'Після переказу, надішліть будь ласка квитанцію в чат', {
                        parse_mode: "HTML",
                        reply_markup: {
                            keyboard: shopBotMainMenuKeyboard
                        }
                    })
            }

            orderCookingTypeListener.set(chatId.toString());
            orderIsCooked.set(chatId.toString(), text);

            return await shopBot.sendMessage(chatId, '<b>Оберіть вид приготування раків з клавіатури нижче</b>' + '\n \n' +
                '<i>Якщо ви передумали і хочете замовити живих раків, натисніть кнопку "Хочу замовити живих раків"</i>', {
                    reply_markup: {
                        keyboard: [
                            [{
                                text: "Класичне приготування 🥗"
                            }, {
                                text: 'Смаження у медовому соусі 🐝'
                            }],
                            [{
                                text: "Смаження по-тайськи 🍝"
                            }, {
                                text: 'Смаження у вершковому соусі 🥛'
                            }],
                            [{
                                text: "Смаження у соусі том-ям 🌶️"
                            }, {
                                text: 'Варені по-американськи 🍻'
                            }],
                            [{
                                text: "Хочу замовити живих раків"
                            }]
                        ]
                    },
                    parse_mode: "HTML"
                }
            )
        }

        if (orderCookingTypeListener.has(chatId.toString())) {
            const kilogramCost = await getCookingCostPerKiloFromDb(db);
            orderCookingTypeListener.delete(chatId.toString());

            const category = await getShopBotCategoryFromDbByName(orderCategory.get(chatId.toString()), db);

            const orderWeightInKilos = orderWeight.get(chatId.toString());
            const costPerKilo = category.costPerKilo;

            console.log('orderWeightInKilos: ', orderWeightInKilos);
            console.log('costPerKilo: ', costPerKilo);
            console.log('costPerKilo: ', costPerKilo);
            console.log('kilogramCost: ', kilogramCost.number);


            const card = await getCardFromDb(db);

            console.log('card: ', card)

            if (text === "Хочу замовити живих раків") {
                const finalCost = Number(orderWeightInKilos) * Number(costPerKilo);

                orderIsCooked.set(chatId.toString(), text);
                documentReceiptListener.set(chatId.toString(), 'true');

                return await shopBot.sendMessage(chatId, '<b>Реквізити для оплати</b>:' + '\n \n' +
                    `<code>${card.number}</code> (Натисніть щоб скопіювати номер карти)` + '\n' +
                    `<i>${card.holderName}</i>` + '\n \n' +
                    `Сума: <b><i>${finalCost}</i></b> грн` + '\n \n' +
                    'Після переказу, надішліть будь ласка квитанцію в чат', {
                        parse_mode: "HTML",
                        reply_markup: {
                            keyboard: shopBotMainMenuKeyboard
                        }
                    })
            }

            const finalCost = text !== "Хочу замовити живих раків" ? Number(orderWeightInKilos) * Number(costPerKilo) + Number(orderWeightInKilos) * Number(kilogramCost.number) : Number(orderWeightInKilos) * Number(costPerKilo);

            orderCookingType.set(chatId.toString(), text !== "Хочу замовити живих раків" ? text : '');
            documentReceiptListener.set(chatId.toString(), 'true');

            return await shopBot.sendMessage(chatId, '<b>Реквізити для оплати</b>:' + '\n \n' +
                `<code>${card.number}</code> (Натисніть щоб скопіювати номер карти)` + '\n' +
                `<i>${card.holderName}</i>` + '\n \n' +
                `Сума: <b><i>${finalCost}</i></b> грн` + '\n \n' +
                'Після переказу, надішліть будь ласка квитанцію в чат', {
                    parse_mode: "HTML",
                    reply_markup: {
                        keyboard: shopBotMainMenuKeyboard
                    }
                })
        }
    })
}