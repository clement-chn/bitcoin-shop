const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const correlationIdMiddleware = require('./middleware/correlationId');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(correlationIdMiddleware);

// Pas de express.json() ici !

app.use('/wallets', createProxyMiddleware({ 
  target: 'http://localhost:3001',
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req) => {
      proxyReq.path = '/wallets' + req.url;
    }
  }
}));

app.use('/assets', createProxyMiddleware({ 
  target: 'http://localhost:3002',
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req) => {
      proxyReq.path = '/assets' + req.url;
    }
  }
}));

app.use('/orders', createProxyMiddleware({ 
  target: 'http://localhost:3003',
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req) => {
      proxyReq.path = '/orders' + req.url;
    }
  }
}));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    services: {
      wallet: 'http://localhost:3001',
      asset: 'http://localhost:3002',
      order: 'http://localhost:3003'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`api-gateway running on port ${PORT}`);
});