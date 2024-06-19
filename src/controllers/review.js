import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import ProductDetail from "../models/ProductDetail.js";
import Image from "../models/Image.js";

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

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Lấy toàn bộ đánh giá của sản phẩm
    const reviews = await Review.find({ productId }).populate(
      "idAccount",
      "userName email"
    );

    return res.status(200).json({
      message: "Fetch Product Reviews Successful",
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getReviewDetail = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Tìm đánh giá theo reviewId
    const review = await Review.findById(reviewId).populate(
      "idAccount",
      "userName email"
    );
    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    // Tìm sản phẩm liên quan đến đánh giá
    const product = await Product.findById(review.productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Tìm thông tin chi tiết của sản phẩm được đánh giá
    const productDetail = await ProductDetail.findOne({
      product: review.productId,
    }).populate("sizes");

    // Tìm hình ảnh có type là "thumbnail" của sản phẩm
    const images = await Image.find({
      productId: product._id,
      type: "thumbnail",
    });

    // Tạo đối tượng chứa thông tin chi tiết đánh giá và thông tin sản phẩm
    const reviewDetail = {
      review: {
        _id: review._id,
        idAccount: review.idAccount,
        content: review.content,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      },
      product: {
        _id: product._id,
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        status: product.status,
        productDetail: {
          _id: productDetail._id,
          quantity: productDetail.quantity,
          price: productDetail.price,
          importPrice: productDetail.importPrice,
          promotionalPrice: productDetail.promotionalPrice,
          size: productDetail.sizes
            ? {
                _id: productDetail.sizes._id,
                size: productDetail.sizes.size,
              }
            : null,
        },
        images: images.map((image) => ({
          _id: image._id,
          imageUrl: image.image,
          type: image.type,
        })),
      },
    };

    return res.status(200).json({
      message: "Fetch Review Detail Successful",
      data: reviewDetail,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};