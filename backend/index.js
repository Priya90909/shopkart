require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();
const dns = require("node:dns");
const dnsServers = (process.env.MONGO_DNS_SERVERS || "")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);

if (dnsServers.length) dns.setServers(dnsServers);

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/customers", require("./routes/customer.routes"));
app.use("/products", require("./routes/product.routes"));
app.use("/wishlist", require("./routes/wishlist.routes"));
app.use("/cart", require("./routes/cart.routes"));
app.use("/orders", require("./routes/order.routes"));

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Server running on ${PORT}`)))
  .catch((err) => console.error("DB connection failed:", err.message));
