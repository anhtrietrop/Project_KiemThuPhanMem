// *********************
// Role of the component: Review form for a product in completed order
// Name of the component: OrderProductReview.tsx
// Developer: Auto-generated
// Version: 1.0
// Component call: <OrderProductReview productId={productId} productTitle={title} userId={userId} onReviewSubmitted={callback} />
// Input parameters: { productId, productTitle, userId, onReviewSubmitted }
// Output: Review form with star rating and comment
// *********************

"use client";
import React, { useState, useEffect } from "react";
import { FaStar, FaRegStar } from "react-icons/fa6";
import apiClient from "@/lib/api";
import toast from "react-hot-toast";

interface OrderProductReviewProps {
  productId: string;
  productTitle: string;
  userId: string;
  onReviewSubmitted?: () => void;
}

const OrderProductReview = ({
  productId,
  productTitle,
  userId,
  onReviewSubmitted,
}: OrderProductReviewProps) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [existingReview, setExistingReview] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkCanReview = async () => {
      if (!userId) return;

      try {
        const response = await apiClient.get(
          `/api/reviews/can-review/${productId}`,
          {
            headers: {
              "X-User-Id": userId,
            },
          }
        );
        const data = await response.json();
        setCanReview(data.canReview);
        if (data.existingReviewId) {
          setExistingReview(true);
        }
      } catch {
        setCanReview(false);
      }
    };

    checkCanReview();
  }, [userId, productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsSubmitting(true);

    try {
      const response = await apiClient.post(
        "/api/reviews",
        { productId, rating, comment, userId },
        {
          headers: {
            "X-User-Id": userId,
          },
        }
      );

      if (response.ok) {
        toast.success(`Đã đánh giá ${productTitle} thành công!`);
        setComment("");
        setRating(5);
        setCanReview(false);
        setExistingReview(true);
        setIsExpanded(false);
        onReviewSubmitted?.();
      } else {
        const data = await response.json();
        toast.error(data.error || "Không thể gửi đánh giá");
      }
    } catch {
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (existingReview) {
    return (
      <div className="text-green-600 text-sm flex items-center gap-1">
        ✓ Đã đánh giá
      </div>
    );
  }

  if (!canReview) {
    return null;
  }

  return (
    <div className="mt-2">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
        >
          <FaStar className="text-yellow-400" />
          Viết đánh giá
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mt-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium">Đánh giá:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-xl focus:outline-none"
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

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
          />

          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-300"
            >
              Hủy
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default OrderProductReview;
