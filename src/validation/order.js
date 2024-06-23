import Joi from "joi";

export const orderValid = Joi.object({
  address: Joi.string().required(),
  phone: Joi.number().required(),
  user_id: Joi.string().required(),
  productDetails: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      price: Joi.number().required(),
      promotionalPrice: Joi.number().required(), // Thêm trường promotionalPrice
      image: Joi.string().required(),
      sizeId: Joi.string().required(),
      sizeName: Joi.string().required(),
      productDetailId: Joi.string().required(),
      productName: Joi.string().required(),
      quantityOrders: Joi.number().default(1),
    })
  ),
  orderStatus: Joi.string()
    .valid("pending", "waiting", "delivering", "done", "cancel")
    .default("pending"),
  total_amount_paid: Joi.number().default(0),
  paymentMethod: Joi.string().valid("cod", "vnpay").default("cod"),
  codeOrders: Joi.string().allow(null, '').required(),
  paymentStatus: Joi.string().valid("unpaid", "paid").default("unpaid")
});
