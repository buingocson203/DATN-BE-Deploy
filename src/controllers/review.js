import Review from "../models/Review.js";
import Order from "../models/Order.js";


export const createReview = async (req, res) => {
  try {
    const { userId, orderId, reviews } = req.body;

    // Lấy thông tin đơn hàng
    const order = await Order.findOne({ _id: orderId, user_id: userId, orderStatus: "done" });

    if (!order) {
      return res.status(400).json({
        message: "Order not found or not completed.",
      });
    }

    // Kiểm tra reviews có đủ thông tin và có cùng số lượng với sản phẩm trong order không
    if (order.productDetails.length !== reviews.length) {
      return res.status(400).json({
        message: "Number of reviews does not match the number of products in the order.",
      });
    }

    const reviewPromises = order.productDetails.map((product, index) => {
      const { productId } = product;
      const { content } = reviews[index];
      
      // Tạo đánh giá mới cho từng sản phẩm
      const review = new Review({
        idAccount: userId,
        productId: productId,
        content: content,
      });

      return review.save();
    });

    // Chờ tất cả các đánh giá được lưu vào database
    const savedReviews = await Promise.all(reviewPromises);

    return res.status(201).json({
      message: "Reviews created successfully",
      data: savedReviews,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};