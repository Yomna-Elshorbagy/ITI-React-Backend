import { Router } from "express";

import * as contactControllers from "./contact.controllers.js";
import { auth } from "../../middelwares/auth.js";

const contactRouter = Router();

contactRouter.post("/", contactControllers.contactUs);
contactRouter.get("/", auth, contactControllers.getAllContacts);
contactRouter.post("/reply/:id", auth, contactControllers.replyToContact);

export default contactRouter;
