import Router from "express";
import {
  loginController,
  logoutController,
} from "../controllers/Auth/auth.controller";
import { checkJwt } from "../middlewares/checkJwt";
import { itemsController } from "../controllers/Item/items.controller";
import { salesController } from "../controllers/Sales/sale.controller";
import { customersController } from "../controllers/Customer/customer.controller";
import { exchangedItemsController } from "../controllers/ExchangeItem/exchangeItem.controller";
import { checkToken } from "../controllers/checkToken";

const route = Router();

//Auth routes
route.post("/login", loginController);
route.post("/logout", logoutController);

//tochecktoken for frontend
route.get("/verify/token", checkToken);
//setting middleware to check all routes
route.use(checkJwt);

//Item routes
route.get("/item/all", itemsController.getAllItems);
route.post("/item/add", itemsController.addItems);
route.get("/item/:id", itemsController.getOneItem);
route.get("/item/search", itemsController.searchItem);
route.patch("/item/update/:id", itemsController.updateItems);
route.delete("/item/delete/:id", itemsController.deleteItems);

// ========== CUSTOMER ROUTES ==========
route.post("/customers", customersController.createCustomer);
route.get("/customers", customersController.getAllCustomers);
route.get("/customers/:id", customersController.getCustomerById);
route.put("/customers/:id", customersController.updateCustomer);
// route.delete("/customers/:id", customersController.deleteCustomer);
route.get(
  "/customers/:id/purchase-history",
  customersController.getCustomerPurchaseHistory,
);

//sales route
route.post("/sales", salesController.createSale);
route.get("/sales", salesController.getAllSales);
route.get("/sales/stats", salesController.getSalesStats);
route.get("/sales/:id", salesController.getSaleById);
route.put("/sales/:id", salesController.updateSale);

// ========== EXCHANGE ROUTES ==========
route.post("/exchanges", exchangedItemsController.createExchange);
route.get("/exchanges", exchangedItemsController.getAllExchanges);
route.get("/exchanges/stats", exchangedItemsController.getExchangeStats);
route.get("/exchanges/:id", exchangedItemsController.getExchangeById);
route.put("/exchanges/:id", exchangedItemsController.updateExchange);
// route.delete("/exchanges/:id", exchangedItemsController.deleteExchange);

export default route;
