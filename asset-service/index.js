const express = require('express');
const { connectProducer } = require('./kafka/producer');
const { connectConsumer } = require('./kafka/consumer');
require('./db/database');

const app = express();
app.use(express.json());

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const assetRoutes = require('./routes/asset');
const { createTopics } = require('./kafka/client');
app.use('/assets', assetRoutes);

const PORT = process.env.PORT || 3002;

const start = async () => {
  await createTopics();
  await connectProducer();
  await connectConsumer();
  app.listen(PORT, () => {
    console.log(`asset-service running on port ${PORT}`);
  });
};

start();