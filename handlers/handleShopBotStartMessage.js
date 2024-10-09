import {
    channelChatId,
    channelLink,
    channelName,
    shopBotAdminCommands,
    startMessage
} from "../config.js";
import getAllShopCategoriesFromDb from "../middlewares/getAllShopCategoriesFromDb.js";
import getShopBotUserOrNullByChatId from "../middlewares/getShopBotUserOrNullByChatId.js";
import insertNewShopBotUserInDb from "../services/insertNewShopBotUserInDb.js";
import {
    shopBotMainMenuKeyboard
} from "../utils/keyboards.js";
import shopBot from "../utils/shopBot.js";

export default async function handleShopBotStartMessage(db) {
    shopBot.onText(/\/start (.+)|\/start/i, async (msg, match) => {
        const chatId = msg.chat.id;
        const referral_code = match[1];
        const foundUserOrNull = await getShopBotUserOrNullByChatId(chatId.toString(), db);
        console.log(foundUserOrNull);
        console.log(msg);

        // const chatMembership = await shopBot.getChatMember(channelChatId, chatId);

        // console.log(chatMembership);

        if (!foundUserOrNull) {
            // if (referral_code) {
            //     const refferalChatId = referral_code.toString();

            //     try {
            //         const foundRefferal = await getShopBotUserOrNullByChatId(refferalChatId, db);

            //         if (foundRefferal) {
            //             const newRefferalsNum = Number(foundRefferal.refferals_count) + 1;
            //             await db.run('UPDATE shop_users SET refferals_count = ? WHERE chatId = ?', [newRefferalsNum, refferalChatId], function (err) {
            //                 if (err) {
            //                     return console.error(err.message);
            //                 }

            //                 console.log('refferals is updated');
            //             });
            //         }
            //     } catch (e) {
            //         throw new Error(e);
            //     }
            // }

            insertNewShopBotUserInDb(chatId.toString(), db);
        } else if (foundUserOrNull.isBlocked) {
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
        } else if (foundUserOrNull.status === 'admin') {
            return await shopBot.sendMessage(chatId, '<b>Вітаю в адмінській панелі бота</b>' + '\n \n' + shopBotAdminCommands, {
                parse_mode: "HTML"
            });
        }

        return await shopBot.sendPhoto(chatId, './images/logo.png', {
            reply_markup: {
                keyboard: shopBotMainMenuKeyboard
            },
            caption: startMessage,
            parse_mode: "HTML"
        })
    });
}