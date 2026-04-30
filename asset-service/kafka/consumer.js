const { kafka } = require('./client');
const Asset = require('../models/asset');
const { publishEvent } = require('./producer');

const consumer = kafka.consumer({ groupId: 'asset-service-group' });

const connectConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'RESERVE_BTC', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const { userId, amountBtc, correlationId } = JSON.parse(message.value.toString());

      console.log(`[${correlationId}] RESERVE_BTC reçu pour ${userId} : ${amountBtc} BTC`);

      try {
        Asset.reserve(userId, amountBtc);
        await publishEvent('BTC_RESERVED', { userId, amountBtc, correlationId });
        console.log(`[${correlationId}] BTC_RESERVED publié`);
      } catch (err) {
        await publishEvent('BTC_RESERVATION_FAILED', { userId, correlationId, reason: err.message });
        console.log(`[${correlationId}] BTC_RESERVATION_FAILED publié : ${err.message}`);
      }
    }
  });

  console.log('Kafka consumer connected, listening on RESERVE_BTC');
};

module.exports = { connectConsumer };