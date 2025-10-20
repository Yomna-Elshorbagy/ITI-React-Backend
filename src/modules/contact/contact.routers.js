import { Router } from "express";

import * as contactControllers from "./contact.controllers.js";
import { auth } from "../../middelwares/auth.js";

const contactRouter = Router();

contactRouter.post("/", contactControllers.contactUs);
contactRouter.get("/", auth, contactControllers.getAllContacts);
contactRouter.delete("/:id", auth, contactControllers.deleteContact);
contactRouter.delete(
  "/softdelete/:id",
  auth,
  contactControllers.softDeleteContact
);
contactRouter.post("/reply/:id", auth, contactControllers.replyToContact);

export default contactRouter;
