import { Router } from "express";

import * as contactControllers from "./contact.controllers.js";

const contactRouter = Router();

contactRouter.post("/", contactControllers.contactUs);

export default contactRouter;
