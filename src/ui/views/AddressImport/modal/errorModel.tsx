import React from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, FormControl, Select } from '@mui/material';
import { useHistory } from 'react-router-dom';

const ErrorModel = ({ isOpen, onOpenChange, errorName, errorMessage }) => {
  const history = useHistory();


  const handleSubmit = () => {
    history.goBack();
  };

  return (
    <Dialog open={isOpen} onClose={() => onOpenChange(true)}>
      <DialogTitle>{errorName}</DialogTitle>
      <DialogContent>
        <h2>{errorMessage}</h2>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onOpenChange(true)}>
          Cancel
        </Button>
        <Button
          form="address"
          color="primary"
          variant="contained"
          onClick={() => handleSubmit()}
        >
          Go Back
        </Button>
      </DialogActions>
    </Dialog>
  );
};


export default ErrorModel;
