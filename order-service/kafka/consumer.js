const { kafka } = require('./client');
const Order = require('../models/order');
const { publishEvent } = require('./producer');

const consumer = kafka.consumer({ groupId: 'order-service-group' });

const connectConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topics: ['EUR_DEBITED', 'BTC_RESERVED', 'BTC_RESERVATION_FAILED', 'EUR_REFUNDED'], fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const payload = JSON.parse(message.value.toString());
      const { correlationId } = payload;

      console.log(`[${correlationId}] Événement reçu : ${topic}`);

      switch (topic) {
        // Étape 1 : EUR débité → on demande la réservation BTC
        case 'EUR_DEBITED': {
          const { userId, amount } = payload;
          const order = Order.findByCorrelationId(correlationId);
          if (!order) return;

          await publishEvent('RESERVE_BTC', {
            userId,
            amountBtc: order.amount_btc,
            correlationId
          });

          console.log(`[${correlationId}] RESERVE_BTC publié`);
          break;
        }

        // Étape 2a : BTC réservé → ordre complété ✅
        case 'BTC_RESERVED': {
          Order.updateStatus(correlationId, 'COMPLETED');
          console.log(`[${correlationId}] Ordre COMPLETED`);
          break;
        }

        // Étape 2b : BTC épuisé → on rembourse l'EUR ↩️
        case 'BTC_RESERVATION_FAILED': {
          const order = Order.findByCorrelationId(correlationId);
          if (!order) return;

          Order.updateStatus(correlationId, 'FAILED', payload.reason);

          await publishEvent('REFUND_EUR', {
            userId: order.user_id,
            amount: order.amount_eur,
            correlationId
          });

          console.log(`[${correlationId}] Ordre FAILED, REFUND_EUR publié`);
          break;
        }

        // Étape 3 : EUR remboursé → on log juste
        case 'EUR_REFUNDED': {
          console.log(`[${correlationId}] Remboursement EUR confirmé`);
          break;
        }
      }
    }
  });

  console.log('Kafka consumer connecté, Saga en écoute');
};

module.exports = { connectConsumer };