import { configureStore } from "@reduxjs/toolkit";
import plansSlice from "./Slices/PlansSlice";
import authSlice from "./Slices/authSlice";
import membersReducer from "./Slices/membersSlice";
import paymentsReducer from "./Slices/paymentsSlice"; // <-- Import payments reducer
import trainersSlice from "./Slices/trainerSlice";
export const makeStore = () =>
  configureStore({
    reducer: {
        plans: plansSlice,
        auth: authSlice,
        members: membersReducer,
        payments: paymentsReducer, // <-- Add payments slice here
trainers: trainersSlice,
    },
    devTools: process.env.NODE_ENV !== "production",
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

