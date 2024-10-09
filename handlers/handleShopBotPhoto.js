import shopBot from "../utils/shopBot.js";
import {
    documentReceiptListener,
    orderCategory,
    orderCookingType,
    orderIsCooked,
    orderReceiverCity,
    orderReceiverDeliveryInfo,
    orderReceiverName,
    orderReceiverPhoneNumber,
    orderWeight,
} from '../utils/maps.js';
import getShopBotAdminsFromDb from '../middlewares/getShopBotAdminsFromDb.js';
import getShopBotCategoryFromDbByName from "../middlewares/getShopBotCategoryFromDbByName.js";
import getCookingCostPerKiloFromDb from "../middlewares/getCookingCostPerKiloFromDb.js";

export default async function handleShopshopBotPhoto(db) {
    shopBot.on('photo', async (msg) => {
        const chatId = msg.chat.id;

        if (documentReceiptListener.has(chatId.toString())) {
            documentReceiptListener.delete(chatId.toString());

            const category = await getShopBotCategoryFromDbByName(orderCategory.get(chatId.toString()), db);
            
            const orderWeightInKilos = orderWeight.get(chatId.toString());
            const costPerKilo = category.costPerKilo;
            const receiverName = orderReceiverName.get(chatId.toString());
            const receiverPhoneNumber = orderReceiverPhoneNumber.get(chatId.toString());
            const receiverCity = orderReceiverCity.get(chatId.toString());
            const deliveryInfo = orderReceiverDeliveryInfo.get(chatId.toString());
            const isCooked = orderIsCooked.get(chatId.toString());
            const cookingType = orderIsCooked.get(chatId.toString()) === 'Варені' ? orderCookingType.get(chatId.toString()) : "Раків не треба готувати";

            const kilogramCost = await getCookingCostPerKiloFromDb(db);
            

            const finalCost = isCooked === 'Варені' ? Number(orderWeightInKilos) * Number(costPerKilo) + Number(orderWeightInKilos) * Number(kilogramCost.number) : Number(orderWeightInKilos) * Number(costPerKilo);

            const adminsArr = await getShopBotAdminsFromDb(db);

            for (const admin of adminsArr) {

                try {
                    await shopBot.sendMessage(admin.chatId, '<b>Нове замовлення раків: </b>' + '\n\n' + 
                        `Покупець: ${msg.from.first_name}. Username: ${msg.from.username ? `@${msg.from.username}` : '<code>НЕТУ ЮЗЕРНЕЙМА</code>'}, Telegram ID: <code>${chatId}</code>` + '\n \n' +
                        `Піб отримувача: <b>${receiverName}</b>` + '\n' +
                        `Місто: <i>${receiverCity}</i>`  + '\n' +
                        `Доставка: <i>${deliveryInfo}</i>` + '\n' +
                        `Номер телефону: <code>${receiverPhoneNumber}</code>` + '\n\n' +
                        `Вага раків: <b>${orderWeightInKilos}</b>` + '\n' +
                        `Розмір раків: <b>${category.name}</b>` + '\n' +
                        `Замовник хоче: <i>${isCooked}</i> раки` + '\n \n' +
                        `Тип варіння раків: <i>${cookingType}</i>` + '\n \n' +
                        
                        `Сумма замовлення: <b><u>${finalCost}</u></b> грн` , {
                        parse_mode: "HTML"
                    });
    
                    await shopBot.forwardMessage(admin.chatId, chatId, msg.message_id);
                } catch (e) {
                    console.log(e);
                }
            }

            return await shopBot.sendMessage(chatId, '<b>Ваше замовлення і квитанція успішно надіслані адміністрації</b>' + '\n\n' + 
                "<i>Очікуйте, з вами зв\яжуться найближчим часом</i>", {
                parse_mode: "HTML"
            })
        }
    })
}