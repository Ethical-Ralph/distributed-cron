const cronParser = require("cron-parser");

const Job = require("./models/Job");
const JobExecution = require("./models/JobSchedule");
const connectToMongoDB = require("./database-connection");
const jobs = require("./jobFunctions");

const createNewJob = async (cronExpression, functionName, payload) => {
  // Create the job
  const job = new Job({
    cronExpression,
    functionName,
    payload,
  });

  const savedJob = await job.save();

  // Compute the next execution time using the cron definition
  const nextExecution = cronParser
    .parseExpression(cronExpression)
    .next()
    .toDate();

  // Create the job_execution entry
  const jobExecution = new JobExecution({
    job: savedJob._id,
    scheduledTime: nextExecution,
    status: "pending",
  });

  await jobExecution.save();

  return [savedJob, jobExecution];
};

// Example usage:
(async () => {
  await connectToMongoDB();

  const fiveMin = await createNewJob("*/5 * * * *", jobs.printMessage.name, {
    message: "Five minutes have passed!",
  });

  const newJob = await createNewJob("*/1 * * * *", jobs.printMessage.name, {
    message: "Hello World, in one minute!",
  });

  console.log("Job Created:", newJob);
  console.log("Job Created:", fiveMin);

  process.exit(0);
})();
