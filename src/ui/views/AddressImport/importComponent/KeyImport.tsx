import { useEffect, useState, useContext } from "react";
import { findAddressWithPK } from "../findAddressWithPK";
import { KEY_TYPE } from "../constants";
import React from "react";
import { Box, Button, Typography, TextField, TextareaAutosize } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { LLSpinner } from 'ui/FRWComponent';
import HDWallet from 'ethereum-hdwallet';


const useStyles = makeStyles((theme) => ({
  form: {
    width: '100%', // Fix full width
    display: 'flex',
    flexDirection: 'column',
  },
  textarea: {
    width: '100%', // Fix full width
    borderRadius: '16px',
    backgroundColor: '#2C2C2C',
    padding: '20px',
    color: '#fff',
    marginBottom: '16px',
    resize: 'none',
    fontSize: '16px',
    fontFamily: 'Inter',
  },
  button: {
    width: '100%', // Fix full width
    fontWeight: 'bold',
  },
}));
const KeyImport = ({ onOpen, onImport }) => {
  // const classes = useStyles();
  const classes = useStyles();

  const [isLoading, setLoading] = useState(false);

  const handleImport = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();
      const pk = e.target[0].value.replace(/^0x/, "");
      const flowAddressRegex = /^(0x)?[0-9a-fA-F]{16}$/;
      const inputValue = e.target[1].value;
      const address = flowAddressRegex.test(inputValue) ? inputValue : null;
      const result = await findAddressWithPK(pk, address);
      // if (!result) {
      //   onOpen();
      //   return;
      // }
      const accounts = result.map((a) => ({ ...a, type: KEY_TYPE.PRIVATE_KEY }))
      console.log("accounts ==>", accounts)
      onImport(accounts);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: '0' }}>
      <form id="seed" onSubmit={handleImport} className={classes.form}>
        <TextareaAutosize
          placeholder="Enter your Private key"
          className={classes.textarea}
          required
        />
        <TextareaAutosize
          placeholder="Enter your flow address (Optional)"
          className={classes.textarea}
          defaultValue={""}

        />
        <Button
          className="registerButton"
          variant="contained"
          color="secondary"
          form="seed"
          size="large"
          type="submit"
          sx={{
            height: '56px',
            width: '640px',
            borderRadius: '12px',
            textTransform: 'capitalize',
            gap: '12px',
            display: 'flex'
          }}
          disabled={isLoading}

        >
          {isLoading && <LLSpinner size={28} />}
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 'bold' }}
            color="background.paper"
          >
            Import
          </Typography>
        </Button>
      </form>
    </Box>
  );
};

export default KeyImport;