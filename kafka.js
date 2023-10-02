const { Kafka } = require("kafkajs");
const { KAFKA_BROKER, KAFKA_USER } = require("./config");

exports.connectToKafka = (clientId) => {
  const kafka = new Kafka({
    clientId,
    brokers: [KAFKA_BROKER],
  });

  const producer = kafka.producer();
  const consumer = kafka.consumer({
    groupId: clientId,
  });

  return { producer, consumer };
};

exports.jobTopic = "job_runner";
exports.jobDistributionTopic = "job_distribution";
