import { asyncHandler } from "../../../utils/errorHandling.js";
import {
  create,
  findById,
  findOne,
  findOneAndUpdate,
  updateOne,
} from "../../../../DB/DBMethods.js";
import cartModel from "../../../../DB/models/Cart.js";
import productModel from "../../../../DB/models/Product.js";

export const addtoCart = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { productId, quantity } = req.body;
  if (user.deleted) {
    return next(new Error("Your account is deleted", { cause: 400 }));
  }
  // check product
  const product = await findById({ model: productModel, condition: productId });
  if (!product) {
    return next(new Error("In-valid this product", { cause: 404 }));
  }
  if (product.deleted) {
    return next(new Error("This product is not available", { cause: 400 }));
  }
  if (product.stock < quantity) {
    await updateOne({
      model: productModel,
      condition: { _id: productId },
      data: { $addToSet: { wishUserList: user._id } },
    });
    return next(new Error("This quantity is not available", { cause: 400 }));
  }
  const findCart = await findOne({
    model: cartModel,
    condition: { userId: user._id },
  });
  if (!findCart) {
    // add new cart
    const products = [{ productId, quantity }]
    const cart = await create({
      model: cartModel,
      data: { userId: user._id, products },
    });
    if (!cart) {
      return next(new Error("Fail to create cart", { cause: 400 }));
    }
    return res.status(201).json({ message: "Done" });
  }
  //update the product quantity inside the cart
  let match = false;
  for (let i = 0; i < findCart.products.length; i++) {
    if (findCart.products[i].productId.toString() == productId) {
      match = true;
      findCart.products[i].quantity = quantity;
      break;
    }
  }
  // push new product into cart
  if (!match) {
    findCart.products.push({ productId, quantity });
  }
  const updateCart = await findOneAndUpdate({
    model: cartModel,
    condition: { userId: user._id },
    data: { products: findCart.products },
  });
  if (!updateCart) {
    return next(new Error("Fail to addtoCart", { cause: 400 }));
  }
  return res.status(200).json({ message: "Done" });
});
export const deleteFromCart = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { productId, cartId } = req.params;
  if (user.deleted) {
    return next(new Error("Your account is deleted", { cause: 400 }));
  }
  const cart = await findOne({
    model: cartModel,
    condition: { userId: user._id, _id: cartId },
  });
  if (!cart) {
    return next(new Error("In-valid cart", { cause: 404 }));
  }
  let match = false;
  for (let i = 0; i < cart.products.length; i++) {
    if (cart.products[i].productId.toString() == productId) {
      cart.products.splice(i, 1);
      match = true;
      break;
    }
  }
  if (match == false) {
    return next(
      new Error("In-valid this product in your products", { cause: 400 })
    );
  }
  await cart.save();
  return res.status(200).json({ message: "Done" });
});
export const removeProductsFromCart = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;
  if (user.deleted) {
    return next(new Error("Your account is deleted", { cause: 400 }));
  }
  const cart = await findOne({
    model: cartModel,
    condition: { userId: user._id, _id: id },
  });
  if (!cart) {
    return next(new Error("In-valid cart", { cause: 404 }));
  }
  if (cart.products.length) {
    cart.products = [];
  } else {
    return next(
      new Error("Already,You havn't any product in your cart", { cause: 400 })
    );
  }
  await cart.save();
  return res.status(200).json({ message: "Done" });
});
export const getMyCart = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const populate = [
    {
      path: "userId",
      select: "userName email image",
    },
    {
      path: "products.productId",
    },
  ];
  const cart = await findOne({
    model: cartModel,
    condition: { userId: user._id },
    populate,
  });
  if (!cart) {
    return next(new Error("In-valid cart", { cause: 404 }));
  }
  const finalCart = cart.toObject()
  finalCart.numberOfProducts = finalCart.products.length
  return res.status(200).json({ message: "Done", cart: finalCart });
});
