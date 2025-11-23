const express = require("express");
const router = express.Router();
const {
  getAllMerchants,
  getMerchantById,
  createMerchant,
  updateMerchant,
    deleteMerchant,
    approveMerchant,
    rejectMerchant,
    getMerchantStatistics,
} = require("../controllers/merchant");

// Get all merchants
router.get("/", getAllMerchants);

// Get a specific merchant by ID
router.get("/:id", getMerchantById);

// Create a new merchant
router.post("/", createMerchant);

// Update a merchant
router.put("/:id", updateMerchant);

// Delete a merchant
router.delete("/:id", deleteMerchant);

// Admin: Approve a merchant
router.post("/:id/approve", approveMerchant);

// Admin: Reject a merchant
router.post("/:id/reject", rejectMerchant);

// Get merchant statistics
router.get("/:id/statistics", getMerchantStatistics);

module.exports = router;