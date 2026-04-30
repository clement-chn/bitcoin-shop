const express = require('express');
const { connectProducer } = require('./kafka/producer');
const { connectConsumer } = require('./kafka/consumer');
const { createTopics } = require('./kafka/client');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
require('./db/database');

const app = express();
app.use(express.json());

// Routes
const walletRoutes = require('./routes/wallet');
app.use('/wallets', walletRoutes);

// Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3001;

const start = async () => {
  await createTopics();
  await connectProducer();
  await connectConsumer();
  app.listen(PORT, () => {
    console.log(`wallet-service running on port ${PORT}`);
  });
};

start();