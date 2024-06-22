import express from "express"
import {Router} from "express"
import { blockUser, signIn, signUp, updateUser, updateUserAdmin,  } from "../controllers/auth.js"
import { checkPermission } from "../middlewares/checkPermission.js"

const routerAuth = Router()
routerAuth.post('/signup', signUp)
routerAuth.post('/signin', signIn)
routerAuth.put('/users/:userId', checkPermission, updateUser);
routerAuth.put('/user-admin/:userId', checkPermission, updateUserAdmin);
routerAuth.put('/user-block/:userId', checkPermission, blockUser);
export default routerAuth