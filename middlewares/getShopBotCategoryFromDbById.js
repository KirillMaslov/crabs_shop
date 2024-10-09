export default async function getShopBotCategoryFromDbById(id, db) {
    return new Promise(async (resolve, reject) => {
        const sql = `SELECT * FROM shop_categories WHERE id = ?`;

        await db.get(sql, [id], (err, row) => {
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