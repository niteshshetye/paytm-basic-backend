const mongoose = require("mongoose");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "Firstname is required"],
    minLength: 3,
    maxLength: 30,
  },
  lastname: {
    type: String,
    required: [true, "Lastname is required"],
    minLength: 3,
    maxLength: 30,
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minLength: 3,
    maxLength: 30,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [6, "Minimum password should 6 charecter long"],
  },
  createDate: { type: Date, default: Date.now },
  modifiedDate: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
  salt: String,
});

UserSchema.methods.validPassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
    .toString(`hex`);
  return this.password === hash;
};

const User = new mongoose.model("user", UserSchema);

exports.User = User;
