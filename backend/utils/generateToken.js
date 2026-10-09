const jwt = require("jsonwebtoken");

// Creates a JWT and stores it in an HttpOnly cookie
const generateToken = (res, id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

module.exports = generateToken;
