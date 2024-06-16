import mongoose from "mongoose";
import Product from "../models/Product.js";
import ProductDetail from "../models/ProductDetail.js";
import Category from "../models/Category.js";
import Size from "../models/Size.js";
import Image from "../models/Image.js"; // Import model Image

const { ObjectId } = mongoose.Types;



export const getInfoProductDetails = async (req, res) => {
  try {
    const { size, category, minPrice, maxPrice, sort, name } = req.query;

    console.log("Size query:", size);
    console.log("Category query:", category);
    console.log("Min Price query:", minPrice);
    console.log("Max Price query:", maxPrice);
    console.log("Sort query:", sort);
    console.log("Name query:", name);

    let sortOption = {};
    if (sort === "desc") {
      sortOption = { price: -1 };
    } else if (sort === "asc") {
      sortOption = { price: 1 };
    } else if (sort === "name") {
      sortOption = { nameProduct: 1 };
    }

    const productFilter = {};
    if (category) {
      productFilter.categoryId = new ObjectId(category);
    }
    if (name) {
      productFilter.name = new RegExp(name, "i");
    }

    const products = await Product.find(productFilter)
      .populate("categoryId")
      .lean();

    const productDetailsPromises = products.map(async (product) => {
      if (!product || !product.categoryId) {
        return null;
      }

      let productDetails;

      const productDetailFilter = { product: product._id };
      if (minPrice || maxPrice) {
        productDetailFilter.price = {};
        if (minPrice) productDetailFilter.price.$gte = parseFloat(minPrice);
        if (maxPrice) productDetailFilter.price.$lte = parseFloat(maxPrice);
      }

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
            $match: { "sizes._id": new ObjectId(size) },
          },
          {
            $project: {
              _id: 1,
              quantity: 1,
              price: 1,
              importPrice: 1,
              promotionalPrice: 1,
              "sizes.size": 1,
              "sizes._id": 1,
            },
          },
        ]);

        console.log("Product Details with Size Filter:", productDetails);
      } else {
        productDetails = await ProductDetail.find(productDetailFilter)
          .populate("sizes")
          .lean();
      }

      if (!productDetails || productDetails.length === 0) {
        return null;
      }

      const images = await Image.find({ productId: product._id }).lean();

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
        images: images.map((image) => ({
          imageUrl: image.image,
          type: image.type,
        })),
        productDetails: productDetails.map((detail) => ({
          productDetailId: detail._id,
          quantity: detail.quantity,
          price: detail.price,
          importPrice: detail.importPrice,
          promotionalPrice: detail.promotionalPrice,
          size: detail.sizes.size,
          sizeId: detail.sizes._id,
        })),
      };
    });

    const productDetails = (await Promise.all(productDetailsPromises)).filter(
      (detail) => detail !== null
    );

    if (sortOption.price) {
      productDetails.sort((a, b) => {
        if (!a || !a.productDetails || a.productDetails.length === 0) return -1;
        if (!b || !b.productDetails || b.productDetails.length === 0) return 1;
        return (
          sortOption.price *
          (a.productDetails[0].price - b.productDetails[0].price)
        );
      });
    } else if (sortOption.nameProduct) {
      productDetails.sort((a, b) => {
        if (!a || !a.nameProduct) return -1;
        if (!b || !b.nameProduct) return 1;
        return a.nameProduct.localeCompare(b.nameProduct);
      });
    }

    return res.status(200).json({
      message: "Lấy thông tin sản phẩm chi tiết thành công",
      data: productDetails,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getProductDetailsById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate("categoryId")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productDetails = await ProductDetail.find({ product: productId })
      .populate("sizes")
      .lean();

    // Lấy thông tin ảnh của sản phẩm
    const images = await Image.find({ productId: productId }).lean();

    const productData = {
      nameProduct: product.name,
      productId: product._id,
      categoryId: product.categoryId._id,
      nameCategory: product.categoryId.name,
      descript: product.description,
      images: images.map((image) => ({
        imageUrl: image.image,
        type: image.type,
      })),
      productDetails: productDetails.map((detail) => ({
        productDetailId: detail._id,
        quantity: detail.quantity,
        price: detail.price,
        importPrice: detail.importPrice,
        promotionalPrice: detail.promotionalPrice,
        size: detail.sizes.size,
        sizeId: detail.sizes._id
      })),
    };

    return res.status(200).json({
      message: "Lấy thông tin chi tiết sản phẩm thành công",
      data: productData,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      message: error.message,
    });
  }
};


export const getRelatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;

    // Tìm sản phẩm với productId được cung cấp
    const product = await Product.findById(productId).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log('Found product:', product);

    // Lấy 5 sản phẩm thuộc cùng categoryId
    const relatedProducts = await Product.find({ categoryId: product.categoryId })
      .limit(5)
      .lean();

    console.log('Related products before filter:', relatedProducts);

    // Loại bỏ sản phẩm có productId trùng
    const filteredProducts = relatedProducts.filter(p => p._id.toString() !== productId);

    console.log('Filtered products:', filteredProducts);

    // Nếu số sản phẩm sau khi lọc nhỏ hơn 4, lấy thêm sản phẩm khác để đảm bảo có 4 sản phẩm
    if (filteredProducts.length < 4) {
      const additionalProducts = await Product.find({
        categoryId: product.categoryId,
        _id: { $nin: filteredProducts.map(p => p._id).concat(productId) }
      })
        .limit(4 - filteredProducts.length)
        .lean();

      console.log('Additional products from same category:', additionalProducts);
      filteredProducts.push(...additionalProducts);
    }

    // Nếu số sản phẩm sau khi lọc vẫn nhỏ hơn 4, lấy thêm sản phẩm từ danh mục khác
    if (filteredProducts.length < 4) {
      const moreProducts = await Product.find({
        categoryId: { $ne: product.categoryId },
        _id: { $nin: filteredProducts.map(p => p._id).concat(productId) }
      })
        .limit(4 - filteredProducts.length)
        .lean();

      console.log('Additional products from different categories:', moreProducts);
      filteredProducts.push(...moreProducts);
    }

    // Lấy thông tin chi tiết của từng sản phẩm liên quan
    const detailedFilteredProducts = await Promise.all(filteredProducts.map(async p => {
      const productDetails = await ProductDetail.find({ product: p._id }).populate("sizes").lean();
      const images = await Image.find({ productId: p._id }).lean();

      return {
        ...p,
        productDetails: productDetails.map(detail => ({
          productDetailId: detail._id,
          quantity: detail.quantity,
          price: detail.price,
          importPrice: detail.importPrice,
          promotionalPrice: detail.promotionalPrice,
          size: detail.sizes.size,
          sizeId: detail.sizes._id,
        })),
        images: images.map(image => ({
          imageUrl: image.image,
          type: image.type,
        }))
      };
    }));

    return res.status(200).json({
      message: "Lấy các sản phẩm liên quan thành công",
      data: detailedFilteredProducts,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      message: error.message,
    });
  }
};

