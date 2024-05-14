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
