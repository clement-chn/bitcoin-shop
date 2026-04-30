const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../wallet.db'));

// Création de la table si elle n'existe pas
db.exec(`
  CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE,
    balance_eur REAL NOT NULL DEFAULT 0
  )
`);

module.exports = db;