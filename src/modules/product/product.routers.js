import { Router } from "express";
import * as productControllers from "./product.controllers.js";
import { roles } from "../../utils/constant/enums.js";
import { auth, isAuthorized } from "../../middelwares/auth.js";
import { uploadMixFiles } from "../../utils/fileUpload/multer-cloud.js";
import { validate } from "../../middelwares/validate.js";
import { addProductVal } from "./product.validation.js";

const productRouter = Router();
productRouter.get("/getproducts", productControllers.getProducts);

productRouter
  .route("/")
  .post(
    auth,
    isAuthorized([roles.ADMIN]),
    uploadMixFiles([
      { name: "imageCover", maxCount: 1 },
      { name: "subImages", maxCount: 8 },
    ]),
    validate(addProductVal),
    productControllers.addProduct
  )
  .get(productControllers.getAllProducts);
productRouter.get("/trending", productControllers.getTrendingProducts);
productRouter.get("/topSelling",auth, productControllers.getTopSellingProducts);
productRouter.get("/lowstock", productControllers.getLowStock);
productRouter.get("/export", auth, productControllers.exportProducts);
productRouter.get("/related/:productId", productControllers.getRelatedProducts);

productRouter.post("/import", auth, productControllers.importProducts);
productRouter.post(
  "/notify-price-drop/:productId",
  auth,
  productControllers.notifyUsersAboutPriceDrop
);
productRouter.get(
  "/get-subscribed-prices",
  auth,
  productControllers.getUserPriceSubscriptions 
);
productRouter.post(
  "/subscribe-price/:productId",
  auth,
  productControllers.subscribeToPriceDrop
);
productRouter.delete(
  "/unsubscribe-price/:productId",
  auth,
  productControllers.removePriceDropSubscription
);
productRouter.get(
  "/contact/:productId",
  auth,
  productControllers.contactProductOwner
);
productRouter
  .route("/:id")
  .get(productControllers.getSpeCificProduct)
  .put(
    auth,
    isAuthorized([roles.ADMIN]),
    uploadMixFiles([
      { name: "imageCover", maxCount: 1 },
      { name: "subImages", maxCount: 8 },
    ]),
    productControllers.updateProductCloud
  );
productRouter.get("/related/:productId", productControllers.getRelatedProducts);
productRouter.put(
  "/soft/:id",
  auth,
  isAuthorized([roles.ADMIN]),
  productControllers.softDeleteProduct
);
productRouter.delete(
  "/:id",
  auth,
  isAuthorized([roles.ADMIN]),
  productControllers.deleteProduct
);

export default productRouter;
