export default async function insertNewShopBotCategoryInDb(newName, db) {
    return await new Promise((resolve, reject) => {
        const sql = `
                INSERT INTO crabs_goods (
                    name
                )
                VALUES(?)
            `;

        try {
            db.run(sql, [newName], function (err) {
                if (err) {
                    return reject(err);
                }

                resolve(this.lastID);
            });
        } catch (e) {
            throw new Error(e);
        }
    });
}