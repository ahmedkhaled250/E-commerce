import {
  find,
  findById,
  findByIdAndUpdate,
  findOne,
  updateOne,
} from "../../../../DB/DBMethods.js";
import userModel from "../../../../DB/models/User.js";
import { compare, hash } from "../../../utils/HashAndCompare.js";
import cloudinary from "../../../utils/cloudinary.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
export const profilePic = asyncHandler(async (req, res, next) => {
  const { user } = req;
  if (user.deleted) {
    return next(new Error("You deleted your profile", { cause: 400 }));
  }
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.PROJECTNAME}/user/profilePic/${user._id}`,
    }
  );
  if (user.image) {
    await cloudinary.uploader.destroy(user.image.public_id);
  }
  user.image = { public_id, secure_url };
  await user.save();
  return res.status(200).json({ message: "Done" });
});
export const deleteProfilePic = asyncHandler(async (req, res, next) => {
  const { user } = req;
  if (user.deleted) {
    return next(new Error("Your account is deleted", { cause: 400 }));
  }
  if (!user.image) {
    return next(new Error("Already you have not profilePic", { cause: 400 }));
  }
  await cloudinary.uploader.destroy(user.image.public_id);
  user.image = null;
  await user.save();
  return res.status(200).json({ message: "Done" });
});
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  const user = await findById({ model: userModel, condition: _id });
  const { oldPassword, password } = req.body;
  const match = compare({ plaintext: oldPassword, hashValue: user.password });
  if (!match) {
    return next(new Error("this password is wrong", { cause: 400 }));
  }
  const hashPassword = hash({ plaintext: password });
  user.password = hashPassword;
  user.changeTime = Date.now();
  await user.save();
  return res.status(200).json({ message: "Done" });
});
export const softDelete = asyncHandler(async (req, res, next) => {
  const { user } = req;
  if (user.deleted) {
    user.deleted = false;
  } else {
    user.deleted = true;
  }
  await user.save();
  return res.status(200).json({ message: "Done" });
});
export const blockUser = asyncHandler(async (req, res, next) => {
  const userAdmin = req.user;
  const { id } = req.params;
  if (userAdmin.deleted) {
    return next(new Error("Your account is stopped", { cause: 400 }));
  }
  if (userAdmin._id == id) {
    return next(new Error("You can't block your self", { cause: 400 }));
  }
  const user = await findById({ model: userModel, condition: id });
  if (!user) {
    return next(new Error("In-valid user", { cause: 404 }));
  }
  if (user.role == "Admin") {
    return next(new Error("You can't block any Admim", { cause: 400 }));
  }
  if (user.status == "blocked") {
    user.status = "offline";
  } else {
    user.changeTime = Date.now();
    user.status = "blocked";
  }
  await user.save();
  return res.status(200).json({ message: "Done" });
});
export const profile = asyncHandler(async (req, res, next) => {
  const { user } = req;
  return res.status(200).json({ message: "Done", user });
});
export const getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await findOne({
    model: userModel,
    condition: { _id: id, status: { $ne: "blocked" } },
  });
  if (!user) {
    return next(new Error("In-valid user", { cause: 404 }));
  }
  return res.status(200).json({ message: "Done", user });
});
export const users = asyncHandler(async (req, res, next) => {
  const users = await find({
    model: userModel,
    select: "-password",
  });
  if (!users.length) {
    return next(new Error("In-valid users", { cause: 404 }));
  }
  return res.status(200).json({ message: "Done", users });
});
