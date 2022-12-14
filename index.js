/// importing the dependencies
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const port = process.env.PORT || 3001;
const dburi = process.env.DBURI;

const { Ad } = require("./models/ad");
const { User } = require("./models/user");

mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true });

// defining the Express app
const app = express();

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan("combined"));

// custom endpoint to force a user into the db
// app.post("/addUser", async (req, res) => {
//   const testUser = new User({ email: "test@test.com", password: "test", token: "testToken" });
//   await testUser.save();
//   res.send("user added successfully");
// });

app.post("/auth", async (req, res) => {
  console.log(req.body);
  const user = await User.findOne({ email: req.body.email });
  console.log(user);
  if (!user) {
    return res.sendStatus(401);
  }
  if (req.body.password !== user.password) {
    return res.sendStatus(403);
  }
  user.token = uuidv4();
  await user.save();

  res.send({ token: user.token });
});

// this middleware verififes that the user logged in is in our DB
//there are currently no users in our DB
// All endpoints are blocked

// // custom midddleware
// app.use(async (req, res, next) => {
//   const user = await User.findOne({ token: req.headers.authorization });
//   if (user) {
//     next();
//   } else {
//     res.sendStatus(403);
//   }
// });

//PROTECTED ROUTES
// defining CRUD operations
app.get("/", async (req, res) => {
  console.log("This enpoint is called when the app loads");
  res.send(await Ad.find());
});

// this is the nedpoint that gets hit when we make a new add
app.post("/", async (req, res) => {
  const newAd = req.body;
  const ad = new Ad(newAd);
  console.log(ad);
  await ad.save();
  res.send({ message: "New ad inserted." });
});

app.delete("/:id", async (req, res) => {
  await Ad.deleteOne({ _id: ObjectId(req.params.id) });
  res.send({ message: "Ad removed." });
});

app.post("/:id", async (req, res) => {
  await Ad.findOneAndUpdate({ _id: ObjectId(req.params.id) }, req.body);
  res.send({ message: "Ad updated." });
});

// starting the server
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function callback() {
  console.log("Database connected!");
});
