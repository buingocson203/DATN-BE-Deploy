import express from "express";
import { createOrder, getAllOrders, getOrderDetail, updateOrder } from "../controllers/order.js";
import checkoutVnpay from "../controllers/vnpay.js";
import { checkPermission } from "../middlewares/checkPermission.js"; // Import middleware

const orderRouter = express.Router();

orderRouter.post("/create-order", checkPermission, createOrder);
orderRouter.post("/create-order-vnpay", async (req, res) => {
  try {
    // Call vnpay payment function
    const { url, vnp_TxnRef } = await checkoutVnpay.payment(req, res);
    // Add vnp_TxnRef to the request body as codeOrders
    req.body.codeOrders = vnp_TxnRef;
    req.body.paymentMethod = "vnpay"; // Ensure the payment method is set to vnpay
    // Call createOrder function
    const createOrderResponse = await createOrder(req, res);
    // Send the payment URL as the response
    res.json({ paymentUrl: url, order: createOrderResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
orderRouter.get("/orders", checkPermission, getAllOrders);
orderRouter.get("/orders/:orderId", checkPermission, getOrderDetail);
orderRouter.patch("/update-order/:orderId", checkPermission, updateOrder);

export default orderRouter;