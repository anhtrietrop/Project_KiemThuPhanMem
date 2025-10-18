const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = express.Router();

// Create a new order
router.post("/", async (req, res) => {
    try {
        const {
            name,
            lastname,
            phone,
            email,
            adress,
            apartment,
            status,
            total,
            city,
            orderNotice,
            userId
        } = req.body;

        // Validation
        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                error: "Validation failed",
                details: "Name must be at least 2 characters"
            });
        }

        if (!lastname || lastname.trim().length < 2) {
            return res.status(400).json({
                error: "Validation failed",
                details: "Lastname must be at least 2 characters"
            });
        }

        if (!phone || phone.replace(/[^0-9]/g, '').length < 10) {
            return res.status(400).json({
                error: "Validation failed",
                details: "Phone number must be at least 10 digits"
            });
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                error: "Validation failed",
                details: "Please enter a valid email address"
            });
        }

        if (!adress || adress.trim().length < 5) {
            return res.status(400).json({
                error: "Validation failed",
                details: "Address must be at least 5 characters"
            });
        }

        if (!city || city.trim().length < 5) {
            return res.status(400).json({
                error: "Validation failed",
                details: "City must be at least 5 characters"
            });
        }

        // Create order
        const order = await prisma.customer_order.create({
            data: {
                name: name.trim(),
                lastname: lastname.trim(),
                phone: phone.trim(),
                email: email.trim().toLowerCase(),
                adress: adress.trim(),
                apartment: apartment?.trim() || null,
                status: status || "processing",
                total: Math.round(total),
                city: city.trim(),
                orderNotice: orderNotice?.trim() || null,
                dateTime: new Date()
            }
        });

        res.status(201).json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({
            error: "Failed to create order",
            details: error.message
        });
    }
});

// Get all orders
router.get("/", async (req, res) => {
    try {
        const orders = await prisma.customer_order.findMany({
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                dateTime: 'desc'
            }
        });

        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({
            error: "Failed to fetch orders",
            details: error.message
        });
    }
});

// Get order by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.customer_order.findUnique({
            where: { id },
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json({
                error: "Order not found"
            });
        }

        res.json(order);
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({
            error: "Failed to fetch order",
            details: error.message
        });
    }
});

// Update order status
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                error: "Status is required"
            });
        }

        const order = await prisma.customer_order.update({
            where: { id },
            data: { status }
        });

        res.json(order);
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({
            error: "Failed to update order",
            details: error.message
        });
    }
});

module.exports = router;
