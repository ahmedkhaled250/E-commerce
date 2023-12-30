import joi from "joi";
import { generalFields, validateQuery } from "../../middleware/validation.js";
export const addOrder = joi
  .object({
    products: joi.array().items(
      joi
        .object()
        .required()
        .keys({
          productId: generalFields.id,
          quantity: joi.number().min(1).required(),
        })
    ),
    couponName: joi.string(),
    phone: joi
      .string()
      .pattern(/^01[0125][0-9]{8}$/)
      .required(),
    address: joi.string().min(2).max(50).required(),
    note: joi.string(),
    paymentMethod: joi.string().valid("cash", "card"),
    authorization: generalFields.headers,
  })
  .required();
export const cencelOrder = joi
  .object({
    id: generalFields.id,
    authorization: generalFields.headers,
  })
  .required();
export const userOrders = joi
  .object({
    ...validateQuery,
    authorization: generalFields.headers,
  })
  .required();
