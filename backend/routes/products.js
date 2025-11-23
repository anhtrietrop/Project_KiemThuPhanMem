const express = require("express");

const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductById,
} = require("../controllers/products");

router.route("/").get(getAllProducts).post(createProduct);
router.get('/search', (req, res, next) => {
  req.query.query = req.query.q || req.query.query; // normalize q -> query
  next();
}, searchProducts);


router
  .route("/:id")
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
