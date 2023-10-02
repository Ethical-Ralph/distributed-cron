const Redis = require("ioredis");
const config = require("./config");

const redis = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
});

const connectToRedis = async () => {
  return redis;
};

module.exports = connectToRedis;
