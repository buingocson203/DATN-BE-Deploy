import Joi from "joi";

export const variantValid = Joi.object({
  size: Joi.string().required(),
  slug: Joi.string().required().max(255),
});
