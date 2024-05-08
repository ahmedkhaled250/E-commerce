import { asyncHandler } from "../../../utils/errorHandling.js";
import {
  create,
  deleteMany,
  findById,
  findByIdAndDelete,
  findOne,
  findOneAndDelete,
  findOneAndUpdate,
  updateOne,
} from "../../../../DB/DBMethods.js";
import cartModel from "../../../../DB/models/Cart.js";
import productModel from "../../../../DB/models/Product.js";
import productCartModel from "../../../../DB/models/ProductsOfCart.js";

export const addtoCart = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { productId, quantity } = req.body;
  if (user.deleted) {
    return next(new Error("Your account is deleted", { cause: 400 }));
  }
  // check product
  const checkProduct = await findById({ model: productModel, condition: productId });
  if (!checkProduct) {
    return next(new Error("In-valid this product", { cause: 404 }));
  }
  if (checkProduct.deleted) {
    return next(new Error("This product is not available", { cause: 400 }));
  }
  if (checkProduct.stock < quantity) {
    await updateOne({
      model: productModel,
      condition: { _id: productId },
      data: { $addToSet: { wishUserList: user._id } },
    });
    return next(new Error("This quantity is not available", { cause: 400 }));
  }
  const populate = [
    {
      path: "products",
    },
  ]
  const findCart = await findOne({
    model: cartModel,
    condition: { userId: user._id },
    populate
  });
  if (!findCart) {
    // add new cart
    const cart = await create({
      model: cartModel,
      data: { userId: user._id, products: [] },
    });
    const product = await create({
      model: productCartModel,
      data: { cartId: cart._id, productId, quantity },
    });
    cart.products = [product._id]
    await cart.save()
    return res.status(201).json({ message: "Done" });
  }
  console.log(findCart);
  //update the product quantity inside the cart
  let match = false;
  let finalCart;

  for (let i = 0; i < findCart.products.length; i++) {
    if (findCart.products[i].productId.toString() == productId) {
      finalCart = findCart;

      match = true;
      await updateOne({ model: productCartModel, condition: { productId }, data: { quantity } })
      break;
    }
  }
  // push new product into cart
  if (!match) {
    const newProduct = await create({ model: productCartModel, data: { productId, quantity, cartId: findCart._id } })
    finalCart = await findOneAndUpdate({ model: cartModel, condition: { _id: findCart._id }, data: { $push: { products: newProduct._id } }, option: { new: true } })
  }
  return res.status(200).json({ message: "Done", numberOfProducts: finalCart.products.length });
});
export const deleteFromCart = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { productId, cartId } = req.params;
  if (user.deleted) {
    return next(new Error("Your account is deleted", { cause: 400 }));
  }
  const populate = [
    {
      path: "products",
    },
  ]
  let cart = await findOne({
    model: cartModel,
    condition: { userId: user._id, _id: cartId },
    populate
  });
  if (!cart) {
    return next(new Error("In-valid cart", { cause: 404 }));
  }
  let match = false;
  for (let i = 0; i < cart.products.length; i++) {
    if (cart.products[i].productId == productId) {
      const deleteProduct = await findOneAndDelete({ model: productCartModel, condition: { productId } })
      cart = await findOneAndUpdate({
        model: cartModel, condition: { _id: cart._id }, data: { $pull: { products: deleteProduct._id } },
        option: { new: true }
      })
      match = true;
      break;
    }
  }
  if (match == false) {
    return next(
      new Error("In-valid this product in your products", { cause: 400 })
    );
  }
  console.log(cart);
  return res.status(200).json({ message: "Done", numberOfProducts: cart.products.length });
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
    await cart.save();
    await deleteMany({ model: productCartModel, condition: { cartId: cart._id } })
    return res.status(200).json({ message: "Done" });
  } else {
    return next(
      new Error("Already,You havn't any product in your cart", { cause: 400 })
    );
  }
});
export const getMyCart = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const populate = [
    {
      path: "userId",
      select: "userName email image",
    },
    {
      path: "products",
      select: "productId quantity -_id",
      populate: {
        path: "productId",
      }
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
