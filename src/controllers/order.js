// import Order from "../models/Order.js";
// import Product from "../models/Product.js";
// import { orderValid } from "../validation/order.js";

// // Hàm sinh chuỗi ngẫu nhiên
// function generateRandomCode(length) {
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   let result = '';
//   const charactersLength = characters.length;
//   for (let i = 0; i < length; i++) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength));
//   }
//   return result;
// }

// export const createOrder = async (req, res) => {
//   try {
//     const body = req.body;

//     // Kiểm tra và sinh codeOrders nếu payment_type là "cod"
//     if (body.payment_type === "cod") {
//       body.codeOrders = generateRandomCode(8);
//     }

//     // Validate body order data
//     const { error } = orderValid.validate(body, { abortEarly: false });
//     if (error) {
//       const errors = error.details.map((err) => err.message);
//       return res.status(400).json({
//         message: errors,
//       });
//     }

//     const newOrder = new Order(body);
//     for (const product of newOrder.productDetails) {
//       const { productId } = product;

//       // Check if product exists
//       const productExist = await Product.findById(productId);
//       if (!productExist) {
//         return res.status(404).json({
//           message: "Product not found",
//         });
//       }
//     }

//     // Save order to database
//     const order = await newOrder.save();

//     return res.status(200).json({
//       message: "Create Order Successful",
//       data: order,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message,
//     });
//   }
// };

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { orderValid } from "../validation/order.js";
import ProductDetail from "../models/ProductDetail.js";
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

    // Kiểm tra và sinh codeOrders nếu payment_type là "cod"
    if (body.payment_type === "cod") {
      body.codeOrders = generateRandomCode(8);
    } else if (body.payment_type === "vnpay") {
      // Kiểm tra và lấy giá trị codeOrders từ yêu cầu POST
      if (!body.codeOrders) {
        return res.status(400).json({
          message: "codeOrders is required for vnpay payment type",
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
    const orders = await Order.find().populate("user_id", "name email"); // Populating user details for each order
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
    const order = await Order.findById(orderId).populate(
      "user_id",
      "name email"
    );

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


export const getDetailOrderDone = async (req, res) => {
  try {
    const { productId } = req.params;

    // Thực hiện truy vấn để lấy chi tiết đơn hàng đã giao thành công dựa trên productId
    const order = await Order.findOne({
      status: "done",
      "productDetails.productId": productId,
    }).populate("user_id", "name email");

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


export const getDoneOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "done" })
      .populate({
        path: "productDetails",
        populate: {
          path: "productId",
          model: "Product",
          select: "name _id", // Chọn các trường name và _id của sản phẩm
        },
        select: "productId productName price image sizeId quantity", // Chọn các trường cần thiết từ productDetails
      })
      .populate("user_id", "name email");

    return res.status(200).json({
      message: "Fetch Done Orders Successful",
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};