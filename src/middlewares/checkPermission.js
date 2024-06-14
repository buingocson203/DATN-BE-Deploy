import  jwt  from "jsonwebtoken"
import dotenv from "dotenv"
import User from "../models/User.js";

dotenv.config();
const {SECRET_CODE} = process.env;
export const checkPermission = async (req, res, next) => {
    try {
        // B1: kiem tra nguoi dung dang nhap hay chua
        const token = req.headers.authorization?.split(" ")[1]
        // B2: kiem tra token
        if(!token){
            return res.status(403).json({
                message: "Bạn chưa đăng nhập"
            })
        }
        // b3: Kiem tra quyen cua nguoi dung
        const decode = jwt.verify(token, SECRET_CODE)
        const user = await User.findById(decode._id)
        if(!user) {
            return res.status(403).json({
                message: "Token lỗi"
            })
        }
        if(user.role !== "admin") {
            return res.status(403).json({
                message: "Bạn không có quyền làm việc này"
            })
        }
        // b4: Next
        next()
    } catch (error) {
        return res.json({
            name: error.name,
            message: error.message
        })
    }
}