const router = require("express").Router();
const c = require("../controllers/cart.controller");
const protect = require("../middlewares/auth.middleware");

router.use(protect);
router.get("/", c.getCart);
router.post("/:productId", c.addToCart);
router.patch("/:productId", c.updateQuantity);
router.delete("/:productId", c.removeFromCart);

module.exports = router;
