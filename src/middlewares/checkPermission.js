import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();
const { SECRET_CODE } = process.env;

export const checkPermission = async (req, res, next) => {
  try {
    // B1: Kiểm tra người dùng đã đăng nhập hay chưa
    const token = req.headers.authorization?.split(" ")[1];
    // B2: Kiểm tra token
    if (!token) {
      return res.status(403).json({
        message: "Bạn chưa đăng nhập",
      });
    }
    // B3: Kiểm tra quyền của người dùng
    const decode = jwt.verify(token, SECRET_CODE);
    const user = await User.findById(decode._id);
    if (!user) {
      return res.status(403).json({
        message: "Token lỗi",
      });
    }
    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Bạn không có quyền làm việc này",
      });
    }
    // B4: Next
    req.user = user; // Lưu thông tin người dùng vào req để dùng trong controller
    next();
  } catch (error) {
    return res.json({
      name: error.name,
      message: error.message,
    });
  }
};
