const crypto = require('crypto');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getAllMerchants(request, response) {
  try {
    const merchants = await prisma.merchant.findMany({
      include: {
        products: true,
      },
    });
    return response.json(merchants);
  } catch (error) {
    console.error("Error fetching merchants:", error);
    return response.status(500).json({ error: "Error fetching merchants" });
  }
}

async function getMerchantById(request, response) {
  try {
    const { id } = request.params;
    const merchant = await prisma.merchant.findUnique({
      where: {
        id: id,
      },
      include: {
        products: true,
      },
    });

    if (!merchant) {
      return response.status(404).json({ error: "Merchant not found" });
    }

    return response.json(merchant);
  } catch (error) {
    console.error("Error fetching merchant:", error);
    return response.status(500).json({ error: "Error fetching merchant" });
  }
}

async function createMerchant(request, response) {
  try {
    const { name, email, phone, address, description, status } = request.body;

    if (!name || name.trim().length === 0) {
      return response.status(400).json({ error: "Merchant name is required" });
    }

    const merchant = await prisma.merchant.create({
      data: {
        id: crypto.randomUUID(),
        name: name.trim(),
        email,
        phone,
        address,
        description,
        status: status || "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return response.status(201).json(merchant);
  } catch (error) {
    console.error("Error creating merchant:", error);
    return response.status(500).json({ error: "Error creating merchant" });
  }
}

async function updateMerchant(request, response) {
  try {
    const { id } = request.params;
    const { name, email, phone, address, description, status } = request.body;

    const merchant = await prisma.merchant.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        email,
        phone,
        address,
        description,
        ...(status && { status }),
        updatedAt: new Date(),
      },
    });

    return response.json(merchant);
  } catch (error) {
    console.error("Error updating merchant:", error);
    return response.status(500).json({ error: "Error updating merchant" });
  }
}

async function deleteMerchant(request, response) {
  try {
    const { id } = request.params;
    
    // Check if merchant has products before deletion
    const merchant = await prisma.merchant.findUnique({
      where: { id },
      include: { products: true },
    });

    if (merchant?.products.length > 0) {
      return response.status(400).json({
        error: "Cannot delete merchant with existing products",
      });
    }

    await prisma.merchant.delete({
      where: {
        id: id,
      },
    });

    return response.status(204).send();
  } catch (error) {
    console.error("Error deleting merchant:", error);
    return response.status(500).json({ error: "Error deleting merchant" });
  }
}

// Admin: Approve merchant (UC1.41)
async function approveMerchant(request, response) {
  try {
    const { id } = request.params;
    const merchant = await prisma.merchant.findUnique({ where: { id } });
    if (!merchant) {
      return response.status(404).json({ error: "Merchant not found" });
    }
    const updatedMerchant = await prisma.merchant.update({
      where: { id },
      data: { status: "APPROVED", updatedAt: new Date() },
    });
    return response.json(updatedMerchant);
  } catch (error) {
    console.error("Error approving merchant:", error);
    return response.status(500).json({ error: "Error approving merchant" });
  }
}

// Admin: Reject merchant (UC1.42)
async function rejectMerchant(request, response) {
  try {
    const { id } = request.params;
    const { reason } = request.body;
    const merchant = await prisma.merchant.findUnique({ where: { id } });
    if (!merchant) {
      return response.status(404).json({ error: "Merchant not found" });
    }
    const updatedMerchant = await prisma.merchant.update({
      where: { id },
      data: { status: "REJECTED", updatedAt: new Date() },
    });
    return response.json({ ...updatedMerchant, rejectionReason: reason || "Not provided" });
  } catch (error) {
    console.error("Error rejecting merchant:", error);
    return response.status(500).json({ error: "Error rejecting merchant" });
  }
}

// Get merchant sales statistics (UC1.45)
async function getMerchantStatistics(request, response) {
  try {
    const { id } = request.params;
    const merchant = await prisma.merchant.findUnique({
      where: { id },
      include: {
        products: {
          include: { customerOrders: true },
        },
      },
    });
    if (!merchant) {
      return response.status(404).json({ error: "Merchant not found" });
    }
    const totalProducts = merchant.products.length;
    let totalSales = 0;
    let totalOrders = 0;
    merchant.products.forEach((product) => {
      totalOrders += product.customerOrders.length;
      product.customerOrders.forEach((order) => {
        totalSales += order.quantity * (product.price || 0);
      });
    });
    return response.json({
      merchantId: merchant.id,
      merchantName: merchant.name,
      statistics: {
        totalProducts,
        totalOrders,
        totalSales,
        averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching merchant statistics:", error);
    return response.status(500).json({ error: "Error fetching merchant statistics" });
  }
}

module.exports = {
  getAllMerchants,
  getMerchantById,
  createMerchant,
  updateMerchant,
  deleteMerchant,
  approveMerchant,
  rejectMerchant,
  getMerchantStatistics,
};