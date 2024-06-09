import Product from '../models/Product.js';
import ProductDetail from '../models/ProductDetail.js';
import Category from '../models/Category.js';

export const getInfoProductDetails = async (req, res) => {
  try {
    const products = await Product.find().populate('categoryId').lean();

    const productDetailsPromises = products.map(async (product) => {
      const productDetails = await ProductDetail.find({ product: product._id }).lean();

      if (productDetails.length === 0) {
        return null;
      }

      const totalProduct = productDetails.reduce((sum, detail) => sum + detail.quantity, 0);
      const minPrice = Math.min(...productDetails.map(detail => detail.price));

      return {
        nameProduct: product.name,
        productId: product._id,
        categoryId: product.categoryId._id,
        nameCategory: product.categoryId.name,
        descript: product.description,
        totalProduct: totalProduct,
        price: minPrice,
        productDetails: productDetails.map(detail => ({
          productDetailId: detail._id,
          quantity: detail.quantity,
          price: detail.price,
          importPrice: detail.importPrice,
          promotionalPrice: detail.promotionalPrice,
          size: detail.sizes,
        })),
      };
    });

    const productDetails = await Promise.all(productDetailsPromises);

    return res.status(200).json({
      message: 'Lấy thông tin sản phẩm chi tiết thành công',
      data: productDetails.filter(detail => detail !== null),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
