import { Router } from "express";
import { auth } from "./../../middelwares/auth.js";
import * as orderControllers from "./order.controllers.js";

const orderRouter = Router();
orderRouter.get("/", auth, orderControllers.getUserOrders);
orderRouter.post("/", auth, orderControllers.createOrder);
orderRouter.get("/:id", auth, orderControllers.getOrderDetails);

export default orderRouter;
