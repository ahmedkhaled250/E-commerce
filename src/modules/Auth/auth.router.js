import validation from "../../middleware/validation.js";
import * as validators from "./auth.validation.js";
import * as authController from "./controller/regiteration.js";
import { Router } from "express";
// import passport from "passport";
const router = Router();
// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );
// router.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: "/api/v1/auth/fail" }),
//   authController.googleCallback
// );
// router.get("/facebook", passport.authenticate("facebook", { scope: "email" }));
// router.get(
//   "/facebook/callback",
//   passport.authenticate("facebook", { failureRedirect: "/api/v1/auth/fail" }),
//   authController.facebookCallback
// );
// router.get(
//   "/github",
//   passport.authenticate("github", { scope: ["user:email"] })
// );
// router.get(
//   "/github/callback",
//   passport.authenticate("github", { failureRedirect: "/api/v1/auth/fail" }),
//   authController.githubCallback
// );
// router.get("/fail", authController.fail);
router.post("/signup", validation(validators.signup), authController.signup);
router.get(
  "/confirmEmail/:token",
  validation(validators.confirmEmail),
  authController.confirmEmail
);
router.get(
  "/refreshEmail/:token",
  validation(validators.confirmEmail),
  authController.refreshEmail
);
router.post("/signin", validation(validators.signin), authController.signin);
router.patch(
  "/sendCode",
  validation(validators.sendCode),
  authController.sendCode
);
router.patch(
  "/forgetPassword",
  validation(validators.forgetPassword),
  authController.forgetPassword
);
export default router;
