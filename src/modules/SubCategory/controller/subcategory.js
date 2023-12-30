import slugify from "slugify";
import { asyncHandler } from "../../../utils/errorHandling.js";
import cloudinary from "../../../utils/cloudinary.js";
import {
  create,
  findById,
  findOneAndUpdate,
} from "../../../../DB/DBMethods.js";
import categoryModel from "../../../../DB/models/Category.js";
import paginate from "../../../utils/paginate.js";
import subcategoryModel from "../../../../DB/models/Subcategory.js";
import { nanoid } from "nanoid";

export const createSubcategory = asyncHandler(async (req, res, next) => {
  const { user } = req;
  req.body.name = req.body.name.toLowerCase();
  const { name } = req.body;
  const { categoryId } = req.params;
  if (user.deleted) {
    return next(new Error("Your account is stopped", { cause: 400 }));
  }
  const category = await findById({
    model: categoryModel,
    condition: categoryId,
  });
  if (!category) {
    return next(new Error("In-valid categoryId", { cause: 404 }));
  }
  const checkName = await findOne({
    model: subcategoryModel,
    condition: { name },
    select: "name",
  });
  if (checkName) {
    return next(new Error("Dupplicate name", { cause: 409 }));
  }
  req.body.slug = slugify(req.body.name, {
    replacement: "-",
    lower: true,
    trim: true,
  });
  const cloudId = nanoid();
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.PROJECTNAME}/category/${category.cloudId}/${cloudId}`,
    }
  );
  req.body.cloudId = cloudId;
  req.body.image = { secure_url, public_id };
  req.body.createdBy = user._id;
  req.body.categoryId = category._id;
  const subcategory = await create({ model: subcategoryModel, data: req.body });
  if (!subcategory) {
    await cloudinary.uploader.destroy(public_id);
    return next(new Error("Fail to create a new subcategory", { cause: 400 }));
  }
  return res.status(201).json({ message: "Done", subcategory });
});
export const updateSubcategory = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { id, categoryId } = req.params;
  const { name } = req.body;
  if (user.deleted) {
    return next(new Error("Your account is stopped", { cause: 400 }));
  }
  const category = await findById({
    model: categoryModel,
    condition: categoryId,
  });
  if (!category) {
    return next(new Error("In-valid categoryId", { cause: 404 }));
  }
  const subcategory = await findOne({
    model: subcategoryModel,
    condition: { _id: id, categoryId, createdBy: user._id },
  });
  if (!subcategory) {
    return next(new Error("In-valid subcategory"));
  }
  if (name) {
    req.body.name = req.body.name.toLowerCase();
    if (req.body.name == subcategory.name) {
      return next(
        new Error("Sory, you cannot update the name by the same name", {
          cause: 400,
        })
      );
    }
    const checkName = await findOne({
      model: subcategoryModel,
      condition: { name: req.body.name },
      select: "name",
    });
    if (checkName) {
      return next(new Error("Dupplicate name", { cause: 409 }));
    }
    req.body.slug = slugify(req.body.name, {
      replacement: "-",
      lower: true,
      trim: true,
    });
  }
  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.PROJECTNAME}/category/${category.cloudId}/${subcategory.cloudId}`,
      }
    );
    req.body.image = { secure_url, public_id };
  }
  const updateSubcategory = await findOneAndUpdate({
    model: subcategoryModel,
    condition: { _id: id, categoryId, createdBy: user._id },
    data: req.body,
    option: { new: true },
  });
  if (!updateSubcategory) {
    if (req.file) {
      await cloudinary.uploader.destroy(req.body.image.public_id);
    }
    return next(new Error("Fail to update subcategory", { cause: 404 }));
  }
  if (req.file) {
    await cloudinary.uploader.destroy(subcategory.image.public_id);
  }
  return res.status(200).json({ message: "Done" });
});
export const subCategories = asyncHandler(async (req, res, next) => {
  const { skip, limit } = paginate({
    page: req.query.page,
    size: req.query.size,
  });
  const populate = [
    {
      path: "createdBy",
      select: "userName email image",
    },
    {
      path: "categoryId",
      select: "name image",
    },
  ];
  const subCategories = await find({
    model: subcategoryModel,
    populate,
    skip,
    limit,
  });
  if (!subCategories.length) {
    return next(new Error("In-valid subcategory", { cause: 404 }));
  }
  return res.status(200).json({ message: "Done", subCategories });
});
export const getSubcategoryById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const populate = [
    {
      path: "createdBy",
      select: "userName email image",
    },
    {
      path: "categoryId",
      select: "name image",
    },
  ];
  const subcategory = await findById({
    model: subcategoryModel,
    populate,
    condition: id,
  });
  if (!subcategory) {
    return next(new Error("In-valid subcategory", { cause: 404 }));
  }
  return res.status(200).json({ message: "Done", subcategory });
});
