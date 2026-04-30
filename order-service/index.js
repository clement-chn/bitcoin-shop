const express = require('express');
const { connectProducer } = require('./kafka/producer');
const { connectConsumer } = require('./kafka/consumer');
const { createTopics } = require('./kafka/client');
require('./db/database');

const app = express();
app.use(express.json());

const orderRoutes = require('./routes/order');
app.use('/orders', orderRoutes);

const PORT = process.env.PORT || 3003;

const start = async () => {
  await createTopics();
  await connectProducer();
  await connectConsumer();
  app.listen(PORT, () => {
    console.log(`order-service running on port ${PORT}`);
  });
};

start();