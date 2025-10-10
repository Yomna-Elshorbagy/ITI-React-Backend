import { Router } from "express";
import * as userController from "./user.controllers.js";
import { auth } from "../../middelwares/auth.js";
import { validate } from "../../middelwares/validate.js";
import { resetPassVal } from "./user.validation.js";
import { uploadSingleFile } from "../../utils/fileUpload/multer-cloud.js";
const userRouter = Router();

userRouter.get("/profile", auth, userController.getProfile);
userRouter.get("/allUsers", auth, userController.getAllUsers);

// ===> Analysis routes for dashboard
userRouter.get("/analysis/overview", auth, userController.getUsersOverview);
userRouter.get(
  "/analysis/deleted",
  auth,
  userController.getDeletedUsersAnalysis
);
userRouter.get("/analysis/demographics", auth, userController.getDemographics);

userRouter.put(
  "/reset-pass",
  auth,
  validate(resetPassVal),
  userController.resetPassword
);
userRouter.put(
  "/",
  auth,
  uploadSingleFile("image", "users"),
  userController.updateUser
);
userRouter.delete("/", auth, userController.deleteUser);
userRouter.delete("/softDelete", auth, userController.softDeleteUser);

export default userRouter;
