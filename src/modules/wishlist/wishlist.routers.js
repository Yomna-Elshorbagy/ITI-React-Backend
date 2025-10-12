import { Router } from "express";
import * as wishlistController from "./wishlist.controllers.js";
import { validate } from "../../middelwares/validate.js";
import { addWishlistVal, deleteWishlistVal } from "./wishlist.validation.js";
import { auth } from "../../middelwares/auth.js";

const wishlistRouter = Router();

wishlistRouter.get("/", auth, wishlistController.getLoggedUserWishlist);
wishlistRouter.put(
  "/",
  auth,
  validate(addWishlistVal),
  wishlistController.addToWishlist
);
wishlistRouter.put("/clear", auth, wishlistController.clearWishlist);

wishlistRouter.put(
  "/:productId",
  auth,
  validate(deleteWishlistVal),
  wishlistController.deleteWishlist
);

export default wishlistRouter;
