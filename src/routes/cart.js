import express from "express";

import { checkPermission } from "../middlewares/checkPermission.js";
import { createCart, getCart } from "../controllers/cart.js";



const routerCart = express.Router();
routerCart.post("/", checkPermission, createCart);
routerCart.get("/:idUser", checkPermission, getCart)
export default routerCart;
