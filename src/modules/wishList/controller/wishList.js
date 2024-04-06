import { findById, findByIdAndUpdate, findOne, updateOne } from "../../../../DB/DBMethods.js";
import productModel from "../../../../DB/models/Product.js";
import userModel from "../../../../DB/models/User.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
export const add = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { productId } = req.params;
  if (user.deleted) {
    return next(new Error("Your account is stopped", { cause: 400 }));
  }
  const product = await findById({
    model: productModel,
    condition: productId,
  });
  if (!product) {
    return next(new Error("In-valid product ID", { cause: 404 }));
  }
  const updateUser = await findByIdAndUpdate({
    model: userModel,
    condition: user._id,
    data: { $addToSet: { wishList: product._id } },
    option: { new: true }

  });
  console.log(updateUser);

  return res.status(200).json({ message: "Done", numberOfWishList: updateUser.wishList.length });
});
export const remove = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { productId } = req.params;
  if (user.deleted) {
    return next(new Error("Your account is stopped", { cause: 400 }));
  }
  if (!user.wishList.includes(productId)) {
    console.log(user.wishList, productId);
    return next(
      new Error("Already, In-valid product ID in your wishList", { cause: 404 })
    );
  }
  const updateUser = await findByIdAndUpdate({
    model: userModel,
    condition: user._id,
    data: { $pull: { wishList: productId } },
    option: { new: true }
  });
  console.log(updateUser);
  return res.status(200).json({ message: "Done", numberOfWishList: updateUser.wishList.length });
});
