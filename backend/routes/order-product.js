const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router();

// Add product to order
router.post("/", async (req, res) => {
    try {
        const { customerOrderId, productId, quantity } = req.body;

        // Validation
        if (!customerOrderId || !productId || !quantity) {
            return res.status(400).json({
                error: "Validation failed",
                details: "customerOrderId, productId, and quantity are required"
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                error: "Validation failed",
                details: "Quantity must be greater than 0"
            });
        }

        // Check if order exists
        const order = await prisma.customer_order.findUnique({
            where: { id: customerOrderId }
        });

        if (!order) {
            return res.status(404).json({
                error: "Order not found"
            });
        }

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({
                error: "Product not found"
            });
        }

        // Check if product is already in order
        const existingOrderProduct = await prisma.customer_order_product.findFirst({
            where: {
                customerOrderId,
                productId
            }
        });

        if (existingOrderProduct) {
            // Update quantity
            const updatedOrderProduct = await prisma.customer_order_product.update({
                where: { id: existingOrderProduct.id },
                data: { quantity: existingOrderProduct.quantity + quantity }
            });

            return res.json(updatedOrderProduct);
        }

        // Create new order product
        const orderProduct = await prisma.customer_order_product.create({
            data: {
                customerOrderId,
                productId,
                quantity
            }
        });

        res.status(201).json(orderProduct);
    } catch (error) {
        console.error("Error adding product to order:", error);
        res.status(500).json({
            error: "Failed to add product to order",
            details: error.message
        });
    }
});

// Get all order products
router.get("/", async (req, res) => {
    try {
        const orderProducts = await prisma.customer_order_product.findMany({
            include: {
                customerOrder: true,
                product: true
            }
        });

        res.json(orderProducts);
    } catch (error) {
        console.error("Error fetching order products:", error);
        res.status(500).json({
            error: "Failed to fetch order products",
            details: error.message
        });
    }
});

// Get order products by order ID
router.get("/order/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;

        const orderProducts = await prisma.customer_order_product.findMany({
            where: { customerOrderId: orderId },
            include: {
                product: true
            }
        });

        res.json(orderProducts);
    } catch (error) {
        console.error("Error fetching order products:", error);
        res.status(500).json({
            error: "Failed to fetch order products",
            details: error.message
        });
    }
});

// Update order product quantity
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                error: "Validation failed",
                details: "Quantity must be greater than 0"
            });
        }

        const orderProduct = await prisma.customer_order_product.update({
            where: { id },
            data: { quantity }
        });

        res.json(orderProduct);
    } catch (error) {
        console.error("Error updating order product:", error);
        res.status(500).json({
            error: "Failed to update order product",
            details: error.message
        });
    }
});

// Delete order product
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.customer_order_product.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting order product:", error);
        res.status(500).json({
            error: "Failed to delete order product",
            details: error.message
        });
    }
});

module.exports = router;
