import React from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, FormControl, Select, Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';

const ErrorModel = ({ isOpen, onOpenChange, errorName, errorMessage }) => {
  const history = useHistory();


  const handleSubmit = () => {
    history.goBack();
  };

  return (
    <Dialog open={isOpen} onClose={() => onOpenChange(true)}>
      <DialogTitle><Typography>{errorName}</Typography></DialogTitle>
      <DialogContent>
        <Typography>{errorMessage}</Typography>
      </DialogContent>
      <DialogActions sx={{ padding: '16px 24px' }}>
        <Button onClick={() => onOpenChange(true)}>
          {chrome.i18n.getMessage('Cancel')}
        </Button>
        <Button
          form="address"
          color="primary"
          variant="contained"
          onClick={() => handleSubmit()}
        >
          {chrome.i18n.getMessage('Back')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


export default ErrorModel;
