const mongoose = require("mongoose");

const jobScheduleSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", index: true },
  scheduledTime: { type: Date, index: true },
  status: { type: String, default: "pending", index: true },
});

const JobSchedule = mongoose.model("JobSchedule", jobScheduleSchema);

module.exports = JobSchedule;
