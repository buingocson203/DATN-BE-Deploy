import express from "express";
import { createOrder } from "../controllers/order.js";
import checkoutVnpay from "../controllers/vnpay.js";
const orderRouter = express.Router();
orderRouter.post("/create-order", createOrder);
orderRouter.post("/create-order-vnpay", checkoutVnpay.payment);

export default orderRouter;
