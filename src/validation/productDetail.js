import Joi from "joi";
import mongoose from "mongoose";

export const productDetailValid = Joi.object({
  quantity: Joi.number().min(0).required().messages({
    "number.base": "Số lượng phải là một số",
    "number.min": "Số lượng phải ít nhất là 0",
    "any.required": "Số lượng là bắt buộc",
  }),
  price: Joi.number().min(0).required().messages({
    "number.base": "Giá phải là một số",
    "number.min": "Giá phải ít nhất là 0",
    "any.required": "Giá là bắt buộc",
  }),
  importPrice: Joi.number().min(0).required().messages({
    "number.base": "Giá nhập phải là một số",
    "number.min": "Giá nhập phải ít nhất là 0",
    "any.required": "Giá nhập là bắt buộc",
  }),
  promotionalPrice: Joi.number().min(0).required().messages({
    "number.base": "Giá khuyến mãi phải là một số",
    "number.min": "Giá khuyến mãi phải ít nhất là 0",
    "any.required": "Giá khuyến mãi là bắt buộc",
  }),
  product: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("ID sản phẩm không hợp lệ");
      }
      return value;
    })
    .required()
    .messages({
      "any.required": "ID sản phẩm là bắt buộc",
    }),
  sizes: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("ID size không hợp lệ");
      }
      return value;
    })
    .messages({
      "array.base": "Sizes phải là một mảng",
    }),
});
