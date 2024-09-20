const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorController = require("./controllers/error");

const User = require("./models/user");

const connectMongoDB = require("./utils/database.util").connectMongoDB;
const session = require("express-session");
const MongodbStore = require("connect-mongodb-session")(session);

const app = express();
const store = new MongodbStore({
  uri: "mongodb://127.0.0.1:27017/e-commerce-db",
  collection: "sessions",
});

// Middleware for body parser
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware for static file
app.use(express.static(path.join(__dirname, "public")));

// Middleware For Ejs Template
app.set("view engine", "ejs");
app.set("views", "views");

// Middleware For Session
app.use(
  session({
    secret: "MHI_Secret_For_Session",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log("Find User By ID Error:", err));
});

// Middleware For Routes
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

connectMongoDB(() => {
  app.listen(3000, () => console.log("Server is running on port 3000"));
});
