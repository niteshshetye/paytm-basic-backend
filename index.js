require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const userRouter = require("./router/user");
const accountRouter = require("./router/account");

const ENV_TYPE = {
  local: "local",
  cloud: "cloud",
};

const env = ENV_TYPE.local;

const server = express();

server.use(cors());
server.use(express.json());
server.use(morgan("common"));

server.use("/api/v1/auth/", userRouter.router);
server.use("/api/v1/account/", accountRouter.router);

// Connect to cloud database
async function connectToDb() {
  try {
    await mongoose.connect(
      env === "local"
        ? process.env.LOCAL_MONGO_URL
        : process.env.CLOUD_MONGO_URL
    );
    console.log("connected to database....!", env);
  } catch (error) {
    console.error("Error In Database connection: ", error);
  }
}

server.listen(process.env.PORT, () => {
  connectToDb();
  console.log(`server running on port ${process.env.PORT}`);
});
