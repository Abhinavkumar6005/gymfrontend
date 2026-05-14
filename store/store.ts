import { configureStore } from "@reduxjs/toolkit";
import plansSlice from "./Slices/PlansSlice";
import authSlice from "./Slices/authSlice";
import membersReducer from "./Slices/membersSlice";
export const makeStore = () =>
  configureStore({
    reducer: {
        plans: plansSlice,
        auth: authSlice,
        members: membersReducer,

    },
    devTools: process.env.NODE_ENV !== "production",
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

