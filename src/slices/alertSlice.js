import { createSlice } from '@reduxjs/toolkit';

const alertSlice = createSlice({
  name: 'alert',
  initialState: {
    open: false,
    message: '',
    severity: 'success', // 'success', 'error', 'info', 'warning'
  },
  reducers: {
    showAlert(state, action) {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity;
    },
    hideAlert(state) {
      state.open = false;
    },
  },
});

// 래핑 함수 추가
export const alert = {
  success: (message) => showAlert({ message, severity: 'success' }),
  error: (message) => showAlert({ message, severity: 'error' }),
  info: (message) => showAlert({ message, severity: 'info' }),
  warning: (message) => showAlert({ message, severity: 'warning' }),
};

export const { showAlert, hideAlert } = alertSlice.actions;
export default alertSlice.reducer;
