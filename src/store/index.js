import { configureStore } from "@reduxjs/toolkit";
import moduleFiltersReducer from "./moduleFiltersSlice";
import usersReducer from "@modules/users/data/users.slice";
import customersReducer from "@modules/customer/data/customer.slice";
import productsReducer from "@modules/products/data/products.slice";
import categoriesReducer from "@modules/category/data/categories.slice";
import menuMasterReducer from "@modules/menu-master/data/menuMaster.slice";
import orderBookingReducer from "@modules/orders/booking/data/booking.slice";
import orderConfirmationReducer from "@modules/orders/confirmation/data/confirmation.slice";
import orderPlanningReducer from "@modules/orders/planning/data/planning.slice";
import orderProductionReducer from "@modules/orders/production/data/production.slice";
import readyStockReducer from "@modules/orders/ready-stock/data/readyStock.slice";
import dispatchReducer from "@modules/orders/dispatch/data/dispatch.slice";

export const store = configureStore({
  reducer: {
    moduleFilters: moduleFiltersReducer,
    users: usersReducer,
    customers: customersReducer,
    products: productsReducer,
    categories: categoriesReducer,
    menuMaster: menuMasterReducer,
    orderBooking: orderBookingReducer,
    orderConfirmation: orderConfirmationReducer,
    orderPlanning: orderPlanningReducer,
    orderProduction: orderProductionReducer,
    readyStock: readyStockReducer,
    dispatch: dispatchReducer,
  },
});

export default store;

