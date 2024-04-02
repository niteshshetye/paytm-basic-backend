const zod = require("zod");
const mongoose = require("mongoose");
const { Account } = require("../models/account");

const TransferBalanceBody = zod.object({
  to: zod.string(),
  amount: zod.number(),
});

async function getBalance(req, res) {
  try {
    const account = await Account.findOne({
      userId: req.headers["userid"],
    });

    return res.status(200).json({ balance: account.balance });
  } catch (error) {
    return res.status(401).json(error);
  }
}

async function transferBalance(req, res) {
  try {
    const session = await mongoose.startSession();

    const { success } = TransferBalanceBody.safeParse(req.body);

    if (!success) return res.status(411).json({ message: "Invalid inputs" });

    session.startTransaction();

    const userAccount = await Account.findOne({
      userId: req.headers["userid"],
    }).session(session);

    if (userAccount.balance < req.body.amount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Insufficient balance",
      });
    }

    const toAccount = await Account.findOne({
      userId: req.body.to,
    }).session(session);

    if (!toAccount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Invalid account",
      });
    }

    // Decrement from your account
    await Account.updateOne(
      { userId: req.headers["userid"] },
      {
        $inc: {
          balance: -req.body.amount,
        },
      }
    ).session(session);

    // increment in your account
    await Account.updateOne(
      { userId: req.body.to },
      {
        $inc: {
          balance: req.body.amount,
        },
      }
    ).session(session);

    // Commit the transaction
    await session.commitTransaction();

    return res.status(200).json({ message: "Transfer successful" });
  } catch (error) {
    return res.status(404).json({ message: "something went wrong" });
  }
}

module.exports = {
  getBalance,
  transferBalance,
};
