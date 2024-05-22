import express from "express";
import routerAuth from "./auth.js";
import routerCategories from "./category.js";
const router = express.Router()
router.use('/categories',routerCategories)
router.use('/auth', routerAuth)
export default router