import express from "express";

import { checkPermission } from "../middlewares/checkPermission.js";
import {
  create,
  getAll,
  getDetail,
  remove,
  update,
} from "../controllers/category.js";

const routerCategories = express.Router();
routerCategories.get("/", getAll);
routerCategories.get("/:id", getDetail);
routerCategories.post("/",  create);
routerCategories.put("/:id",  update);
routerCategories.delete("/:id",  remove);
export default routerCategories;
