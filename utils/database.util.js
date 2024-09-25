const mongoose = require("mongoose");
const User = require("../models/user");

const connectMongoDB = (callback) => {
  mongoose
    .connect("mongodb://127.0.0.1:27017/e-commerce-db")
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
    .catch((error) => {
      console.log("MongoDB Connection Error:", error);
    });
};
exports.connectMongoDB = connectMongoDB;
