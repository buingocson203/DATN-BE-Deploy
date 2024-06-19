import Order from "../models/Order.js";
import ProductDetail from "../models/ProductDetail.js";
import { orderValid } from "../validation/order.js";
import Size from "../models/Size.js";

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
    } else if (body.paymentMethod === "vnpay") {
      // Kiểm tra và lấy giá trị codeOrders từ yêu cầu POST
      if (!body.codeOrders) {
        return res.status(400).json({
          message: "codeOrders is required for vnpay payment method",
        });
      }
      body.paymentStatus = "paid";
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



export const getAllOrders = async (req, res) => {
  try {
    const { user } = req;

    let orders;
    if (user.role === "admin") {
      // Nếu người dùng là admin, hiển thị tất cả đơn hàng
      orders = await Order.find().populate("user_id", "userName email").sort({ createdAt: -1 });
    } else {
      // Nếu người dùng là member, chỉ hiển thị đơn hàng của họ
      orders = await Order.find({ user_id: user._id }).populate("user_id", "userName email").sort({ createdAt: -1 });
    }

    return res.status(200).json({
      message: "Fetch All Orders Successful",
      data: orders,
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

    if (!order) {return res.status(404).json({
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
    const { orderStatus, paymentStatus } = req.body;
    const { user } = req; // Lấy thông tin người dùng từ req.user

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Define valid transitions
    const validTransitions = {
      pending: ["cancel"], // Chỉ user có thể chuyển từ pending sang cancel
      waiting: ["delivering", "cancel"], // Chỉ admin có thể chuyển từ waiting sang cancel
      delivering: ["done"],
      done: [],
      cancel: [],
    };

    // Kiểm tra quyền của user và điều chỉnh validTransitions
    if (user.role === "user" && order.orderStatus !== "pending") {
      return res.status(403).json({
        message: "Bạn không có quyền hủy đơn hàng này",
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
      // Cập nhật paymentStatus khi orderStatus chuyển thành "done"
      if (order.paymentMethod === "cod") {
        order.paymentStatus = "paid";
      }
    }

    order.orderStatus = orderStatus;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus; // Cập nhật paymentStatus nếu có trong yêu cầu
    }
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


