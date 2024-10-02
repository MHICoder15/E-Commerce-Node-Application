const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();
const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
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
          .hash(password, 12)
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
                  from: EMAIL_USER,
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

exports.getResetPassword = (req, res, next) => {
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success"),
  });
};

exports.postResetPassword = (req, res, next) => {
  const email = req.body.email;
  if (email) {
    crypto.randomBytes(32, (error, buffer) => {
      if (error) {
        console.log("Crypto Random Bytes Error", error);
        return res.redirect("/reset");
      }
      const token = buffer.toString("hex");
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            req.flash("error", "No account with that email found!");
            return res.redirect("/reset");
          }
          user.resetToken = token;
          user.resetTokenExpiration = Date.now() + 3600000;
          return user.save();
        })
        .then((result) => {
          const mailOptions = {
            from: EMAIL_USER,
            to: email,
            subject: "Password Reset.",
            html: `
            <p>Hello ${result.name},</p>
            <p>You requested a password reset.</p>
            <p>Please click on <a href="http://localhost:3000/reset/${token}">link</a> to reset your password.</p>
          `,
          };
          transporter
            .sendMail(mailOptions)
            .then((info) => {
              console.log("Email sent: " + info.response);
              req.flash("success", "Check your email to reset password.");
              res.redirect("/reset");
            })
            .catch((error) => {
              console.log("Send Email to User Error:", error);
            });
        })
        .catch((error) => {
          console.log("Find User Error", error);
        });
    });
  } else {
    req.flash("error", "Please fill-in valid data in all fields & try again.");
    return res.redirect("/reset");
  }
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        req.flash("error", "Reset Password Token has been Expired!");
        return res.redirect("/reset");
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        userId: user._id.toString(),
        passwordToken: user.resetToken,
        errorMessage: req.flash("error"),
        successMessage: req.flash("success"),
      });
    })
    .catch((error) => {
      console.log("Find User Error", error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;

  let updateUser;
  if (newPassword && confirmPassword) {
    if (newPassword !== confirmPassword) {
      req.flash("error", "Password does not matched.");
      return res.redirect(`/reset/${passwordToken}`);
    }
    User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    })
      .then((user) => {
        updateUser = user;
        return bcrypt.hash(newPassword, 12).catch((error) => {
          console.log("Hashing Password Error", error);
        });
      })
      .then((hashPassword) => {
        updateUser.password = hashPassword;
        updateUser.resetToken = undefined;
        updateUser.resetTokenExpiration = undefined;
        updateUser.save();
        req.flash("success", "Password reset successfully!");
        res.redirect("/login");
      })
      .catch((error) => {
        console.log("Find User Error", error);
      });
  } else {
    req.flash("error", "Please fill-in valid data in all fields & try again.");
    return res.redirect(`/reset/${passwordToken}`);
  }
};
