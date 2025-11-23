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

// Simple payment initiation stub (MOMO mock)
async function initiatePayment(request, response) {
  const { id } = request.params;
  if (!id) {
    return response.status(400).json({ error: 'Order ID required' });
  }
  return response.status(200).json({
    orderId: id,
    payUrl: `https://momo.mock/pay/${id}`,
    message: 'Mock payment initiated'
  });
}

router.route('/')
  .get(getAllOrders)
  .post(createCustomerOrder);

router.route('/:id')
  .get(getCustomerOrder)
  .put(updateCustomerOrder)
  .delete(deleteCustomerOrder);

router.route('/:id/status')
  .put(updateOrderStatus);

router.post('/:id/payment', initiatePayment);


module.exports = router;