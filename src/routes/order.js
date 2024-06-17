import express from "express";
import { createOrder, getAllOrders, getOrderDetail } from "../controllers/order.js";
import checkoutVnpay from "../controllers/vnpay.js";
const orderRouter = express.Router();
orderRouter.post("/create-order", createOrder);
orderRouter.post("/create-order-vnpay", checkoutVnpay.payment);

orderRouter.get("/orders", getAllOrders);
orderRouter.get("/orders/:orderId", getOrderDetail);

export default orderRouter;
