import express from "express";
import routerAuth from "./auth.js";
const router = express.Router()
router.use('/auth', routerAuth)
export default router