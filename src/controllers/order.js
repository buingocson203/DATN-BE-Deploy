import Order from "../models/Order.js";
import ProductDetail from "../models/ProductDetail.js";
import Cart from "../models/Cart.js";
import { orderValid } from "../validation/order.js";
import Review from "../models/Review.js";
// Hàm sinh chuỗi ngẫu nhiên
function generateRandomCode(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


export const createOrder = async (req, res) => {
  try {
    const body = req.body;

    // Kiểm tra và sinh codeOrders nếu paymentMethod là "cod"
    if (body.paymentMethod === "cod") {
      body.codeOrders = generateRandomCode(8);
      body.paymentStatus = "unpaid";
      body.orderStatus = "pending"; // Đơn hàng bắt đầu ở trạng thái pending
    } else if (body.paymentMethod === "vnpay") {
      // Kiểm tra và lấy giá trị codeOrders từ yêu cầu POST
      if (!body.codeOrders) {
        return res.status(400).json({
          message: "codeOrders is required for vnpay payment method",
        });
      }
      body.paymentStatus = "paid";
      body.orderStatus = "done"; // Đơn hàng được hoàn tất ngay lập tức
    }

    // Validate body order data
    const { error } = orderValid.validate(body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        message: errors,
      });
    }

    const newOrder = new Order(body);
    for (const product of newOrder.productDetails) {
      const { productDetailId } = product;

      // Check if product exists
      const productExist = await ProductDetail.findById(productDetailId);
      if (!productExist) {
        return res.status(404).json({
          message: "ProductDetail not found",
        });
      }
    }

    // Save order to database
    const order = await newOrder.save();

    // Xóa các mục trong giỏ hàng liên quan đến đơn hàng vừa được tạo thành công
    const productDetailIds = newOrder.productDetails.map(product => product.productDetailId);
    await Cart.deleteMany({
      user: order.user_id,
      productDetail: { $in: productDetailIds }
    });
    if (body.paymentMethod === "vnpay") {
      return order;
    }

    return res.status(200).json({
      message: "Create Order Successful",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


// Các chức năng khác giữ nguyên
// export const getAllOrders = async (req, res) => {
//   try {
//     const { user } = req;
//     const { status } = req.query;

//     let filter = {};

//     if (user.role !== "admin") {
//       filter.user_id = user._id;
//     }

//     if (status) {
//       filter.orderStatus = status;
//     }

//     // Fetch orders based on filter criteria
//     const orders = await Order.find(filter)
//       .populate("user_id", "userName email")
//       .sort({ createdAt: -1 });

//     // Iterate through each order
//     const ordersWithReviews = await Promise.all(
//       orders.map(async (order) => {
//         // Iterate through each productDetail in the order
//         const productDetailsWithReviews = await Promise.all(
//           order.productDetails.map(async (productDetail) => {
//             // Fetch reviews for the current productId
//             const reviews = await Review.find({
//               productId: productDetail.productId,
//               idAccount: user._id, // Assuming you want reviews by the logged-in user
//             });

//             // Check if the user has reviewed this product
//             const isRated = reviews.length > 0;

//             // Add isRated field to productDetail
//             return {
//               ...productDetail.toObject(),
//               isRated: isRated,
//             };
//           })
//         );

//         // Return the order with updated productDetails including isRated
//         return {
//           ...order.toObject(),
//           productDetails: productDetailsWithReviews,
//         };
//       })
//     );

//     return res.status(200).json({
//       message: "Fetch All Orders Successful",
//       data: ordersWithReviews,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message,
//     });
//   }
// };


export const getAllOrders = async (req, res) => {
  try {
    const { user } = req;
    const { status } = req.query;

    let filter = {};

    if (user.role !== "admin") {
      filter.user_id = user._id;
    }

    if (status) {
      filter.orderStatus = status;
    }

    // Fetch orders based on filter criteria
    const orders = await Order.find(filter)
      .populate("user_id", "userName email")
      .sort({ createdAt: -1 });

    // Iterate through each order
    const ordersWithReviews = await Promise.all(
      orders.map(async (order) => {
        // Fetch reviews for all productDetails in the order
        const productDetailIds = order.productDetails.map((pd) => pd.productId);

        const reviews = await Review.find({
          idAccount: user._id,
          productId: { $in: productDetailIds },
        });

        // Create a map to store isRated status for each productId
        const isRatedMap = {};
        reviews.forEach((review) => {
          isRatedMap[review.productId.toString()] = true;
        });

        // Add isRated field to order
        const isRatedOrder = order.productDetails.some((pd) =>
          isRatedMap.hasOwnProperty(pd.productId.toString())
        );

        const orderWithIsRated = {
          ...order.toObject(),
          isRated: isRatedOrder,
        };

        return orderWithIsRated;
      })
    );

    return res.status(200).json({
      message: "Fetch All Orders Successful",
      data: ordersWithReviews,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { user } = req;

    const order = await Order.findById(orderId).populate("user_id", "userName email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Kiểm tra quyền của người dùng
    if (user.role !== "admin" && order.user_id._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập chi tiết đơn hàng này",
      });
    }

    return res.status(200).json({
      message: "Fetch Order Detail Successful",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;
    const { user } = req; // Lấy thông tin người dùng từ req.user

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Define valid transitions
    const validTransitions = {
      pending: ["waiting", "cancel"], // Chỉ admin có thể chuyển từ pending sang waiting hoặc cancel
      waiting: ["delivering", "cancel"], // Chỉ admin có thể chuyển từ waiting sang delivering hoặc cancel
      delivering: ["done"], // Chỉ admin có thể chuyển từ delivering sang done
      done: [],
      cancel: [],
    };

    // Kiểm tra quyền của user và điều chỉnh validTransitions
    if (user.role === "user" && order.orderStatus !== "pending") {
      return res.status(403).json({
        message: "Bạn không có quyền thay đổi trạng thái đơn hàng này",
      });
    }

    // Kiểm tra trạng thái hợp lệ
    if (!validTransitions[order.orderStatus].includes(orderStatus)) {
      return res.status(400).json({
        message: `Invalid status transition from ${order.orderStatus} to ${orderStatus}`,
      });
    }

    // Nếu trạng thái chuyển thành "done", giảm số lượng của từng sản phẩm trong đơn hàng
    if (orderStatus === "done") {
      for (const product of order.productDetails) {
        const { productDetailId, quantityOrders } = product;
        const productDetailRecord = await ProductDetail.findById(productDetailId);
        if (productDetailRecord) {
          productDetailRecord.quantity -= quantityOrders;
          await productDetailRecord.save();
        } else {
          return res.status(404).json({
            message: `ProductDetail with ID ${productDetailId} not found`,
          });
        }
      }

      if (order.paymentMethod === "cod") {
        order.paymentStatus = "paid"; // Cập nhật paymentStatus khi orderStatus chuyển thành "done"
      }
    }

    order.orderStatus = orderStatus;
    await order.save();

    return res.status(200).json({
      message: "Update Order Successful",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};






