const bcrypt = require("bcryptjs");
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
  const confirmPassword = req.body.confirmPassword;

  if (password !== confirmPassword) {
    return res.redirect("/register");
  }
  User.findOne({ email: email })
    .then((userData) => {
      if (userData) {
        return res.redirect("/register");
      }
      return bcrypt
        .hash(password, 10)
        .then((hashPassword) => {
          const user = new User({
            name: name,
            email: email,
            password: hashPassword,
            cart: { items: [] },
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
        })
        .catch((error) => {
          console.log("Hashing Password Error", error);
        });
    })
    .catch((error) => {
      console.log("Find User Error", error);
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
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((error) => {
              if (error) console.log("Save Session Error:", error);
              res.redirect("/");
            });
          }
          res.redirect("/login");
        })
        .catch((error) => {
          console.log("Comparing Password Error", error);
        });
    })
    .catch((err) => console.log("Find User Error:", err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log("Destroy Session Error:", err);
    res.redirect("/");
  });
};
