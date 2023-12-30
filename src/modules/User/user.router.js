import { auth } from "../../middleware/auth.js";
import * as validators from "./user.validation.js";
import * as authController from "./controller/user.js";
import { Router } from "express";
import endPoint from "./user.endPoints.js";
import { fileValidation, myMulter } from "../../utils/multer.js";
import validation from "../../middleware/validation.js";
const router = Router();
router.patch(
  "/profilePic",
  myMulter(fileValidation.image).single("image"),
  validation(validators.profilePic),
  auth(endPoint.allUsers),
  authController.profilePic
);
router.patch(
  "/deleteProfilePic",
  validation(validators.token),
  auth(endPoint.allUsers),
  authController.deleteProfilePic
);
router.patch(
  "/updatePassword",
  validation(validators.updatePassword),
  auth(endPoint.allUsers),
  authController.updatePassword
);
router.patch(
  "/softDelete",
  validation(validators.token),
  auth(endPoint.allUsers),
  authController.softDelete
);
router.patch(
  "/:id/blockUser",
  validation(validators.blockUser),
  auth(endPoint.blockUser),
  authController.blockUser
);
router.get(
  "/profile",
  validation(validators.token),
  auth(endPoint.allUsers),
  authController.profile
);
router.get(
  "/:id",
  validation(validators.getUserById),
  authController.getUserById
);
router.get("/", authController.users);

export default router;
