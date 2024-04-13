import { auth } from "../../middleware/auth.js";
import validation from "../../middleware/validation.js";
import { fileValidation, myMulter } from "../../utils/multer.js";
import endPoint from "./subcategory.endPoints.js";
import * as validators from "./subcategory.validation.js";
import * as subcategoryController from "./controller/subcategory.js";
import { Router } from "express";
const router = Router({ mergeParams: true });
import productRouter from "../Product/product.router.js";
router.use("/:subcategoryId/product", productRouter);
router.post(
  "/",
  myMulter(fileValidation.image).single("image"),
  validation(validators.createSubcategory),
  auth(endPoint.Admin),
  subcategoryController.createSubcategory
);
router.put(
  "/:id",
  myMulter(fileValidation.image).single("image"),
  validation(validators.updateSubcategory),
  auth(endPoint.Admin),
  subcategoryController.updateSubcategory
);
router.get(
  "/",
  validation(validators.subCategories),
  subcategoryController.subCategories
);
router.get(
  "/subCategoryByCategoryId",
  validation(validators.subCategoryByCategoryId),
  subcategoryController.subCategoryByCategoryId
);
router.get(
  "/mySubcategory",
  validation(validators.mySubcategory),
  subcategoryController.mySubcategory
);
router.get(
  "/:id",
  validation(validators.getSubcategoryById),
  subcategoryController.getSubcategoryById
);

export default router;
