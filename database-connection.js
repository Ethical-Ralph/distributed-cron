const mongoose = require("mongoose");
const config = require("./config");

const connectToMongoDB = async () => {
  await mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

module.exports = connectToMongoDB;
