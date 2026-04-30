const db = require('../db/database');

const Wallet = {
  findByUserId(userId) {
    return db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId);
  },

  create(userId, balanceEur = 0) {
    return db.prepare(
        'INSERT INTO wallets (user_id, balance_eur) VALUES (?, ?)'
    ).run(userId, balanceEur);
  },

  debit(userId, amount) {
    const wallet = this.findByUserId(userId);

    if (!wallet) throw new Error('Wallet not found');
    if (wallet.balance_eur < amount) throw new Error('Insufficient funds');

    return db.prepare(
      'UPDATE wallets SET balance_eur = balance_eur - ? WHERE user_id = ?'
    ).run(amount, userId);
  },

  refund(userId, amount) {
    const wallet = this.findByUserId(userId);

    if (!wallet) throw new Error('Wallet not found');

    return db.prepare(
      'UPDATE wallets SET balance_eur = balance_eur + ? WHERE user_id = ?'
    ).run(amount, userId);
  }
};

module.exports = Wallet;