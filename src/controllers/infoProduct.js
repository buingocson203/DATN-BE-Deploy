import mongoose from "mongoose";
import Product from "../models/Product.js";
import ProductDetail from "../models/ProductDetail.js";
import Category from "../models/Category.js";
import Size from "../models/Size.js";

const { ObjectId } = mongoose.Types;

export const getInfoProductDetails = async (req, res) => {
  try {
    const { size, category, minPrice, maxPrice, sort } = req.query; // Lấy kích thước, danh mục, khoảng giá và tham số sắp xếp từ query params

    console.log("Size query:", size);
    console.log("Category query:", category);
    console.log("Min Price query:", minPrice);
    console.log("Max Price query:", maxPrice);
    console.log("Sort query:", sort);

    let sortOption = {};
    if (sort === "desc") {
      sortOption = { price: -1 }; // Giảm dần (DESC)
    } else if (sort === "asc") {
      sortOption = { price: +1 }; // Tăng dần (ASC)
    }

    // Điều kiện lọc cho sản phẩm
    const productFilter = {};
    if (category) {
      productFilter.categoryId = new ObjectId(category);
    }

    const products = await Product.find(productFilter)
      .populate("categoryId")
      .lean();

    const productDetailsPromises = products.map(async (product) => {
      let productDetails;

      // Điều kiện lọc cho chi tiết sản phẩm
      const productDetailFilter = { product: product._id };
      if (minPrice || maxPrice) {
        productDetailFilter.price = {};
        if (minPrice) productDetailFilter.price.$gte = parseFloat(minPrice);
        if (maxPrice) productDetailFilter.price.$lte = parseFloat(maxPrice);
      }

      // Nếu có kích thước được chỉ định, thực hiện nối và lọc
      if (size) {
        productDetails = await ProductDetail.aggregate([
          {
            $match: productDetailFilter,
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
            $unwind: "$sizes",
          },
          {
            $match: { "sizes.size": parseInt(size) }, // Chuyển đổi size thành số nếu nó là số
          },
          {
            $project: {
              _id: 1,
              quantity: 1,
              price: 1,
              importPrice: 1,
              promotionalPrice: 1,
              "sizes.size": 1,
            },
          },
        ]);

        console.log("Product Details with Size Filter:", productDetails);
      } else {
        // Nếu không có kích thước, lấy tất cả các chi tiết sản phẩm
        productDetails = await ProductDetail.find(productDetailFilter)
          .populate("sizes")
          .lean();
      }

      if (productDetails.length === 0) {
        return null;
      }

      return {
        nameProduct: product.name,
        productId: product._id,
        categoryId: product.categoryId._id,
        nameCategory: product.categoryId.name,
        descript: product.description,
        filteredBySize: size || "All",
        filteredByCategory: category || "All",
        filteredByMinPrice: minPrice || "None",
        filteredByMaxPrice: maxPrice || "None",
        productDetails: productDetails.map((detail) => ({
          productDetailId: detail._id,
          quantity: detail.quantity,
          price: detail.price,
          importPrice: detail.importPrice,
          promotionalPrice: detail.promotionalPrice,
          size: detail.sizes.size,
        })),
      };
    });

    const productDetails = await Promise.all(productDetailsPromises);

    // Sắp xếp dữ liệu sản phẩm dựa trên sortOption
    if (Object.keys(sortOption).length !== 0) {
      productDetails.sort((a, b) => {
        if (!a || !a.productDetails || a.productDetails.length === 0) return -1;
        if (!b || !b.productDetails || b.productDetails.length === 0) return 1;
        return a.productDetails[0].price - b.productDetails[0].price;
      });
    }

    return res.status(200).json({
      message: "Lấy thông tin sản phẩm chi tiết thành công",
      data: productDetails.filter((detail) => detail !== null),
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      message: error.message,
    });
  }
};
