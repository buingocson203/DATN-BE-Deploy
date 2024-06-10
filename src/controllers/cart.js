import Cart from "../models/Cart.js";
import ProductDetail from "../models/ProductDetail.js";
import User from "../models/User.js";
import Product from "../models/Product.js";


export const getCart = async (req, res) => {
    try {
      const { idUser } = req.params;
  
      const cartItems = await Cart.find({ user: idUser })
        .populate({
          path: "productDetail",
          populate: [
            { path: "product", select: "name" },
            { path: "sizes", select: "size" }
          ]
        });
  
      if (!cartItems || cartItems.length === 0) {
        return res.status(404).json({ message: "Không có sản phẩm trong giỏ hàng" });
      }
  
      const groupedCartItems = cartItems.reduce((acc, item) => {
        const key = `${item.productDetail.product.name}-${item.productDetail.sizes.size}`;
        if (!acc[key]) {
          acc[key] = {
            id: item._id,
            nameProduct: item.productDetail.product.name,
            size: item.productDetail.sizes.size,
            price: item.productDetail.price,
            promotionalPrice: item.productDetail.promotionalPrice,
            totalQuantity: 0,
            totalPrice: 0
          };
        }
        acc[key].totalQuantity += item.quantity;
        acc[key].totalPrice = acc[key].promotionalPrice * acc[key].totalQuantity;
        return acc;
      }, {});
  
      const cartList = Object.values(groupedCartItems);
  
      return res.status(200).json({
        message: "Danh sách giỏ hàng",
        data: cartList
      });
    } catch (error) {
      return res.status(500).json({
        name: error.name,
        message: error.message
      });
    }
  };

  export const createCart = async (req, res) => {
    try {
        const { idUser, idProductDetail, quantity } = req.body;

        const user = await User.findById(idUser);
        if (!user) {
            return res.status(404).json({ message: "Tài khoản không tồn tại" });
        }

        const productDetail = await ProductDetail.findById(idProductDetail);
        if (!productDetail) {
            return res.status(404).json({ message: "Sản phẩm chi tiết không tồn tại" });
        }

        if (productDetail.quantity <= 0) {
            return res.status(400).json({ message: "Sản phẩm đã hết hàng" });
        }

        if (quantity > productDetail.quantity) {
            return res.status(400).json({ message: "Số lượng yêu cầu vượt quá số lượng trong kho" });
        }

        const newCart = new Cart({
            user: idUser,
            productDetail: idProductDetail,
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