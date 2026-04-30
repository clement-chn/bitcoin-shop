const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../order.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    correlation_id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    amount_eur REAL NOT NULL,
    amount_btc REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;