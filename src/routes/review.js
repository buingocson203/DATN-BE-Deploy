import express from "express";
import { checkPermission } from "../middlewares/checkPermission.js";
import { createReview, getProductReviews, getReviewDetail } from "../controllers/review.js";

const routerReview = express.Router();
routerReview.post("/reviews", checkPermission, createReview);
routerReview.get("/reviews/:productId/list-review", checkPermission, getProductReviews);
routerReview.get("/reviews/:reviewId", checkPermission, getReviewDetail);
export default routerReview;