import express from "express";

import {
  createOrder,
  getAllOrders,
  getOrderDetail,
  updateOrder,
} from "../controllers/order.js";
import checkoutVnpay from "../controllers/vnpay.js";
import { checkPermission } from "../middlewares/checkPermission.js";

const orderRouter = express.Router();
orderRouter.post("/create-order-vnpay", checkoutVnpay.payment);

orderRouter.post(
  "/check-paid-vnpay",

  checkoutVnpay.checkPaymentForVNPay2
);
orderRouter.post("/create-order", checkPermission, createOrder);
orderRouter.get("/orders", checkPermission, getAllOrders);
orderRouter.get("/orders/:orderId", checkPermission, getOrderDetail);
orderRouter.patch("/update-order/:orderId", checkPermission, updateOrder);

export default orderRouter;