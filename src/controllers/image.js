import Image from "../models/Image.js";
import Product from "../models/Product.js";
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

    // Validate that images field is an array
    if (!Array.isArray(req.body.images) || req.body.images.length === 0) {
      return res.status(400).json({
        message: "Images field must be a non-empty array",
      });
    }

    // Create an array to hold the new images
    const newImages = [];

    // Loop through the images array and create each image
    for (const image of req.body.images) {
      // Check if productId is valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(image.productId)) {
        return res.status(400).json({
          message: "Invalid productId format",
        });
      }

      // Check if productId exists in the database
      const existingProduct = await Product.findById(image.productId);
      if (!existingProduct) {
        return res.status(404).json({
          message: "ProductId not found",
        });
      }

      const newImage = await Image.create({
        image: image.image,
        productId: image.productId,
        type: image.type,
      });
      newImages.push(newImage);
    }

    return res.status(200).json({
      message: "Ảnh sản phẩm đã được tạo thành công",
      data: newImages,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllImagesByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    const productIdKey = "arrImageProduct"; // Định nghĩa một biến hoặc hằng số để lưu trữ giá trị

    // Tìm tất cả ảnh của sản phẩm dựa trên productId
    const images = await Image.find({ productId });

    // Khởi tạo một đối tượng để nhóm các hình ảnh
    let groupedImages = {};

    // Nhóm các hình ảnh vào một đối tượng duy nhất
    images.forEach(image => {
      if (!groupedImages[productIdKey]) {
        groupedImages[productIdKey] = [];
      }
      groupedImages[productIdKey].push(image);
    });

    return res.status(200).json({
      message: 'Đã lấy tất cả ảnh của sản phẩm thành công',
      data: groupedImages,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Đã xảy ra lỗi khi lấy ảnh của sản phẩm',
      error: error.message,
    });
  }
};

export const getAllImages = async (req, res) => {
  try {
    // Tìm tất cả các hình ảnh trong cơ sở dữ liệu
    const allImages = await Image.find();

    // Khởi tạo một đối tượng để nhóm các hình ảnh theo productId
    let groupedImages = {};
// let allImagesProduct = image.productId
    // Nhóm các hình ảnh vào các đối tượng tương ứng với productId
    allImages.forEach(image => {
      const allImagesProduct = image.productId
      if (!groupedImages[allImagesProduct]) {
        groupedImages[allImagesProduct] = [];
      }
      groupedImages[allImagesProduct].push(image);
    });

    return res.status(200).json({
      message: 'Đã lấy tất cả ảnh của các sản phẩm thành công',
      data: groupedImages,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Đã xảy ra lỗi khi lấy ảnh của các sản phẩm',
      error: error.message,
    });
  }
};
