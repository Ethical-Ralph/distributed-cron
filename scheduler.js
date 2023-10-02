const cronParser = require("cron-parser");
const { connectToKafka, jobDistributionTopic, jobTopic } = require("./kafka");
require("./models/Job");
const JobSchedule = require("./models/JobSchedule");
const connectToRedis = require("./redis");
const connectToMongoDB = require("./database-connection");

const workerId = `${require("os").hostname()}-${process.pid}`;

const run = async () => {
  const redis = await connectToRedis();
  await connectToMongoDB();

  const { producer, consumer } = connectToKafka("scheduler");

  // Worker Registration
  const registerWorker = async () => {
    await redis.sadd("registeredWorkers", workerId);
  };

  const deregisterWorker = async () => {
    await redis.srem("registeredWorkers", workerId);
  };

  const distributeJobs = async () => {
    const totalWorkers = await redis.scard("registeredWorkers");
    const currentTime = new Date();

    const totalJobs = await JobSchedule.countDocuments({
      status: "pending",
      scheduledTime: { $lte: currentTime },
    });

    const limit = Math.ceil(totalJobs / totalWorkers);

    if (limit === 0) {
      return;
    }

    const offsets = [];

    for (let i = 1; i <= totalWorkers; i++) {
      const pageNumber = i;

      offsets.push({
        pageNumber,
        limit,
      });
    }

    await producer.send({
      topic: jobDistributionTopic,
      messages: offsets.map((offset) => ({
        value: JSON.stringify(offset),
      })),
    });
  };

  // Master logic
  const becomeMaster = async () => {
    const lock = await redis.set("schedulerLock", workerId, "NX", "EX", 5);

    if (lock) {
      // If we got the lock, we are the master
      console.log("I am the master");
      await distributeJobs();
    } else {
      console.log("I am the slave");
    }

    setTimeout(becomeMaster, 5000);
  };

  // Kafka Job Distribution Consumer
  const setupKafkaConsumer = async () => {
    console.log("Consuming from topic:", jobDistributionTopic);
    await consumer.connect();

    await consumer.subscribe({ topic: jobDistributionTopic });

    console.log("Scheduler started");

    consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const pagination = JSON.parse(message.value);
        const currentTime = new Date();

        const jobExecs = await JobSchedule.find({
          status: "pending",
          scheduledTime: { $lte: currentTime },
        })
          .sort("scheduledTime") // Order by scheduled time
          .skip((pagination.pageNumber - 1) * pagination.limit)
          .limit(pagination.limit)
          .populate("job");

        for (const jobExec of jobExecs) {
          try {
            const update = await JobSchedule.updateOne(
              { _id: jobExec._id, __v: jobExec.__v },
              { status: "processing" }
            );

            if (update.nModified === 0) {
              console.log(
                `Job ${jobExec._id} was already being processed by another worker`
              );

              continue;
            }

            const kafkaMessage = {
              _id: jobExec._id,
              jobId: jobExec.job._id,
              functionName: jobExec.job.functionName,
              payload: jobExec.job.payload,
              scheduledTime: jobExec.scheduledTime,
            };

            console.log("Sending job:", kafkaMessage);

            await producer.send({
              topic: jobTopic,
              messages: [
                {
                  value: JSON.stringify(kafkaMessage),
                },
              ],
            });
          } catch (error) {
            console.error(
              `Error processing job:" ${jobExec.job.id} - ${error.message}`
            );

            await JobSchedule.updateOne(
              { _id: jobExec._id },
              { status: "failed" }
            );
          } finally {
            const interval = cronParser.parseExpression(
              jobExec.job.cronExpression
            );

            const nextRun = interval.next().toDate();

            const newJobExec = new JobSchedule({
              job: jobExec.job._id,
              scheduledTime: nextRun,
              status: "pending",
            });

            await newJobExec.save();
          }
        }
      },
    });
  };

  // Register on start-up
  await registerWorker();

  producer.connect();

  setupKafkaConsumer();

  becomeMaster();

  // Deregister on shutdown
  process.on("SIGINT", async () => {
    console.log("SIGTERM signal received.");

    await deregisterWorker();
    process.exit();
  });
  process.on("SIGTERM", async () => {
    console.log("SIGTERM signal received.");
    await deregisterWorker();
    process.exit();
  });
};

run();
