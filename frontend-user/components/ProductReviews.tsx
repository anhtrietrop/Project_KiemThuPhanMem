// *********************
// Role of the component: Display product reviews with ability to add review if user has purchased
// Name of the component: ProductReviews.tsx
// Developer: Auto-generated
// Version: 1.0
// Component call: <ProductReviews productId={productId} />
// Input parameters: { productId: string }
// Output: List of product reviews with rating summary and review form
// *********************

"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaStar, FaRegStar } from "react-icons/fa6";
import apiClient from "@/lib/api";

interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
  };
}

interface ReviewsResponse {
  reviews: Review[];
  total: number;
  averageRating: number;
  pagination: {
    page: number;
    totalPages: number;
  };
}

interface ProductReviewsProps {
  productId: string;
}

const StarRating = ({ rating, size = "text-lg" }: { rating: number; size?: string }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= rating ? (
            <FaStar className={`text-yellow-400 ${size}`} />
          ) : (
            <FaRegStar className={`text-gray-300 ${size}`} />
          )}
        </span>
      ))}
    </div>
  );
};

const ReviewForm = ({ 
  productId, 
  onReviewSubmitted 
}: { 
  productId: string; 
  onReviewSubmitted: () => void;
}) => {
  const { data: session } = useSession();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID from email
  useEffect(() => {
    const getUserId = async () => {
      if (session?.user?.email) {
        try {
          const userResponse = await apiClient.get(`/api/users/email/${session.user.email}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserId(userData?.id);
          }
        } catch {
          // User not found
        }
      }
    };
    getUserId();
  }, [session?.user?.email]);

  useEffect(() => {
    const checkCanReview = async () => {
      if (!userId) {
        if (!session?.user?.email) {
          setCanReview(false);
          setCheckingEligibility(false);
        }
        return;
      }

      try {
        const response = await apiClient.get(
          `/api/reviews/can-review/${productId}`,
          {
            headers: {
              'X-User-Id': userId,
            },
          }
        );
        const data = await response.json();
        setCanReview(data.canReview);
      } catch {
        setCanReview(false);
      } finally {
        setCheckingEligibility(false);
      }
    };

    checkCanReview();
  }, [userId, productId, session?.user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !userId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post(
        "/api/reviews",
        { productId, rating, comment, userId },
        {
          headers: {
            'X-User-Id': userId,
          },
        }
      );

      if (response.ok) {
        setComment("");
        setRating(5);
        onReviewSubmitted();
      } else {
        const data = await response.json();
        setError(data.error || "Không thể gửi đánh giá");
      }
    } catch {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingEligibility) {
    return <div className="text-gray-500">Đang kiểm tra...</div>;
  }

  if (!session) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-600">
          Vui lòng <a href="/login" className="text-blue-600 hover:underline">đăng nhập</a> để đánh giá sản phẩm
        </p>
      </div>
    );
  }

  if (!canReview) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-yellow-700">
          ⚠️ Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành công.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg">
      <h4 className="text-lg font-semibold mb-4">Viết đánh giá của bạn</h4>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Đánh giá sao</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="text-2xl focus:outline-none"
            >
              {star <= rating ? (
                <FaStar className="text-yellow-400" />
              ) : (
                <FaRegStar className="text-gray-300 hover:text-yellow-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Nhận xét</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
      </button>
    </form>
  );
};

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchReviews = async () => {
    try {
      const response = await apiClient.get(
        `/api/reviews/product/${productId}?page=${page}&limit=5`
      );
      if (response.ok) {
        const data = await response.json();
        setReviewsData(data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, page]);

  const handleReviewSubmitted = () => {
    fetchReviews();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Rating Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex items-center gap-6 max-sm:flex-col max-sm:items-start">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-800">
              {reviewsData?.averageRating?.toFixed(1) || "0.0"}
            </div>
            <StarRating rating={Math.round(reviewsData?.averageRating || 0)} size="text-xl" />
            <div className="text-gray-500 text-sm mt-1">
              {reviewsData?.total || 0} đánh giá
            </div>
          </div>
          <div className="flex-1">
            {/* Rating distribution could go here */}
          </div>
        </div>
      </div>

      {/* Review Form */}
      <div className="mb-8">
        <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Đánh giá từ khách hàng</h3>
        
        {reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
          <>
            {reviewsData.reviews.map((review) => (
              <article
                key={review.id}
                className="bg-white p-6 rounded-lg shadow-sm border"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {review.user?.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {review.user?.email?.split("@")[0] || "Khách hàng"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <StarRating rating={review.rating} />
                </div>
                
                {review.comment && (
                  <p className="text-gray-600">{review.comment}</p>
                )}
                
                <div className="mt-3 text-xs text-green-600 flex items-center gap-1">
                  ✓ Đã mua hàng
                </div>
              </article>
            ))}

            {/* Pagination */}
            {reviewsData.pagination && reviewsData.pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Trước
                </button>
                <span className="px-4 py-2">
                  Trang {page} / {reviewsData.pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(reviewsData.pagination.totalPages, p + 1))}
                  disabled={page === reviewsData.pagination.totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>Chưa có đánh giá nào cho sản phẩm này.</p>
            <p className="text-sm mt-2">Hãy là người đầu tiên đánh giá!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
