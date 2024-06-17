import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { orderValid } from "../validation/order.js";

export const createOrder = async (req, res) => {
  try {
    const body = req.body;

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
      const { productId } = product;

      // Check if product exists
      const productExist = await Product.findById(productId);
      if (!productExist) {
        return res.status(404).json({
          message: "Product not found",
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
