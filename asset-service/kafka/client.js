const { Kafka, Partitioners } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'asset-service',
  brokers: ['localhost:9092'],
  createPartitioner: Partitioners.LegacyPartitioner
});

const createTopics = async () => {
  const admin = kafka.admin();
  await admin.connect();
  await admin.createTopics({
    topics: [
      { topic: 'RESERVE_BTC', numPartitions: 1 },
      { topic: 'BTC_RESERVED', numPartitions: 1 },
      { topic: 'BTC_RESERVATION_FAILED', numPartitions: 1 },
    ],
    waitForLeaders: true
  });
  await admin.disconnect();
  console.log('Topics Kafka créés');
};

module.exports = { kafka, createTopics };