const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI || "mongodb://dipak123:password11@ac-m3zcvaz-shard-00-00.45k7oyt.mongodb.net:27017,ac-m3zcvaz-shard-00-01.45k7oyt.mongodb.net:27017,ac-m3zcvaz-shard-00-02.45k7oyt.mongodb.net:27017/gofoodmern?ssl=true&replicaSet=atlas-fgyxac-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

const mongoDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("connected");
  } catch (err) {
    console.log("--- Error connecting to MongoDB:", err);
  }
};

module.exports = mongoDB;


