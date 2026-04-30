const express = require('express');
const router = express.Router();
const Wallet = require('../models/wallet');
const db = require('../db/database');
const { publishEvent } = require('../kafka/producer');

// GET /health
router.get('/health', (req, res) => {
  try {
    db.prepare('SELECT 1').get();
    res.json({ status: 'ok', service: 'wallet-service', db: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'error', service: 'wallet-service', db: err.message });
  }
});

// GET /wallets/:userId — afficher le solde
router.get('/:userId', (req, res) => {
  const wallet = Wallet.findByUserId(req.params.userId);

  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

  res.json(wallet);
});

// POST /wallets/:userId/create — créer un wallet
router.post('/:userId/create', (req, res) => {
  try {
    Wallet.create(req.params.userId, req.body.balanceEur ?? 0);
    res.status(201).json({ message: 'Wallet created' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /wallets/:userId/debit — débiter
router.post('/:userId/debit', async (req, res) => {
  const { amount, correlationId } = req.body;

  try {
    Wallet.debit(req.params.userId, amount);

    await publishEvent('EUR_DEBITED', {
      userId: req.params.userId,
      amount,
      correlationId
    });

    console.log(`[${correlationId}] EUR_DEBITED publié pour ${req.params.userId}`);
    res.json({ message: 'Debit successful' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /wallets/:userId/refund — rembourser
router.post('/:userId/refund', (req, res) => {
  try {
    Wallet.refund(req.params.userId, req.body.amount);
    res.json({ message: 'Refund successful' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

/**
 * @openapi
 * /wallets/health:
 *   get:
 *     summary: Health check
 *     tags: [Wallet]
 *     responses:
 *       200:
 *         description: Service en bonne santé
 */

/**
 * @openapi
 * /wallets/{userId}:
 *   get:
 *     summary: Récupérer le solde EUR d'un utilisateur
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Solde récupéré
 *       404:
 *         description: Wallet non trouvé
 */

/**
 * @openapi
 * /wallets/{userId}/create:
 *   post:
 *     summary: Créer un wallet
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               balanceEur:
 *                 type: number
 *     responses:
 *       201:
 *         description: Wallet créé
 */

/**
 * @openapi
 * /wallets/{userId}/debit:
 *   post:
 *     summary: Débiter un wallet
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               correlationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Débit effectué
 *       400:
 *         description: Solde insuffisant ou wallet non trouvé
 */