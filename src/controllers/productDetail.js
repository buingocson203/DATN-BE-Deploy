import ProductDetail from "../models/ProductDetail.js";
import { productDetailValid } from "../validation/productDetail.js";
import mongoose from "mongoose";
export const create = async (req, res) => {
  try {
    const { error } = productDetailValid.validate(req.body);
    if (error) {
      return res.status(400).json({
        message:
          error.details[0].message || "Vui lòng kiểm tra lại dữ liệu của bạn",
      });
    }

    const productDetail = await ProductDetail.create(req.body);
    if (!productDetail) {
      return res.status(404).json({
        message: "Tạo chi tiết sản phẩm không thành công",
      });
    }

    return res.status(200).json({
      message: "Tạo sản phẩm chi tiết thành công",
      datas: productDetail,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// export const getDetailProductDeatil = async (req, res) => {
//   try {
//     const productDetail = await ProductDetail.findById(req.params.id)
//       .populate("sizeId")
//       .populate("productId");
//     if (!productDetail) {
//       return res.status(404).json({
//         message: "Không tìm thấy chi tiết sản phẩm",
//       });
//     }
//     return res.status(200).json({
//       message: "Chi tiết sản phẩm đã được tìm thấy",
//       data: productDetail,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message,
//     });
//   }
// };

export const getDetailProductDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem id có phải là ObjectId hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID không hợp lệ",
      });
    }

    // Tìm chi tiết sản phẩm theo ID
    const productDetail = await ProductDetail.findById(id)
      .populate("product", "name") // Thay 'name' bằng các trường bạn muốn lấy từ Product
      .populate("sizes", "size"); // Thay 'size' bằng các trường bạn muốn lấy từ Size

    if (!productDetail) {
      return res.status(404).json({
        message: "Không tìm thấy chi tiết sản phẩm",
      });
    }

    return res.status(200).json({
      message: "Chi tiết sản phẩm đã được tìm thấy",
      data: productDetail,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllProductDetail = async (req, res) => {
  try {
    // Lấy tất cả chi tiết sản phẩm và populate các trường liên kết
    const productDetails = await ProductDetail.find()
      .populate("product", "name") // Thay 'name' bằng các trường bạn muốn lấy từ Product
      .populate("sizes", "size"); // Thay 'size' bằng các trường bạn muốn lấy từ Size

    if (!productDetails) {
      return res.status(404).json({
        message: "Không tìm thấy chi tiết sản phẩm",
      });
    }

    return res.status(200).json({
      message: "Danh sách chi tiết sản phẩm đã được tìm thấy",
      data: productDetails,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteProductDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem id có phải là ObjectId hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID không hợp lệ",
      });
    }

    // Tìm và xóa chi tiết sản phẩm theo ID
    const productDetail = await ProductDetail.findByIdAndDelete(id);

    if (!productDetail) {
      return res.status(404).json({
        message: "Không tìm thấy chi tiết sản phẩm",
      });
    }

    return res.status(200).json({
      message: "Chi tiết sản phẩm đã được xóa thành công",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


export const updateProductDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Kiểm tra xem id có phải là ObjectId hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID không hợp lệ",
      });
    }

    // Cập nhật chi tiết sản phẩm theo ID
    const updatedProductDetail = await ProductDetail.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedProductDetail) {
      return res.status(404).json({
        message: "Không tìm thấy chi tiết sản phẩm",
      });
    }

    return res.status(200).json({
      message: "Chi tiết sản phẩm đã được cập nhật thành công",
      data: updatedProductDetail,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};