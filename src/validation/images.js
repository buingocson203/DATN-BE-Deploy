import Joi from "joi";
import mongoose from "mongoose";
export const imageValid = Joi.object({
  image: Joi.string().required().messages({
    "string.empty": "Đường dẫn hoặc tên tệp của hình ảnh không được để trống",
    "any.required": "Đường dẫn hoặc tên tệp của hình ảnh là bắt buộc",
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
  type: Joi.string().valid("thumbnail", "gallery").required().messages({
    "any.only": 'Loại hình ảnh phải là "thumbnail" hoặc "gallery"',
    "any.required": "Loại hình ảnh là bắt buộc",
  }),
});
