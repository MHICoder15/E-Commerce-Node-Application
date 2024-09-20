const User = require("../models/user");

exports.getRegister = (req, res, next) => {
  res.render("auth/register", {
    path: "/register",
    pageTitle: "Register",
    isAuthenticated: false,
  });
};

exports.postRegister = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const user = new User({
    name: name,
    email: email,
    password: password,
  });
  user
    .save()
    .then((result) => {
      console.log("Created User");
      res.redirect("/login");
    })
    .catch((err) => {
      console.log("Add User Error:", err);
    });
};

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email, password: password })
    .then((user) => {
      if (user) {
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save((error) => {
          if (error) console.log("Save Session Error:", error);
          res.redirect("/");
        });
      } else {
        console.log("User does not exist!");
        res.redirect("/login");
      }
    })
    .catch((err) => console.log("Find User Error:", err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log("Destroy Session Error:", err);
    res.redirect("/");
  });
};
