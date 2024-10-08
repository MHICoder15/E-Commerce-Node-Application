const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log("🚀 ~ Find Product", error);
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log("🚀 ~ Find Product By ID", error);
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        errorMessage: req.flash("error"),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log("🚀 ~ Find Product", error);
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log("🚀 ~ Find Cart Items", error);
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log("🚀 ~ Find Product By ID", error);
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log("🚀 ~ Remove From Cart", error);
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          name: req.user.name,
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log("🚀 ~ Save Order", error);
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log("🚀 ~ Find Order", error);
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  // const orderId = req.params.orderId;
  // const invoiceName = "invoice-" + orderId + ".pdf";
  // const invoicePath = path.join("data", "invoices", invoiceName);
  // // const invoicePath = path.join(__dirname, "data", "invoices", invoiceName);

  // fs.readFile(invoicePath, (err, data) => {
  //   console.log("🚀 ~ fs.readFile ~ data:", data);
  //   console.log("🚀 ~ fs.readFile ~ err:", err);
  //   if (err) {
  //     return next(err);
  //   }
  //   res.send(data);
  // });

  const orderId = req.params.orderId;
  console.log("🚀 ~ orderId:", orderId);
  const invoiceName = "invoice-" + orderId + ".pdf";
  console.log("🚀 ~ invoiceName:", invoiceName);

  const invoicePath = path.join("data", "invoices", invoiceName);
  console.log("🚀 ~ invoicePath:", invoicePath);
  fs.readFile(invoicePath, (err, data) => {
    console.log("🚀 ~ fs.readFile ~ err:", err);
    console.log("🚀 ~ fs.readFile ~ data:", data);
    if (err) {
      return next(err);
    }
    res.send(data);
  });
};
