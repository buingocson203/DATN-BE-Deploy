import express from "express";
import { checkPermission } from "../middlewares/checkPermission.js";
import { createReview } from "../controllers/review.js";

const routerReview = express.Router();
routerReview.post("/reviews", checkPermission, createReview);
export default routerReview;