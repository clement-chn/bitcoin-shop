const { kafka } = require('./client');
const Wallet = require('../models/wallet');
const { publishEvent } = require('./producer');

const consumer = kafka.consumer({ groupId: 'wallet-service-group' });

const connectConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ 
    topics: ['DEBIT_EUR', 'REFUND_EUR'], 
    fromBeginning: false 
  });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const payload = JSON.parse(message.value.toString());
      const { userId, amount, correlationId } = payload;

      switch (topic) {
        case 'DEBIT_EUR': {
          console.log(`[${correlationId}] DEBIT_EUR reçu pour ${userId} : ${amount}€`);
          try {
            Wallet.debit(userId, amount);
            await publishEvent('EUR_DEBITED', { userId, amount, correlationId });
            console.log(`[${correlationId}] EUR_DEBITED publié`);
          } catch (err) {
            console.error(`[${correlationId}] Erreur débit : ${err.message}`);
          }
          break;
        }

        case 'REFUND_EUR': {
          console.log(`[${correlationId}] REFUND_EUR reçu pour ${userId} : ${amount}€`);
          try {
            Wallet.refund(userId, amount);
            await publishEvent('EUR_REFUNDED', { userId, amount, correlationId });
            console.log(`[${correlationId}] Remboursement effectué`);
          } catch (err) {
            console.error(`[${correlationId}] Erreur remboursement : ${err.message}`);
          }
          break;
        }
      }
    }
  });

  console.log('Kafka consumer connected, listening on DEBIT_EUR et REFUND_EUR');
};

module.exports = { connectConsumer };