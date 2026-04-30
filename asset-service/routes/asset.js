const express = require('express');
const router = express.Router();
const Asset = require('../models/asset');
const db = require('../db/database');

// GET /assets/health
router.get('/health', (req, res) => {
  try {
    db.prepare('SELECT 1').get();
    res.json({ status: 'ok', service: 'asset-service', db: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'error', service: 'asset-service', db: err.message });
  }
});

// GET /assets/stock — stock global de BTC
router.get('/stock', (req, res) => {
  const stock = Asset.getStock();
  res.json(stock);
});

// GET /assets/:userId — portefeuille BTC d'un utilisateur
router.get('/:userId', (req, res) => {
  const asset = Asset.findByUserId(req.params.userId);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  res.json(asset);
});

module.exports = router;

/**
 * @openapi
 * /assets/health:
 *   get:
 *     summary: Health check
 *     tags: [Asset]
 *     responses:
 *       200:
 *         description: Service en bonne santé
 */

/**
 * @openapi
 * /assets/stock:
 *   get:
 *     summary: Stock global de BTC disponible
 *     tags: [Asset]
 *     responses:
 *       200:
 *         description: Stock récupéré
 */

/**
 * @openapi
 * /assets/{userId}:
 *   get:
 *     summary: Portefeuille BTC d'un utilisateur
 *     tags: [Asset]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Portefeuille récupéré
 *       404:
 *         description: Portefeuille non trouvé
 */