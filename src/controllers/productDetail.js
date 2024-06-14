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

    const productDetailsData = req.body.productDetails;

    // Check for duplicate quantities in the database
    const existingQuantities = await ProductDetail.find({
      quantity: { $in: productDetailsData.map((detail) => detail.quantity) },
    });

    if (existingQuantities.length > 0) {
      return res.status(400).json({
        message: `Trùng lặp quantity: ${existingQuantities
          .map((e) => e.quantity)
          .join(", ")}`,
      });
    }

    const productDetails = await ProductDetail.insertMany(productDetailsData);
    if (!productDetails || productDetails.length === 0) {
      return res.status(404).json({
        message: "Tạo chi tiết sản phẩm không thành công",
      });
    }

    return res.status(200).json({
      message: "Tạo sản phẩm chi tiết thành công",
      data: productDetails,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getDetailProductDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem id có phải là ObjectId hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID không hợp lệ",
      });
    }

    // Tìm chi tiết sản phẩm theo productId và lấy tất cả các size liên quan
    const productDetails = await ProductDetail.find({ product: id })
      .populate("product", "name") // Thay 'name' bằng các trường bạn muốn lấy từ Product
      .populate("sizes", "size"); // Thay 'size' bằng các trường bạn muốn lấy từ Size

    if (!productDetails || productDetails.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy chi tiết sản phẩm",
      });
    }

    // Xử lý thông tin của mỗi chi tiết sản phẩm
    const formattedProductDetails = productDetails.reduce((acc, detail) => {
      const productId = detail.product._id.toString();
      const existingProduct = acc.find((item) => item.productId === productId);

      const sizeDetail = {
        _id: detail.sizes._id,
        size: detail.sizes.size,
        quantity: detail.quantity,
        price: detail.price,
        importPrice: detail.importPrice,
        promotionalPrice: detail.promotionalPrice,
      };

      if (existingProduct) {
        existingProduct.sizes.push(sizeDetail);
      } else {
        acc.push({
          _id: detail._id,
          productId: productId,
          name: detail.product.name,
          sizes: [sizeDetail],
        });
      }

      return acc;
    }, []);

    return res.status(200).json({
      message: "Chi tiết sản phẩm đã được tìm thấy",
      data: formattedProductDetails,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllProductDetail = async (req, res) => {
  try {
    const productDetails = await ProductDetail.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $lookup: {
          from: "sizes",
          localField: "sizes",
          foreignField: "_id",
          as: "sizes",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $unwind: "$sizes",
      },
      {
        $group: {
          _id: "$product._id",
          name: { $first: "$product.name" },
          productId: { $first: "$product._id" },
          sizes: {
            $push: {
              _id: "$sizes._id",
              size: "$sizes.size",
              quantity: "$quantity",
              price: "$price",
              importPrice: "$importPrice",
              promotionalPrice: "$promotionalPrice",
            },
          },
        },
      },
    ]);

    if (!productDetails || productDetails.length === 0) {
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
    const { productId } = req.params;

    // Kiểm tra xem productId có phải là ObjectId hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "ID không hợp lệ",
      });
    }

    // Tìm và xóa tất cả chi tiết sản phẩm theo productId
    const result = await ProductDetail.deleteMany({ product: productId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Không tìm thấy chi tiết sản phẩm",
      });
    }

    return res.status(200).json({
      message: "Toàn bộ chi tiết sản phẩm đã được xóa thành công",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const updateProductDetail = async (req, res) => {
  try {
    const updates = req.body; // Expecting an array of updates

    // Validate the array of updates
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        message: "Dữ liệu cập nhật không hợp lệ",
      });
    }

    // Loop through each update and apply the changes
    const updatedProductDetails = [];
    for (const update of updates) {
      const { id, sizes } = update;

      // Check if the id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: `ID không hợp lệ: ${id}`,
        });
      }

      // Loop through each size update
      for (const sizeUpdate of sizes) {
        const { _id, quantity, price, importPrice, promotionalPrice } =
          sizeUpdate;

        // Check if the size ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(_id)) {
          return res.status(400).json({
            message: `ID size không hợp lệ: ${_id}`,
          });
        }

        // Find the product detail by product and size IDs
        const productDetail = await ProductDetail.findOne({
          product: id,
          sizes: _id,
        });

        if (!productDetail) {
          return res.status(404).json({
            message: `Không tìm thấy chi tiết sản phẩm: ${_id}`,
          });
        }

        // Update the product detail
        productDetail.quantity = quantity;
        productDetail.price = price;
        productDetail.importPrice = importPrice;
        productDetail.promotionalPrice = promotionalPrice;

        // Save the updated product detail
        const updatedProductDetail = await productDetail.save();
        updatedProductDetails.push(updatedProductDetail);
      }
    }

    return res.status(200).json({
      message: "Chi tiết sản phẩm đã được cập nhật thành công",
      data: updatedProductDetails,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
