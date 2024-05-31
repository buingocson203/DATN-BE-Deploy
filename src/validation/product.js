import Joi from "joi";

export const productValid = Joi.object({
    name: Joi.string().required().min(6),
    price: Joi.number().required().min(0),
    description: Joi.string(),
    image: Joi.string(),
    categoryId: Joi.string().required(),
    sizeId: Joi.array().items(Joi.string().required()).required(),
    color: Joi.string().required(),
    importPrice: Joi.number().required().min(0),
    promotionalPrice: Joi.number().required().min(0),
    IdImages: Joi.array().items(Joi.string().required()).required(),
    quanity: Joi.number().required().min(0),
    status: Joi.string().required(),
});