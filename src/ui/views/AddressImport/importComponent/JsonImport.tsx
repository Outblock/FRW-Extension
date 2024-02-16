import { useEffect, useState, useContext } from "react";
import { findAddressWithPK } from "../findAddressWithPK";
import { KEY_TYPE } from "../constants";
import React from "react";
import { Box, Button, Typography, TextField, IconButton, TextareaAutosize, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { LLSpinner } from 'ui/FRWComponent';
import { jsonToKey } from '../passkey'

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
    fontWeight: 400,
  },
  inputChild: {
    width: '100%', // Fix full width
    borderRadius: '16px',
    backgroundColor: '#2C2C2C',
    padding: '20px 0',
    color: '#fff',
    marginBottom: '16px',
    resize: 'none',
    fontSize: '16px',
    fontFamily: 'Inter',
    fontWeight: 400,
  },
  input: {
    '& .MuiInputBase-input': {
      padding:'0 20px',
      fontWeight:400
    },
  },
  button: {
    width: '100%', // Fix full width
    fontWeight: 'bold',
  },
}));

const JsonImport = ({ onOpen, onImport }) => {
  const classes = useStyles();
  const [isLoading, setLoading] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [json, setJson] = useState("")
  const [errorMesssage, setErrorMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const hasJsonStructure = (str) => {
    if (typeof str !== "string") return false;
    try {
      const result = JSON.parse(str);
      const type = Object.prototype.toString.call(result);
      return type === "[object Object]" || type === "[object Array]";
    } catch (err) {
      return false;
    }
  };

  const handleImport = async (e) => {
    try {
      setLoading(true)
      e.preventDefault();
      const keystore = e.target[0].value
      const password = e.target[2].value
      const address = e.target[5].value
      const pk = await jsonToKey(keystore, password)
      const pkHex = Buffer.from(pk.data()).toString('hex')
      const result = await findAddressWithPK(pkHex, address)
      console.log(result)
      if (!result) {
        onOpen();
        return;
      }
      const accounts = result.map((a) => ({ ...a, type: KEY_TYPE.KEYSTORE }))
      onImport(accounts);
    } finally {
      setLoading(false)
    }
  };

  const checkJSONImport = (event) => {
    setJson(event);
    if (event.length === 0) {
      setIsInvalid(false);
      setErrorMessage("");
      return false;
    }
    const result = hasJsonStructure(event);
    setIsInvalid(!result);
    setErrorMessage(!result ? "Not a valid json input" : "");
    return result;
  };

  return (
    <Box sx={{ padding: '0' }}>
      <form id="seed" onSubmit={handleImport} className={classes.form}>
        <TextareaAutosize
          minRows={5}
          placeholder="You can import the json file from other wallet (eg. Blocto)"
          className={classes.textarea}
          required
        />
        <TextField
          required
          placeholder="Enter password for json file"
          type={isVisible ? 'text' : 'password'}
          className={classes.input}
          InputProps={{
            className: classes.inputChild,
            endAdornment: (
              <InputAdornment position="end" sx={{paddingRight:'20px'}}>
                <IconButton onClick={toggleVisibility} edge="end">
                  {isVisible ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
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

export default JsonImport;
