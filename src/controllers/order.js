import Order from "../models/Order.js";
import ProductDetail from "../models/ProductDetail.js"; // Thay đổi từ Product sang ProductDetail
import { orderValid } from "../validation/order.js";

// Hàm sinh chuỗi ngẫu nhiên
function generateRandomCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
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
    } else if (body.paymentMethod === "vnpay") {
      // Kiểm tra và lấy giá trị codeOrders từ yêu cầu POST
      if (!body.codeOrders) {
        return res.status(400).json({
          message: "codeOrders is required for vnpay payment method",
        });
      }
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
    const orders = await Order.find().populate('user_id', 'name email'); // Populating user details for each order
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
    const order = await Order.findById(orderId).populate('user_id', 'name email');

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
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

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Define valid transitions
    const validTransitions = {
      pending: ["waiting"],
      waiting: ["delivering"],
      delivering: ["done", "cancel"],
      done: [],
      cancel: [],
    };

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
