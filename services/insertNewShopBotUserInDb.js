export default async function insertNewShopBotUserInDb(chatId, db) {
    try {
        const sql = `
            INSERT INTO shop_users (
                chatId
            )
            VALUES(?)
        `;

        await db.run(sql, [
            chatId.toString()
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