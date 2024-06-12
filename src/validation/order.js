import Joi from "joi";

export const orderValid = Joi.object({
  address: Joi.string().required(),
  phone: Joi.number().required(),
  user_id: Joi.string().required(),
  products: Joi.array().items(
    Joi.object({
      product_id: Joi.string().required(),
      color: Joi.string(),
      size: Joi.string(),
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
