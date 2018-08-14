const express = require("express");
const mongoose = require("mongoose");

const port = process.env.PORT || 5000;
const User = require("./models/userModel");
const Item = require("./models/itemModel");
const Outfit = require("./models/outfitModel");

const keys = require("./config/keys");

const cookieSession = require("cookie-session");
const passport = require("passport");
const authRoutes = require("./routes/auth-routes");
const profileRoutes = require("./routes/profile-routes");
const passportSetup = require("./config/passport-setup");

const sessionOptions = {};

// set up server
const server = express();
server.use(express.json());

//set up cookie-session
server.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey]
  })
);

// set up passport. Initialize
server.use(passport.initialize());
server.use(passport.session());

// set up routes
server.use("/auth", authRoutes);
server.use("/profile", profileRoutes);

mongoose.connect(keys.mongoDb.dbURI).then(() => {
  console.log("Connected to MongoDB");
});

server.get("/", (req, res) => {
  res.status(200).json("Server running");
});

// API WISHLIST
// HOW WILL THE FOLLOWING WORK WITH OAUTH?
// POST - Register new User
// MIDDLEWARE - to protect routes by requiring user login
// POST - Log in as specific User
// PUT - Change User details

// POST - Add an item to the database
server.post("/item", (req, res) => {
  const { name, image, type, tags } = req.body;
  Item.create({ name, image, type, tags })
    .then(item => {
      res.status(201).json(item);
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

// PUT - Change an item in the database?

// POST - Add an outfit to the database
server.post("/outfit", (req, res) => {
  const { name, tags, worn, top, bottom, shoes } = req.body;
  Outfit.create({ name, tags, worn, top, bottom, shoes })
    .then(outfit => {
      res.status(201).json(outfit);
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

// PUT - Change an outfit in the database?

// GET - specific item of clothing by ID
server.get("/item/:id", (req, res) => {
  const id = req.params.id;
  Item.findById(id)
    .then(item => {
      res.status(200).json(item);
    })
    .catch(err => {
      res.send({ error: err.message });
    });
});

// GET - outfit by ID
server.get("/outfit/:id", (req, res) => {
  const id = req.params.id;
  Outfit.findById(id)
    .then(outfit => {
      res.status(200).json(outfit);
    })
    .catch(err => {
      res.send({ error: err.message });
    });
});

// GET - all items with a certain tag

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
