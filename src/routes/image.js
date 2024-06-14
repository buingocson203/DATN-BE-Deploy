import express from "express";

import { checkPermission } from "../middlewares/checkPermission.js";
import { createImageProduct, deleteImages, getAllImages, getAllImagesByProductId } from "../controllers/image.js";

const routerImage = express.Router();
routerImage.get("/:productId", checkPermission, getAllImagesByProductId);
routerImage.get("/", checkPermission, getAllImages);
routerImage.post("/", checkPermission, createImageProduct);
routerImage.delete("/deleteImages", checkPermission, deleteImages);
// routerProductDetail.put("/:id", checkPermission, updateProductDetail);
// routerProductDetail.delete("/:id", checkPermission, deleteProductDetail);
export default routerImage;
