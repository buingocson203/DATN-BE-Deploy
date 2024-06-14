import express from "express";

import { checkPermission } from "../middlewares/checkPermission.js";
import { createImageProduct } from "../controllers/image.js";

const routerImage = express.Router();
// routerProductDetail.get("/", getAllProductDetail);
// routerProductDetail.get("/:id", getDetailProductDetail);
routerImage.post("/", checkPermission, createImageProduct);
// routerProductDetail.put("/:id", checkPermission, updateProductDetail);
// routerProductDetail.delete("/:id", checkPermission, deleteProductDetail);
export default routerImage;
