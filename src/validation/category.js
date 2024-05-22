import Joi from "joi";

export const categoryValid = Joi.object({
    name: Joi.string().required().min(6),
    slug: Joi.string().required().min(3).max(255)
})