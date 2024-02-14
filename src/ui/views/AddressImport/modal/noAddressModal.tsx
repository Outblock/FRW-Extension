import React from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, FormControl, Select } from '@mui/material';
import { useHistory } from 'react-router-dom';

const noAddressModal = ({ isOpen, onOpenChange }) => {
  const history = useHistory();


  const handleSubmit = () => {
    history.goBack();
  };

  return (
    <Dialog open={isOpen} onClose={() => onOpenChange(true)}>
      <DialogTitle>No Account found</DialogTitle>
      <DialogContent>
        <h2>Do you wish to go back and register an account?</h2>
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


export default noAddressModal;
