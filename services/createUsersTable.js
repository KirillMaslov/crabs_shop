export default async function createUsersTable(db) {
    try {
        await db.run(`
            CREATE TABLE IF NOT EXISTS shop_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chatId TEXT UNIQUE,
                status TEXT DEFAULT 'user',
                isBlocked NUMBER DEFAULT 0
            )
        `);

        await db.run(`
            CREATE TABLE IF NOT EXISTS crabs_goods (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT DEFAULT '',
                countPerKilo INTEGER DEFAULT 0,
                costPerKilo INTEGER DEFAULT 0
            )
        `)

        await db.run(`
            CREATE TABLE IF NOT EXISTS cards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                number TEXT DEFAULT '',
                holderName TEXT DEFAULT ''
            )
        `)

        await db.run(`
            CREATE TABLE IF NOT EXISTS kilogram_cost (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                number TEXT DEFAULT ''
            )
        `)

    } catch (e) {
        console.log('error with creating tables in DataBase', e);
    }
}