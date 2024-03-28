import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const signup = joi
  .object({
    userName: joi.string().required().min(2).max(20).message({
      "any.required": "userName is required",
      "any.empty": "empty userName isn't acceptable",
    }),
    email: generalFields.email.messages({
      "any.required": "Email is required",
      "string.empty": "not allowed to be empty",
      "string.base": "only string is allowed",
      "string.email": "please enter realy email",
    }),
    password: generalFields.password,
    cPassword: generalFields.cPassword.valid(joi.ref("password")),
    phone: joi.string(),
    role: joi.string(),
    gender: joi.string(),
    address: joi.string(),
    DOB: joi.date(),
    authorization: joi.string(),
  })
  .required();
export const signin = joi
  .object({
    email: generalFields.email.messages({
      "any.required": "Email is required",
      "string.empty": "not allowed to be empty",
      "string.base": "only string is allowed",
      "string.email": "please enter realy email",
    }),
    password: generalFields.password,
    authorization: joi.string(),
  })
  .required();
export const confirmEmail = joi
  .object({
    token: joi.string().required(),
    authorization: joi.string(),
  })
  .required();
export const sendCode = joi
  .object({
    email: generalFields.email.messages({
      "any.required": "Email is required",
      "string.empty": "not allowed to be empty",
      "string.base": "only string is allowed",
      "string.email": "please enter realy email",
    }),
    authorization: joi.string(),
  })
  .required();
export const forgetPassword = joi
  .object({
    email: generalFields.email.messages({
      "any.required": "Email is required",
      "string.empty": "not allowed to be empty",
      "string.base": "only string is allowed",
      "string.email": "please enter realy email",
    }),
    code: joi.number().required(),
    password: generalFields.password,
    cPassword: generalFields.cPassword.valid(joi.ref("password")),
    authorization: joi.string(),
  })
  .required();
