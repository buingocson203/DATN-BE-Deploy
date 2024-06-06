import express from "express";
import routerProduct from "./product.js";
import routerAuth from "./auth.js";
import routerCategories from "./category.js";
import routerSize from "./size.js";
import routerProductDetail from "./productDetail.js";
import routerImage from "./image.js";
const router = express.Router();
router.use("/product", routerProduct);
router.use("/categories", routerCategories);
router.use("/auth", routerAuth);
router.use("/size", routerSize);
router.use("/productDetail", routerProductDetail)
router.use("/image", routerImage);
export default router;
