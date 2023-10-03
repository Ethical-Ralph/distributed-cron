const JobSchedule = require("./models/JobSchedule");
const jobFunctions = require("./jobFunctions");
const connectToMongoDB = require("./database-connection");
const { connectToKafka, jobTopic } = require("./kafka");

const consumeAndRunJobs = async () => {
  await connectToMongoDB();
  const { consumer } = connectToKafka("worker");
  await consumer.connect();
  console.log("Consuming from topic:", jobTopic);
  await consumer.subscribe({ topic: jobTopic });

  console.log("Worker started");

  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const job = JSON.parse(message.value);

      // Get the job function
      const jobFunction = jobFunctions[job.functionName];

      if (!jobFunction) {
        console.error(`No function found for ${job.functionName}`);
        return;
      }

      // Execute the job with the parameters
      try {
        await jobFunction(job);

        await JobSchedule.updateOne({ _id: job._id }, { status: "success" });
      } catch (error) {
        console.error(`Failed to run job ${job._id}:`, error);

        await JobSchedule.updateOne({ _id: job._id }, { status: "failed" });
      }
    },
  });
};

consumeAndRunJobs();
