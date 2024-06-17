import express from "express";

import { checkPermission } from "../middlewares/checkPermission.js";
import { createImageProduct, deleteImages, getAllImages, getAllImagesByProductId, updateImages } from "../controllers/image.js";
import { upload } from "../middlewares/upload.js";

const routerImage = express.Router();
routerImage.get("/:productId", checkPermission, getAllImagesByProductId);
routerImage.get("/", checkPermission, getAllImages);
routerImage.post("/", checkPermission, upload.array("images", 10), createImageProduct);
routerImage.delete("/deleteImages", checkPermission, deleteImages);
routerImage.put("/update", checkPermission, updateImages);
export default routerImage;
