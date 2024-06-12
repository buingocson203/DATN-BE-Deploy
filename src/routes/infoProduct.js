import express from "express";
import { getInfoProductDetails } from "../controllers/infoProduct.js";

const routerInfoProduct = express.Router();
routerInfoProduct.get("/", getInfoProductDetails);

export default routerInfoProduct;
