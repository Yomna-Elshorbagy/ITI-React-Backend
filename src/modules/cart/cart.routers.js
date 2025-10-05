import { Router } from "express";
import { auth } from "../../middelwares/auth.js";
import * as cartControllers from "./cart.controllers.js";


const cartRouter = Router();

cartRouter.get('/', auth, cartControllers.viewCart)
cartRouter.post('/', auth, cartControllers.addToCart)
cartRouter.put('/:id', auth, cartControllers.updateQuantity)
cartRouter.put('/deleteitem/:id', auth, cartControllers.deleteFromCart)
cartRouter.delete('/', auth, cartControllers.clearCart)

export default cartRouter;