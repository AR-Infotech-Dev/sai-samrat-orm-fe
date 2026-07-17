import { configureStore } from "@reduxjs/toolkit";
import moduleFiltersReducer from "./moduleFiltersSlice";
import usersReducer from "@modules/users/data/users.slice"
import customersReducer from "@modules/customer/data/customer.slice";
import productsReducer from "@modules/products/data/products.slice";
import categoriesReducer from "@modules/category/data/categories.slice";
import menuMasterReducer from "@modules/menu-master/data/menuMaster.slice";

export const store = configureStore({
  reducer: {
    moduleFilters: moduleFiltersReducer,
    users: usersReducer,
    customers: customersReducer,
    products: productsReducer,
    categories: categoriesReducer,
    menuMaster: menuMasterReducer,
  },
});

export default store;
