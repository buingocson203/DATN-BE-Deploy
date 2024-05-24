import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { productValid } from "../validation/product.js";

export const getList = async (req, res) => {
  try {
    // res.send('Lay danh sach san pham')
    // const products = await Product.find().populate("categoryId");
    const {_page=1, _limit=10, _sort="createdAt", _oder="asc"} = req.query
    const options = {
      page: _page,
      limit: _limit,
      sort: {
        [_sort]: _oder === 'asc' ? 1 : -1
      },
    }
    const products = await Product.paginate({}, options)
    if (!products.docs || products.docs.length === 0) {
      return res.status(404).json({
        message: "Khong tim thay san pham",
      });
    }
    return res.status(200).json({
      message: "Tim thanh cong san pham",
      datas: products,
    });
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};

export const getDetail = async (req, res) => {
  try {
    // res.send('Lay danh sach san pham')
    const product = await Product.findById(req.params.id).populate("categoryId");
    if (!product) {
      return res.status(404).json({
        message: "Khong tim thay san pham",
      });
    }
    return res.status(200).json({
      message: "Tim thanh cong san pham",
      datas: product,
    });
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};

export const create = async (req, res) => {
  try {
    const {error} = productValid.validate(req.body)
    if(error) {
      return res.status(400).json({
        message: error.details[0].message || "Please re-check your data",
      })
    }
    const product = await Product.create(req.body)
    if (!product) {
      return res.status(404).json({
        message: "Tao san pham khong thanh cong",
      });
    }

    const updateCategory = await Category.findByIdAndUpdate(product.categoryId, {
      $addToSet: {
      products: product._id
    }})
    if(!updateCategory){
      return res.status(404).json({
      message: "Cap nhat categori khong thanh cong",
    });
    }
    

    return res.status(200).json({
      message: "Tao thanh cong san pham",
      datas: product,
    });
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};

export const update = async (req, res) => {
  try {
    const {error} = productValid.validate(req.body)
    if(error) {
      return res.status(400).json({
        message: error.details[0].message,
      })
    }
    const product = await Product.findByIdAndUpdate(req.params.id,
      req.body, {new: true,});
    if (!product) {
      return res.status(404).json({
        message: "Cap nhat san pham khong thanh cong",
      });
    }
    const updateCategory = await Category.findByIdAndUpdate(product.categoryId, {
      $addToSet: {
      products: product._id
    }})
    if(!updateCategory){
      return res.status(404).json({
      message: "Cap nhat categori khong thanh cong",
    });
    }
    return res.status(200).json({
      message: "Cap nhat thanh cong san pham",
      product
    });
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};

export const remove = async (req, res) => {
  try {
    const product =await Product.findByIdAndDelete(req.params.id)
    if(!product) {
      return res.status(400).json({
        message: "Xoa khong thanh cong san pham",
      });
    }
    const updateCategory = await Category.findByIdAndRemove(product.categoryId, {
      $addToSet: {
      products: product._id
    }})
    if(!updateCategory){
      return res.status(404).json({
      message: "Cap nhat categori khong thanh cong",
    });
    }
    return res.status(200).json({
      message: "Xoa san pham thanh cong",
      datas: product,
    })
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
  
};
