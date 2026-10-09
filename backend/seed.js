// Run once: npm run seed  (adds sample products only if the collection is empty)
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/product.model");

const img = (t) => `https://placehold.co/400x300?text=${encodeURIComponent(t)}`;
const products = [
  { name: "Noise Cancelling Headphones", description: "Wireless over-ear headphones with active noise cancellation.", price: 4999, category: "Electronics", stock: 25 },
  { name: "Mechanical Keyboard", description: "RGB mechanical keyboard with blue switches.", price: 2999, category: "Electronics", stock: 10 },
  { name: "Wireless Mouse", description: "Ergonomic wireless mouse with USB receiver.", price: 1499, category: "Electronics", stock: 5 },
  { name: "Cotton T-Shirt", description: "Soft regular-fit cotton t-shirt.", price: 599, category: "Fashion", stock: 40 },
  { name: "Denim Jacket", description: "Classic blue denim jacket.", price: 2499, category: "Fashion", stock: 8 },
  { name: "Clean Code", description: "A handbook of agile software craftsmanship.", price: 899, category: "Books", stock: 15 },
  { name: "Atomic Habits", description: "Build good habits and break bad ones.", price: 499, category: "Books", stock: 30 },
  { name: "Table Lamp", description: "LED table lamp with adjustable brightness.", price: 1299, category: "Home", stock: 12 },
].map((p) => ({ ...p, image: img(p.name) }));

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  if ((await Product.countDocuments()) === 0) {
    await Product.insertMany(products);
    console.log("Sample products added");
  } else console.log("Products already exist, nothing added");
  await mongoose.disconnect();
})();
