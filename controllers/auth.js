const bcrypt = require("bcryptjs");
const User = require("../models/user");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mhicoder@gmail.com",
    pass: "$tarm%vvzo%ygcg%celd$",
  },
});

exports.getRegister = (req, res, next) => {
  res.render("auth/register", {
    path: "/register",
    pageTitle: "Register",
    errorMessage: req.flash("error"),
  });
};

exports.postRegister = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if (name && email && password && confirmPassword) {
    if (password !== confirmPassword) {
      req.flash("error", "Password does not matched.");
      return res.redirect("/register");
    }
    User.findOne({ email: email })
      .then((userData) => {
        if (userData) {
          req.flash("error", "Email is already existed.");
          return res.redirect("/register");
        }
        bcrypt
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
                const mailOptions = {
                  from: "mhicoder@gmail.com",
                  to: email,
                  subject: "Signup succeeded.",
                  html: "<h1>You have successfully signed up!</h1>",
                };
                transporter
                  .sendMail(mailOptions)
                  .then((info) => {
                    console.log("Email sent: " + info.response);
                    console.log("Created User");
                    req.flash("success", "New user has been created.");
                    res.redirect("/login");
                  })
                  .catch((error) => {
                    console.log("Send Email to User Error:", error);
                  });
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
  } else {
    req.flash("error", "Please fill-in valid data in all fields & try again.");
    return res.redirect("/register");
  }
};

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email && password) {
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash("error", "Invalid email or password.");
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
            req.flash("error", "Invalid email or password.");
            res.redirect("/login");
          })
          .catch((error) => {
            console.log("Comparing Password Error", error);
          });
      })
      .catch((err) => console.log("Find User Error:", err));
  } else {
    req.flash("error", "Please fill-in valid data in all fields & try again.");
    return res.redirect("/login");
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log("Destroy Session Error:", err);
    res.redirect("/");
  });
};
