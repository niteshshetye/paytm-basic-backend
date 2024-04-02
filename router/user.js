const express = require("express");
const userController = require("../controller/user");
const { verifyToken } = require("../middleware/verifyToken");

const router = express.Router();

router.post("/signup", userController.signup);
router.post("/signin", userController.signin);

router.use(verifyToken);
router.patch("/update/profile", userController.updateProfile);
router.get("/users/bulk", userController.getUsersList);

exports.router = router;
