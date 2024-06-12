import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { orderValid } from "../validation/order.js";
export const createOrder = async (req, res) => {
  try {
    const body = req.body;

    //validate body order data
    const { error } = orderValid.validate(body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        message: errors,
      });
    }

    const newOrder = new Order(body);
    for (const product of newOrder.products) {
      const { product_id } = product;

      // Check if product exist
      const productExist = await Product.findById(product_id);
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
