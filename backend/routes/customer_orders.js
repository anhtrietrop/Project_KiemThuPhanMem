const express = require('express');

const router = express.Router();

const {
  getCustomerOrder,
  createCustomerOrder,
  updateCustomerOrder,
  updateOrderStatus,
  deleteCustomerOrder,
  getAllOrders
} = require('../controllers/customer_orders');

router.route('/')
  .get(getAllOrders)
  .post(createCustomerOrder);

router.route('/:id')
  .get(getCustomerOrder)
  .put(updateCustomerOrder)
  .delete(deleteCustomerOrder);

router.route('/:id/status')
  .put(updateOrderStatus);


module.exports = router;