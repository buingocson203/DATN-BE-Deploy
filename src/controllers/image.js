import Image from "../models/Image.js";
import { imageValid } from "../validation/images.js";
import mongoose from "mongoose";

export const createImageProduct = async (req, res) => {
  try {
    // Validate the request body
    const { error } = imageValid.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message || "Dữ liệu không hợp lệ",
      });
    }

    // Create the new image
    const newImage = await Image.create(req.body);
    if (!newImage) {
      return res.status(404).json({
        message: "Thêm ảnh sản phẩm không thành công",
      });
    }
    return res.status(200).json({
      message: "Ảnh sản phẩm đã được tạo thành công",
      data: newImage,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
