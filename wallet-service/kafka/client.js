const { Kafka, Partitioners } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'wallet-service',
  brokers: ['localhost:9092'],
  createPartitioner: Partitioners.LegacyPartitioner
});

const createTopics = async () => {
  const admin = kafka.admin();
  await admin.connect();
  await admin.createTopics({
    topics: [
      { topic: 'DEBIT_EUR', numPartitions: 1 },
      { topic: 'REFUND_EUR', numPartitions: 1 },
      { topic: 'EUR_DEBITED', numPartitions: 1 },
      { topic: 'EUR_REFUNDED', numPartitions: 1 },
    ],
    waitForLeaders: true
  });
  await admin.disconnect();
  console.log('Topics Kafka créés');
};

module.exports = { kafka, createTopics };