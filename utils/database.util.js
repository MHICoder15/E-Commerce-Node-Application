const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/user");

dotenv.config();
const MONGO_DB_URI = process.env.MONGO_DB_URI;

const connectMongoDB = (callback) => {
  mongoose
    .connect(MONGO_DB_URI)
    .then((mongoInstance) => {
      console.log(
        `MongoDB Connected!! DB Host: ${mongoInstance.connection.host}`
      );
      // User.findOne().then((user) => {
      //   if (!user) {
      //     const user = new User({
      //       name: "Hasnain Malik",
      //       email: "hasnain@gmail.com",
      //       password: "Admin@123",
      //       cart: {
      //         items: [],
      //       },
      //     });
      //     user.save();
      //   }
      // });
      callback();
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log("🚀 ~ MongoDB Connection", error);
      return next(error);
    });
};
exports.connectMongoDB = connectMongoDB;
