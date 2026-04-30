const db = require('../db/database');

const Asset = {
  // Stock global
  getStock() {
    return db.prepare('SELECT * FROM stock WHERE id = 1').get();
  },

  // Portefeuille BTC d'un utilisateur
  findByUserId(userId) {
    return db.prepare('SELECT * FROM assets WHERE user_id = ?').get(userId);
  },

  create(userId) {
    return db.prepare(
      'INSERT INTO assets (user_id, balance_btc) VALUES (?, 0)'
    ).run(userId);
  },

  // Réserve du BTC (déduit du stock, crédite l'utilisateur)
  reserve(userId, amountBtc) {
    const stock = this.getStock();

    if (!stock || stock.available_btc < amountBtc) {
      throw new Error('Insufficient BTC stock');
    }

    // Transaction atomique : les deux opérations réussissent ou aucune
    const transaction = db.transaction(() => {
      db.prepare(
        'UPDATE stock SET available_btc = available_btc - ? WHERE id = 1'
      ).run(amountBtc);

      const wallet = this.findByUserId(userId);
      if (!wallet) this.create(userId);

      db.prepare(
        'UPDATE assets SET balance_btc = balance_btc + ? WHERE user_id = ?'
      ).run(amountBtc, userId);
    });

    transaction();
  }
};

module.exports = Asset;