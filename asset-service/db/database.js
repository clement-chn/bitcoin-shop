const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../asset.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE,
    balance_btc REAL NOT NULL DEFAULT 0
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    available_btc REAL NOT NULL DEFAULT 0
  )
`);

const stock = db.prepare('SELECT * FROM stock').get();
if (!stock) {
  db.prepare('INSERT INTO stock (available_btc) VALUES (?)').run(10);
  console.log('Stock initialisé : 10 BTC disponibles');
}

module.exports = db;