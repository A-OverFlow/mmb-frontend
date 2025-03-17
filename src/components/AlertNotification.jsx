import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { hideAlert } from '../slices/alertSlice';

const AlertNotification = () => {
  const dispatch = useDispatch();
  const { open, message, severity } = useSelector((state) => state.alert);

  const handleClose = () => {
    dispatch(hideAlert());
  };

  return (
    <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={open} autoHideDuration={6000} onClose={handleClose}>
      <Alert onClose={handleClose} severity={severity}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AlertNotification;
