'use client';

import { Snackbar, Alert } from '@mui/material';
import React from 'react';

interface WarningSnackbarProps {
  open: boolean;
  onClose: () => void;
  alertIcon: string;
  message: string;
}

export default function WarningSnackbar({
  open,
  onClose,
  alertIcon,
  message,
}: WarningSnackbarProps) {
  return (
    <Snackbar open={open} autoHideDuration={2000} onClose={onClose} sx={{ zIndex: '2000' }}>
      <Alert
        icon={<img src={alertIcon} alt="alert icon" />}
        variant="filled"
        severity="warning"
        sx={{
          color: '#FFFFFF',
          padding: '0 16px',
          fontSize: '12px',
          fontWeight: '400',
          borderRadius: '24px',
          margin: '0 auto 80px',
          zIndex: '2000',
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
