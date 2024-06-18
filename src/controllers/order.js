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



// export const getDoneProducts = async (req, res) => {
//   try {
//     const doneProducts = await Order.aggregate([
//       { $match: { status: "done" } }, // Lọc các đơn hàng có status là "done"
//       { $unwind: "$productDetails" }, // Giải nén mảng productDetails thành các bản ghi riêng lẻ
//       {
//         $lookup: {
//           from: "products", // Tên của collection chứa thông tin sản phẩm
//           localField: "productDetails.productId",
//           foreignField: "_id",
//           as: "productInfo",
//         },
//       },
//       {
//         $lookup: {
//           from: "sizes", // Tên của collection chứa thông tin về size
//           localField: "productDetails.sizeId",
//           foreignField: "_id",
//           as: "sizeDetails",
//         },
//       },
//       {
//         $addFields: {
//           productInfo: { $arrayElemAt: ["$productInfo", 0] }, // Lấy phần tử đầu tiên từ mảng productInfo
//           sizeInfo: { $arrayElemAt: ["$sizeDetails", 0] }, // Lấy phần tử đầu tiên từ mảng sizeDetails
//         },
//       },
//       {
//         $addFields: {
//           size: "$sizeInfo.size", // Lấy giá trị size từ sizeInfo
//         },
//       },
//       {
//         $project: {
//           productName: "$productInfo.name", // Lấy tên sản phẩm từ productInfo
//           size: 1, // Giữ lại trường size
//           totalPrice: {
//             $multiply: ["$productDetails.price", "$productDetails.quantity"],
//           }, // Tính totalPrice
//           status: "Giao hàng thành công", // Hardcoded status
//           productId: "$productDetails.productId", // Lấy productId làm ID của sản phẩm
//           price: "$productDetails.price", // Lấy price của sản phẩm
//           image: "$productDetails.image", // Lấy image của sản phẩm
//           sizeId: "$productDetails.sizeId", // Lấy sizeId của sản phẩm
//           quantity: "$productDetails.quantity", // Lấy quantity của sản phẩm
//         },
//       },
//     ]);

//     return res.status(200).json({
//       message: "Fetch Done Products Successful",
//       data: doneProducts,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message,
//     });
//   }
// };

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

// export const getDetailOrderDone = async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     // Tìm đơn hàng dựa vào _id và status là "done", populate các thông tin cần thiết
//     const order = await Order.findOne({ _id: orderId, status: "done" })
//       .populate("user_id", "name email")
//       .populate({
//         path: "productDetails",
//         populate: {
//           path: "productId",
//           model: "Product",
//           select: "name",
//         },
//       })
//       .populate("productDetails.sizeId", "size")
//       .exec();

//     if (!order) {
//       return res.status(404).json({
//         message: "Order not found or not done yet",
//       });
//     }

//     // Chuẩn bị dữ liệu để trả về
//     const formattedOrder = {
//       _id: order._id,
//       address: order.address,
//       phone: order.phone,
//       user_id: order.user_id,
//       productDetails: order.productDetails.map((detail) => ({
//         productId: detail.productId._id,
//         productName: detail.productId.name,
//         price: detail.price,
//         image: detail.image,
//         sizeId: detail.sizeId._id,
//         size: detail.sizeId.size,
//         quantity: detail.quantity,
//       })),
//       status: order.status,
//       total_price: order.total_price,
//       total_amount_paid: order.total_amount_paid,
//       payment_type: order.payment_type,
//       codeOrders: order.codeOrders,
//       createdAt: order.createdAt,
//       updatedAt: order.updatedAt,
//     };

//     return res.status(200).json({
//       message: "Fetch Order Detail Successful",
//       data: formattedOrder,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message,
//     });
//   }
// };


// export const getDoneOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ status: "done" }).populate(
//       "user_id",
//       "name email"
//     );

//     // Transform productDetails to be an object instead of an array
//     const transformedOrders = orders.map((order) => ({
//       ...order.toObject(),
//       productDetails: order.productDetails.reduce((acc, product) => {
//         const { productId, price, image, sizeId, quantity } = product;
//         acc[productId] = {
//           productId,
//           price,
//           image,
//           sizeId,
//           quantity,
//         };
//         return acc;
//       }, {}),
//     }));

//     return res.status(200).json({
//       message: "Fetch Done Orders Successful",
//       data: transformedOrders,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message,
//     });
//   }
// };


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