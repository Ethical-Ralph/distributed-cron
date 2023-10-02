require("dotenv").config();

module.exports = {
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/jobscheduler",
  KAFKA_BROKER: process.env.KAFKA_BROKER || "localhost:9092",
  KAFKA_USER: process.env.KAFKA_USER || "admin",
  KAFKA_PASSWORD: process.env.KAFKA_PASSWORD || "admin",
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: process.env.REDIS_PORT || 6379,
};
