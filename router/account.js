const express = require("express");
const accountController = require("../controller/account");
const middelware = require("../middleware/verifyToken");

const router = express.Router();

router.use(middelware.verifyToken);

router.get("/balance", accountController.getBalance);
router.post("/transfer", accountController.transferBalance);

exports.router = router;
