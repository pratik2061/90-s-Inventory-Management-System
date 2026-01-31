import Router from "express";
import {
  loginController,
  logoutController,
} from "../controllers/Auth/auth.controller";
import { checkJwt } from "../middlewares/checkJwt";
import { itemsController } from "../controllers/Item/items.controller";

const route = Router();

//Auth routes
route.post("/login", loginController);
route.post("/logout", logoutController);

//setting middleware to check all routes
route.use(checkJwt);

//Item routes
route.get("/item/all", itemsController.getAllItems);
route.post("/item/add", itemsController.addItems);

export default route;
