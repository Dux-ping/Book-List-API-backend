const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  // actually their email
  email: String,
  password: String,
  token: String,
});

module.exports.User = mongoose.model("User", userSchema);
