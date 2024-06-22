import { signInValidator, signUpValidator, updateUserAdminValidator, updateUserValidator } from "../validation/user.js";
import User from "../models/User.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const { SECRET_CODE } = process.env;
export const signUp = async (req, res) => {
  try {
    const { error } = signUpValidator.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        message: errors,
      });
    }

    const useExists = await User.findOne({ email: req.body.email });
    if (useExists) {
      return res.status(400).json({
        message: "Email đã tồn tại",
      });
    }

    const userNameExists = await User.findOne({ userName: req.body.userName });
    if (userNameExists) {
      return res.status(400).json({
        message: "Tên đăng nhập đã tồn tại",
      });
    }

    const hashedPassword = await bcryptjs.hash(req.body.password, 10);

    const user = await User.create({
      ...req.body,
      password: hashedPassword,
    });

    user.password = undefined;
    return res.status(200).json({
      message: "Thành công",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};

export const signIn = async (req, res) => {
  try {
    const { error } = signInValidator.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        message: errors,
      });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        message: "Email không tồn tại",
      });
    }

    if (user.block) {
      return res.status(403).json({
        message: "Tài khoản đã bị khóa. Vui lòng liên hệ với quản trị viên để biết thêm chi tiết.",
      });
    }

    const isMatch = await bcryptjs.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Sai mật khẩu",
      });
    }

    const accessToken = jwt.sign({ _id: user._id }, SECRET_CODE, {
      expiresIn: "1d",
    });

    user.password = undefined;
    return res.status(200).json({
      message: "Đăng nhập thành công",
      user,
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ name: error.name, message: error.message });
  }
};



export const updateUser = async (req, res) => {
  try {
    // Validate user input
    const { error } = updateUserValidator.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        message: errors,
      });
    }

    // Ensure the user is a "member"
    if (req.user.role !== "member") {
      return res.status(403).json({
        message: "Bạn không có quyền cập nhật thông tin người dùng",
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng để cập nhật",
      });
    }

    return res.status(200).json({
      message: "Cập nhật thông tin người dùng thành công",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};


export const updateUserAdmin = async (req, res) => {
  try {
    // Validate user input
    const { error } = updateUserAdminValidator.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        message: errors,
      });
    }

    // Ensure the user is an "admin"
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Bạn không có quyền cập nhật vai trò của người dùng",
      });
    }

    // Update user's role
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: { role: req.body.role } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng để cập nhật vai trò",
      });
    }

    updatedUser.password = undefined; // Ensure password is not returned
    return res.status(200).json({
      message: "Cập nhật vai trò người dùng thành công",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};


export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
      });
    }

    // Update the block status
    user.block = true;
    await user.save();

    return res.status(200).json({
      message: "Người dùng đã bị block thành công",
      user: user,
    });
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};