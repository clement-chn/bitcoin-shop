const db = require('../db/database');

const Order = {
  create(correlationId, userId, amountEur, amountBtc) {
    return db.prepare(`
      INSERT INTO orders (correlation_id, user_id, amount_eur, amount_btc, status)
      VALUES (?, ?, ?, ?, 'PENDING')
    `).run(correlationId, userId, amountEur, amountBtc);
  },

  findByCorrelationId(correlationId) {
    return db.prepare('SELECT * FROM orders WHERE correlation_id = ?').get(correlationId);
  },

  findByUserId(userId) {
    return db.prepare(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC'
    ).all(userId);
  },

  updateStatus(correlationId, status, reason = null) {
    return db.prepare(`
      UPDATE orders SET status = ?, reason = ? WHERE correlation_id = ?
    `).run(status, reason, correlationId);
  }
};

module.exports = Order;