const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { publishEvent } = require('../kafka/producer');
const { getBtcPrice } = require('../services/btcPrice');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');

// GET /orders/health
router.get('/health', (req, res) => {
  try {
    db.prepare('SELECT 1').get();
    res.json({ status: 'ok', service: 'order-service', db: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'error', service: 'order-service', db: err.message });
  }
});

// GET /orders/:userId — historique des ordres
router.get('/:userId', (req, res) => {
  const orders = Order.findByUserId(req.params.userId);
  res.json(orders);
});

// POST /orders — créer un ordre d'achat
router.post('/', async (req, res) => {
  const { userId, amountEur } = req.body;

  if (!userId || !amountEur) {
    return res.status(400).json({ error: 'userId et amountEur requis' });
  }

  try {
    const btcPrice = await getBtcPrice();
    const amountBtc = amountEur / btcPrice;
    const correlationId = uuidv4();

    Order.create(correlationId, userId, amountEur, amountBtc);

    await publishEvent('DEBIT_EUR', {
      userId,
      amount: amountEur,
      correlationId
    });

    console.log(`[${correlationId}] Ordre créé, DEBIT_EUR publié`);

    res.status(201).json({
      correlationId,
      userId,
      amountEur,
      amountBtc,
      btcPrice,
      status: 'PENDING'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;