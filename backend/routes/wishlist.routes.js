const router = require("express").Router();
const c = require("../controllers/wishlist.controller");
const protect = require("../middlewares/auth.middleware");

router.use(protect);
router.get("/", c.getWishlist);
router.post("/:productId", c.addToWishlist);
router.delete("/:productId", c.removeFromWishlist);

module.exports = router;
