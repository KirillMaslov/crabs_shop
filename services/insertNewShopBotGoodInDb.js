export default async function insertNewShopBotGoodInDb(name,
    description,
    cost,
    categoryId, db) {
    return await new Promise((resolve, reject) => {
        const sql = `
                INSERT INTO shop_goods (
                    name,
                    description,
                    cost,
                    categoryId
                )
                VALUES(?, ?, ?, ?)
            `;

        try {
            db.run(sql, [name,
                description,
                cost,
                categoryId
            ], function (err) {
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