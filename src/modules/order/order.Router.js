import { Router } from "express";
import { auth, isAuthorized } from "./../../middelwares/auth.js";
import * as orderControllers from "./order.controllers.js";
import { roles } from "../../utils/constant/enums.js";

const orderRouter = Router();
orderRouter.get("/", auth, orderControllers.getUserOrders);
orderRouter.get("/order-count", orderControllers.getUserOrderCounts);
orderRouter.get("/exportpdf", auth, orderControllers.exportOrdersToPDF);
orderRouter.get("/exportcsv", auth, orderControllers.exportOrdersToCSV);
orderRouter.get(
  "/orderDistrbuted",
  auth,
  orderControllers.getOrdersDistributionByStatus
);
orderRouter.get("/revenue", auth, orderControllers.getRevenuePerMonth);
orderRouter.get("/allorders", auth, orderControllers.getAllOrders);
orderRouter.post("/", auth, orderControllers.createOrder);
orderRouter.get("/:id", auth, orderControllers.getOrderDetails);
orderRouter.put("/:id", auth, orderControllers.updateOrder);
orderRouter.put(
  "/status/:id",
  auth,
  isAuthorized([roles.ADMIN]),
  orderControllers.updateOrderStatus
);
orderRouter.put(
  "/soft/:id",
  auth,
  isAuthorized([roles.ADMIN]),
  orderControllers.softDeleteOrder
);

orderRouter.delete(
  "/hard/:id",
  auth,
  isAuthorized([roles.ADMIN]),
  orderControllers.hardDeleteOrder
);

export default orderRouter;
