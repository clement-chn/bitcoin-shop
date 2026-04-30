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