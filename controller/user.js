const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const zod = require("zod");
const { User } = require("../models/user");
const { Account } = require("../models/account");

const SignupBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
  firstname: zod.string(),
  lastname: zod.string(),
});

const SigninBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

const UpdateProfileBody = zod.object({
  username: zod.string().email().optional(),
  password: zod.string().optional(),
  firstname: zod.string().optional(),
  lastname: zod.string().optional(),
});

function genratePasswordHashAndSalt(userPass) {
  const salt = crypto.randomBytes(16).toString("hex");

  const password = crypto
    .pbkdf2Sync(userPass, salt, 1000, 64, `sha512`)
    .toString(`hex`);

  return {
    password,
    salt,
  };
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

async function signup(req, res) {
  try {
    const { success } = SignupBody.safeParse(req.body);

    if (!success) {
      return res.status(411).json({
        message: "Username already taken / Incorrect inputs",
      });
    }

    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(411).json({
        message: "Username already taken",
      });
    }

    const { password, salt } = genratePasswordHashAndSalt(req.body.password);

    const user = await User.create({
      ...req.body,
      password,
      salt,
    });

    await Account.create({
      userId: user._id,
      balance: getRandomArbitrary(1, 10000),
    });

    const token = await jwt.sign(
      {
        id: user._id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
      },
      process.env.JWT_SECRETE,
      { expiresIn: "24h" }
    );
    res.status(201).json({
      access_token: token,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
    });
  } catch (error) {
    res.status(404).json(error);
  }
}

async function signin(req, res) {
  try {
    const { success } = SigninBody.safeParse(req.body);

    if (!success) {
      return res.status(411).json({
        message: "Invalid inputs",
      });
    }

    const user = await User.findOne({
      username: req.body.username,
    });

    if (user === null) {
      return res.status(400).json({
        message: "User not found",
      });
    } else if (user.validPassword(req.body.password)) {
      const token = await jwt.sign(
        {
          id: user._id,
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
        },
        process.env.JWT_SECRETE,
        { expiresIn: "24h" }
      );
      return res.status(201).json({
        access_token: token,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
      });
    } else {
      return res.status(400).json({
        message: "Wrong password",
      });
    }
  } catch (error) {
    res.status(404).json({
      message: "Error while logging in",
    });
  }
}

async function updateProfile(req, res) {
  try {
    const { success } = UpdateProfileBody.safeParse(req.body);

    if (!success) return res.status(411).json({ message: "Invalid inputs" });

    await User.findOneAndUpdate(
      { _id: req.headers["userid"] },
      {
        ...req.body,
        ...(req.body?.password
          ? genratePasswordHashAndSalt(req.body.password)
          : {}),
      },
      { returnDocument: "after" }
    );
    res.status(200).json({ message: "Profile updated succesfully" });
  } catch (error) {
    res.status(404).json(error);
  }
}

async function getUsersList(req, res) {
  try {
    const filter = req.query.filter || "";

    const users = await User.find({
      $or: [
        {
          firstname: {
            $regex: filter,
          },
        },
        {
          lastname: {
            $regex: filter,
          },
        },
      ],
    });

    return res.json({
      user: users
        .filter((user) => user._id !== req.headers["userid"])
        .map((user) => ({
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          _id: user._id,
        })),
    });
  } catch (error) {
    res.status(404).json(error);
  }
}

module.exports = {
  signup,
  signin,
  updateProfile,
  getUsersList,
};
