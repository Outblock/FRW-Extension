import React from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, FormControl, Select } from '@mui/material';

const ImportAddressModal = ({ isOpen, onOpenChange, accounts, handleAddressSelection }) => {
  const [selectedAddress, setSelectedAddress] = React.useState(accounts[0]?.address || '');

  const handleChange = (event) => {
    setSelectedAddress(event.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddressSelection(selectedAddress);
  };

  return (
    <Dialog open={isOpen} onClose={() => onOpenChange(false)}>
      <DialogTitle>{chrome.i18n.getMessage('Accounts_Found_on_Chain')}</DialogTitle>
      <DialogContent>
        <h2>{chrome.i18n.getMessage('Choose_an_account_you_want_to_import')}</h2>
        <form id="address" onSubmit={handleSubmit}>
          <FormControl fullWidth>
            <Select
              value={selectedAddress}
              onChange={handleChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Select Flow Address' }}
            >
              {accounts.map((account) => (
                <MenuItem key={account.address} value={account.address}>
                  {account.address}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onOpenChange(false)}>
          {chrome.i18n.getMessage('Cancel')}
        </Button>
        <Button
          form="address"
          color="primary"
          variant="contained"
          type="submit"
        >
          {chrome.i18n.getMessage('Import')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


export default ImportAddressModal;
