export default async function getShopBotCategoryFromDbByName(categoryName, db) {
    return new Promise(async (resolve, reject) => {
        const sql = `SELECT * FROM crabs_goods WHERE name = ?`;

        await db.get(sql, [categoryName], (err, row) => {
            if (err) {
                console.error('Error fetching user:', err);
                reject(err);
            } else {
                // Check if any rows were returned
                resolve(row || null);
            }
        });
    });
}