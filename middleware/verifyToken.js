const jwt = require("jsonwebtoken");

async function verifyToken(req, res, next) {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "Unauthorized" });

    const user = await jwt.verify(token, process.env.JWT_SECRETE);

    if (!user) return res.status(403).json({ message: "Unauthorized" });

    req.headers["userid"] = user.id;

    next();
  } catch (error) {
    return res.status(403).json({ message: "Unauthorized" });
  }
}

exports.verifyToken = verifyToken;
