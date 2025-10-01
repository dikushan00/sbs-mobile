import { combineReducers, configureStore } from "@reduxjs/toolkit";
import app from "./reducers/app";
import userApp from "./reducers/userApp";

const rootReducer = combineReducers({ app, userApp });

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = (
  dispatch: AppDispatch,
  getState: () => RootState
) => ReturnType;
