import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Button, Typography, IconButton, Input, InputAdornment, FormGroup } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';

import SlideRelative from '@/ui/FRWComponent/SlideRelative';
import { useWallet } from 'ui/utils';

import CancelIcon from '../../../../../components/iconfont/IconClose';

// const helperTextStyles = makeStyles(() => ({
//   root: {
//     size: '16px',
//     color: '#BABABA',
//   },
// }));

const useStyles = makeStyles(() => ({
  customInputLabel: {
    '& legend': {
      visibility: 'visible',
    },
  },
  inputBox: {
    height: '64px',
    padding: '16px',
    zIndex: '999',
    backgroundColor: '#282828',
    border: '2px solid #4C4C4C',
    borderRadius: '12px',
    boxSizing: 'border-box',
    '&.Mui-focused': {
      border: '2px solid #FAFAFA',
      boxShadow: '0px 8px 12px 4px rgba(76, 76, 76, 0.24)',
    },
  },
  inputBox2: {
    height: '64px',
    padding: '16px',
    zIndex: '999',
    backgroundColor: '#282828',
    border: '2px solid #4C4C4C',
    borderRadius: '12px',
    boxSizing: 'border-box',
    '&.Mui-focused': {
      border: '2px solid #FAFAFA',
      boxShadow: '0px 8px 12px 4px rgba(76, 76, 76, 0.24)',
    },
  },
}));

const DecryptWallet = ({ handleClick, setMnemonic, username }) => {
  const classes = useStyles();
  const wallet = useWallet();

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [isCharacters, setCharacters] = useState(false);
  // const [isCheck, setCheck] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const errorInfo = (message) => {
    return (
      <Box
        sx={{
          width: '95%',
          backgroundColor: 'error.light',
          mx: 'auto',
          borderRadius: '0 0 12px 12px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <CancelIcon size={24} color={'#E54040'} style={{ margin: '8px' }} />
        <Typography variant="body1" color="error.main">
          {message}
        </Typography>
      </Box>
    );
  };

  const [helperText, setHelperText] = useState(<div />);

  const decryptWallet = async () => {
    setLoading(true);
    // await wallet.boot(password);
    // const formatted = mnemonic.trim().split(/\s+/g).join(' ');
    // await wallet.createKeyringWithMnemonics(formatted);
    try {
      const mnemonic = await wallet.restoreAccount(username, password);
      // console.log('mnemonic ->', mnemonic);
      setLoading(false);
      setMnemonic(mnemonic);
      handleClick();
    } catch (e) {
      setLoading(false);
      setHelperText(
        errorInfo(chrome.i18n.getMessage('Incorrect__decrypt__password__please__try__again'))
      );
    }
  };

  useEffect(() => {
    if (password.length < 8) {
      setHelperText(
        errorInfo(chrome.i18n.getMessage('The__decrypt__password__should__be__8__characters__long'))
      );
      setCharacters(false);
    } else {
      setHelperText(<div />);
      setCharacters(true);
    }
  }, [password]);

  return (
    <>
      <Box className="registerBox">
        <Typography variant="h4">
          {chrome.i18n.getMessage('Welcome__Back')}
          <Box display="inline" color="primary.main">
            {username}
          </Box>{' '}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {chrome.i18n.getMessage('Please__enter__your__password__to__decrypt')}
        </Typography>

        <Box
          sx={{
            flexGrow: 1,
            width: 640,
            maxWidth: '100%',
            my: '32px',
            display: 'flex',
          }}
        >
          <FormGroup sx={{ width: '100%' }}>
            <Input
              id="pass"
              type={isPasswordVisible ? 'text' : 'password'}
              name="password"
              placeholder={chrome.i18n.getMessage('Enter__Your__Password')}
              value={password}
              className={classes.inputBox}
              fullWidth
              autoFocus
              disableUnderline
              autoComplete="new-password"
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={() => setPasswordVisible(!isPasswordVisible)}>
                    {isPasswordVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              }
            />
            <SlideRelative direction="down" show={!!password}>
              {helperText}
            </SlideRelative>
          </FormGroup>
        </Box>

        <Box sx={{ flexGrow: 1 }} />
        <Button
          className="registerButton"
          onClick={decryptWallet}
          disabled={!isCharacters}
          variant="contained"
          color="secondary"
          size="large"
          sx={{
            height: '56px',
            borderRadius: '12px',
            width: '640px',
            textTransform: 'capitalize',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="background.paper">
            {chrome.i18n.getMessage('Restore__My__Wallet')}
          </Typography>
        </Button>
      </Box>
    </>
  );
};

export default DecryptWallet;
