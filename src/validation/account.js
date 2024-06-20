import Joi from "joi";

export const accountValid = Joi.object({
  userId: Joi.string().required(),
  name: Joi.string().required(),
  phone: Joi.string().required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  role: Joi.string().valid("admin", "member").optional(), // optional for updates
});
