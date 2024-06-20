import express from "express";
import { createAccount, updateAccount, getAllAccounts, getAccountDetail } from "../controllers/Account.js";
import { checkPermission } from "../middlewares/checkPermission.js"; // Import middleware

const accountRouter = express.Router();

accountRouter.post("/accounts", checkPermission, createAccount);
accountRouter.patch("/accounts/:accountId", checkPermission, updateAccount);
accountRouter.get("/accounts", checkPermission, getAllAccounts);
accountRouter.get("/accounts/:accountId", checkPermission, getAccountDetail);

export default accountRouter;
