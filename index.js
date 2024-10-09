import handleShopBotCallbackQuery from "./handlers/handleShopBotCallbackQuery.js";
import handleShopBotMessage from "./handlers/handleShopBotMessage.js";
import handleShopshopBotPhoto from "./handlers/handleShopBotPhoto.js";
import handleShopBotReceipt from "./handlers/handleShopBotReceipt.js";
import handleShopBotStartMessage from "./handlers/handleShopBotStartMessage.js";
import createUsersTable from "./services/createUsersTable.js";
import openConnection from "./utils/openDbConnection.js";

const db = await openConnection();

createUsersTable(db);

handleShopBotStartMessage(db);

handleShopBotMessage(db);

handleShopBotCallbackQuery(db);

handleShopshopBotPhoto(db);

handleShopBotReceipt(db);