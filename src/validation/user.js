import Joi from "joi";
// signUp
export const signUpValidator = Joi.object({
  userName: Joi.string().required().min(6),
  email: Joi.string().required().email(),
  password: Joi.string().min(6),
  confirmPassword: Joi.string().required().min(6).valid(Joi.ref("password")),
  role: Joi.string()
});

// signIn
export const signInValidator = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().min(6),
});

export const updateUserAdminValidator = Joi.object({
  role: Joi.string().valid("member", "admin").required(),
});

export const updateUserValidator = Joi.object({
  userName: Joi.string().min(6),
  fullName: Joi.string(),
  tel: Joi.number(),
  email: Joi.string().email(),
  gender: Joi.string(),
}).min(1); // Tối thiểu phải có một trường dữ liệu để cập nhật