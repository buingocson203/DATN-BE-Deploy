import express from "express";

import { checkPermission } from "../middlewares/checkPermission.js";
import {
  create,
  getAll,
  getDetail,
  update,
  remove,
} from "../controllers/variant.js";


const routerVariant = express.Router();
routerVariant.get("/", getAll);
routerVariant.get("/:id", getDetail);
routerVariant.post("/", checkPermission, create);
routerVariant.put("/:id", checkPermission, update);
routerVariant.delete("/:id", checkPermission, remove);
export default routerVariant;
