const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create review (must have purchased product)
async function createReview(request, response) {
  try {
    const { productId, rating, comment } = request.body;
    const userId = request.user.id;

    if (!productId || !rating) {
      return response.status(400).json({ error: "Product ID and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return response.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return response.status(404).json({ error: "Product not found" });
    }

    // Check if user has purchased this product (simplified - check orders)
    const hasPurchased = await prisma.customer_order_product.findFirst({
      where: {
        productId: productId,
        customerOrder: {
          userId: userId,
          status: { in: ['delivered', 'completed'] }
        }
      },
      include: {
        customerOrder: true
      }
    });

    if (!hasPurchased) {
      return response.status(403).json({ 
        error: "You can only review products you have purchased",
        message: "Order must be delivered before you can review"
      });
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: productId,
        userId: userId,
      },
    });

    if (existingReview) {
      return response.status(409).json({ error: "You have already reviewed this product" });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        comment: comment || '',
        orderId: hasPurchased.customerOrder.id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          }
        }
      }
    });

    // Update product average rating
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true }
    });
    
    const avgRating = Math.round(
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    );

    await prisma.product.update({
      where: { id: productId },
      data: { rating: avgRating }
    });

    return response.status(201).json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    return response.status(500).json({ error: "Error creating review" });
  }
}

// Get reviews for a product
async function getProductReviews(request, response) {
  try {
    const { productId } = request.params;
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.review.count({
      where: { productId }
    });

    return response.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return response.status(500).json({ error: "Error fetching reviews" });
  }
}

// Update review
async function updateReview(request, response) {
  try {
    const { id } = request.params;
    const { rating, comment } = request.body;
    const userId = request.user.id;

    if (rating && (rating < 1 || rating > 5)) {
      return response.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return response.status(404).json({ error: "Review not found" });
    }

    if (existingReview.userId !== userId) {
      return response.status(403).json({ error: "You can only update your own reviews" });
    }

    const review = await prisma.review.update({
      where: { id },
      data: {
        ...(rating && { rating }),
        ...(comment !== undefined && { comment }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          }
        }
      }
    });

    // Update product average rating
    const reviews = await prisma.review.findMany({
      where: { productId: existingReview.productId },
      select: { rating: true }
    });
    
    const avgRating = Math.round(
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    );

    await prisma.product.update({
      where: { id: existingReview.productId },
      data: { rating: avgRating }
    });

    return response.json(review);
  } catch (error) {
    console.error("Error updating review:", error);
    return response.status(500).json({ error: "Error updating review" });
  }
}

// Delete review
async function deleteReview(request, response) {
  try {
    const { id } = request.params;
    const userId = request.user.id;
    const userRole = request.user.role;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return response.status(404).json({ error: "Review not found" });
    }

    // Only owner or admin can delete
    if (review.userId !== userId && userRole !== 'admin') {
      return response.status(403).json({ error: "You can only delete your own reviews" });
    }

    const productId = review.productId;

    await prisma.review.delete({
      where: { id },
    });

    // Update product average rating
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true }
    });
    
    if (reviews.length > 0) {
      const avgRating = Math.round(
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      );
      await prisma.product.update({
        where: { id: productId },
        data: { rating: avgRating }
      });
    } else {
      await prisma.product.update({
        where: { id: productId },
        data: { rating: 0 }
      });
    }

    return response.status(204).send();
  } catch (error) {
    console.error("Error deleting review:", error);
    return response.status(500).json({ error: "Error deleting review" });
  }
}

// Get user's reviews
async function getUserReviews(request, response) {
  try {
    const userId = request.user.id;

    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            mainImage: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return response.json(reviews);
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return response.status(500).json({ error: "Error fetching user reviews" });
  }
}

// Get review statistics for a product
async function getReviewStats(request, response) {
  try {
    const { productId } = request.params;

    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true }
    });

    if (reviews.length === 0) {
      return response.json({
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      distribution[r.rating]++;
    });

    const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    return response.json({
      average: parseFloat(average.toFixed(2)),
      total: reviews.length,
      distribution
    });
  } catch (error) {
    console.error("Error fetching review stats:", error);
    return response.status(500).json({ error: "Error fetching review stats" });
  }
}

module.exports = {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getUserReviews,
  getReviewStats,
};
