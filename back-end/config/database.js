const mongoose = require("mongoose");

const uri =
  "mongodb+srv://Alvin:Izumisagiri%401210@walwepmaincluster.jsgyyca.mongodb.net/WALWePDB?retryWrites=true&w=majority&appName=WALWePMainCluster";

async function connectDB() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully!");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    throw err;
  }
}

module.exports = {
  connectDB,
};
