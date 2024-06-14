import Joi from "joi";

export const orderValid = Joi.object({
  address: Joi.string().required(),
  phone: Joi.number().required(),
  user_id: Joi.string().required(),
  productDetails: Joi.array().items(
    Joi.object({
      productDetailId: Joi.string().required(),
      price: Joi.number().required(),
      image: Joi.string().required(),
      color: Joi.string(),
      sizeId: Joi.string().required(),
      quantity: Joi.number().default(1),
    })
  ),
  status: Joi.string()
    .valid("pending", "waiting", "delivering", "done", "cancel")
    .default("pending"),
  total_price: Joi.number().required(),
  total_amount_paid: Joi.number().default(0),
  payment_type: Joi.string().valid("cod", "vnpay").default("cod"),
});
