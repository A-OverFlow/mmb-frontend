// src/store.js
import {configureStore} from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import alertReducer from './slices/alertSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    alert: alertReducer
  },
});

export default store;
