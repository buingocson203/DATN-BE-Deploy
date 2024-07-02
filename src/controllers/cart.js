import Cart from "../models/Cart.js";
import ProductDetail from "../models/ProductDetail.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import Image from "../models/Image.js";


export const getCart = async (req, res) => {
  try {
    const { idUser } = req.params;

    const cartItems = await Cart.find({ user: idUser }).populate({
      path: "productDetail",
      populate: [
        { path: "product", select: "name" },
        { path: "sizes", select: "size" },
      ],
    });

    if (!cartItems || cartItems.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có sản phẩm trong giỏ hàng" });
    }

    const groupedCartItems = await cartItems.reduce(async (accPromise, item) => {
      const acc = await accPromise;

      if (
        item.productDetail &&
        item.productDetail.product &&
        item.productDetail.sizes
      ) {
        const key = `${item.productDetail.product.name}-${item.productDetail.sizes.size}`;

        // Tìm hình ảnh có type là "thumbnail"
        const thumbnailImage = await Image.findOne({
          productId: item.productDetail.product._id,
          type: "thumbnail",
        });

        if (!acc[key]) {
          acc[key] = {
            idCart: item._id,
            nameProduct: item.productDetail.product.name,
            productId: item.productDetail.product.id,
            productDetailId: item.productDetail.id,
            size: item.productDetail.sizes.size,
            sizeId: item.productDetail.sizes.id,
            price: item.productDetail.price,
            promotionalPrice: item.productDetail.promotionalPrice,
            totalQuantity: 0,
            totalPrice: 0,
            imageProduct: thumbnailImage ? thumbnailImage.image : null, // Thêm trường thumbnail
          };
        }
        acc[key].totalQuantity += item.quantity;
        acc[key].totalPrice =
          acc[key].promotionalPrice * acc[key].totalQuantity;
      }
      return acc;
    }, Promise.resolve({}));

    const cartList = Object.values(groupedCartItems);

    return res.status(200).json({
      message: "Danh sách giỏ hàng",
      data: cartList,
    });
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};

export const createCart = async (req, res) => {
  try {
    const { idUser, productDetailId, quantity } = req.body;

    const user = await User.findById(idUser);
    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }

    const productDetail = await ProductDetail.findById(productDetailId);
    if (!productDetail) {
      return res
        .status(404)
        .json({ message: "Sản phẩm chi tiết không tồn tại" });
    }

    if (productDetail.quantity <= 0) {
      return res.status(400).json({ message: "Sản phẩm đã hết hàng" });
    }

    if (quantity > productDetail.quantity) {
      return res
        .status(400)
        .json({ message: "Số lượng yêu cầu vượt quá số lượng trong kho" });
    }

    const newCart = new Cart({
      user: idUser,
      productDetail: productDetailId,
      quantity: quantity,
    });

    await newCart.save();

    return res.status(201).json({
      message: "Thêm sản phẩm vào giỏ hàng thành công",
      data: newCart,
    });
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};


export const deleteCart = async (req, res) => {
  try {
    const { idCart } = req.body; // Đổi từ params sang body để nhận một mảng các idCart

    // Kiểm tra xem mảng idCart có tồn tại và không rỗng không
    if (!Array.isArray(idCart) || idCart.length === 0) {
      return res.status(400).json({
        message: "Danh sách ID giỏ hàng không hợp lệ",
      });
    }

    // Lấy tất cả các productDetailId từ các idCart được cung cấp
    const carts = await Cart.find({ _id: { $in: idCart } });
    if (carts.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm trong giỏ hàng",
      });
    }

    // Sử dụng tập hợp để loại bỏ các productDetailId trùng lặp
    const productDetailIds = new Set(carts.map(cart => cart.productDetailId));

    // Xóa tất cả các mục giỏ hàng liên quan đến các productDetailId duy nhất
    const deleteResults = await Cart.deleteMany({ productDetailId: { $in: Array.from(productDetailIds) } });

    // Kiểm tra số lượng mục giỏ hàng đã được xóa
    if (deleteResults.deletedCount === 0) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm trong giỏ hàng",
      });
    }

    return res.status(200).json({
      message: "Sản phẩm trong giỏ hàng đã được xóa thành công",
      deletedCount: deleteResults.deletedCount, // Trả về số lượng mục giỏ hàng đã xóa
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const updateCart = async (req, res) => {
  try {
    const { idCart, quantity } = req.body;

    // Kiểm tra xem idCart có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(idCart)) {
      return res.status(400).json({
        message: "ID giỏ hàng không hợp lệ",
      });
    }

    const cartItem = await Cart.findById(idCart);
    if (!cartItem) {
      return res.status(404).json({ message: "Mục giỏ hàng không tồn tại" });
    }

    // Kiểm tra xem số lượng cập nhật có hợp lệ không
    if (quantity <= 0) {
      return res.status(400).json({ message: "Số lượng phải lớn hơn 0" });
    }

    const productDetail = await ProductDetail.findById(cartItem.productDetail);
    if (!productDetail) {
      return res
        .status(404)
        .json({ message: "Sản phẩm chi tiết không tồn tại" });
    }

    if (quantity > productDetail.quantity) {
      return res.status(400).json({
        message: "Số lượng yêu cầu vượt quá số lượng trong kho",
      });
    }

    // Cập nhật số lượng trong giỏ hàng
    cartItem.quantity = quantity;
    await cartItem.save();

    return res.status(200).json({
      message: "Cập nhật giỏ hàng thành công",
      data: cartItem,
    });
  } catch (error) {
    return res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};
