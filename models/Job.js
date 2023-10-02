const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  cronExpression: String,
  functionName: String, // The name of the function to execute from jobFunctions.js
  payload: mongoose.Schema.Types.Mixed, // Can store any valid JS data structure
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
