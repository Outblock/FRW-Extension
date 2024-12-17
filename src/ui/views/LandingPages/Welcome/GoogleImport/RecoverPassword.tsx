import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Button,
  Typography,
  IconButton,
  Input,
  InputAdornment,
  FormGroup,
  LinearProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { makeStyles, styled } from '@mui/styles';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import zxcvbn from 'zxcvbn';

import { LLSpinner, LLNotFound } from '@/ui/FRWComponent';
import { useWallet, saveIndex } from 'ui/utils';

import CheckCircleIcon from '../../../../../components/iconfont/IconCheckmark';
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

const BpIcon = styled('span')(() => ({
  borderRadius: 8,
  width: 24,
  height: 24,
  border: '1px solid #41CC5D',
  backgroundColor: 'transparent',
}));

const BpCheckedIcon = styled(BpIcon)({
  backgroundColor: '#41CC5D',
  backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
  '&:before': {
    display: 'block',
    width: 21,
    height: 21,
    backgroundImage:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
      " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
      "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
    content: '""',
  },
  'input:hover ~ &': {
    backgroundColor: '#41CC5D',
  },
});

const PasswordIndicator = (props) => {
  const score = zxcvbn(props.value).score;
  const precentage = ((score + 1) / 5) * 100;

  const level = (score) => {
    switch (score) {
      case 0:
      case 1:
        return { text: chrome.i18n.getMessage('Weak'), color: 'error' };
      case 2:
        return { text: chrome.i18n.getMessage('Good'), color: 'testnet' };
      case 3:
        return { text: chrome.i18n.getMessage('Great'), color: 'success' };
      case 4:
        return { text: chrome.i18n.getMessage('Strong'), color: 'success' };
      default:
        return { text: chrome.i18n.getMessage('Unknown'), color: 'error' };
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '72px', mr: 1 }}>
        <LinearProgress
          variant="determinate"
          // @ts-expect-error level function returned expected value
          color={level(score).color}
          sx={{ height: '12px', width: '72px', borderRadius: '12px' }}
          value={precentage}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">
          {level(score).text}
        </Typography>
      </Box>
    </Box>
  );
};

const SetPassword = ({ handleClick, mnemonic, username, lastPassword }) => {
  const classes = useStyles();
  const wallet = useWallet();

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [password, setPassword] = useState(lastPassword);
  const [confirmPassword, setConfirmPassword] = useState(lastPassword);
  const [isLoading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Somthing went wrong');

  const handleErrorClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowError(false);
  };

  const successInfo = (message) => {
    return (
      <Box
        sx={{
          width: '95%',
          backgroundColor: 'success.light',
          mx: 'auto',
          borderRadius: '0 0 12px 12px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <CheckCircleIcon size={24} color={'#41CC5D'} style={{ margin: '8px' }} />
        <Typography variant="body1" color="success.main">
          {message}
        </Typography>
      </Box>
    );
  };

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
  const [helperMatch, setHelperMatch] = useState(<div />);
  const [showDialog, setShowDialog] = useState(false);
  const [isCheck, setCheck] = useState(true);

  const login = async () => {
    setLoading(true);

    await saveIndex(username);
    try {
      await wallet.signInWithMnemonic(mnemonic);
      await wallet.boot(password);
      const formatted = mnemonic.trim().split(/\s+/g).join(' ');
      await wallet.createKeyringWithMnemonics(formatted);
      setLoading(false);
      handleClick();
    } catch (e) {
      setLoading(false);
      setErrorMessage(e.message);
      if (e.message === 'NoUserFound') {
        setShowDialog(true);
      } else {
        setShowError(true);
      }
    }
  };

  useEffect(() => {
    if (isCheck) {
      setPassword(lastPassword);
      setConfirmPassword(lastPassword);
    } else {
      setPassword('');
      setConfirmPassword('');
    }
  }, [isCheck, lastPassword]);

  return (
    <>
      {!showDialog ? (
        <Box className="registerBox">
          <Typography variant="h4">
            {chrome.i18n.getMessage('Welcome__Back')}
            <Box display="inline" color="primary.main">
              {username}
            </Box>{' '}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {chrome.i18n.getMessage(
              'Lilico__uses__this__password__to__protect__your__recovery__phrase'
            )}
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
                placeholder={chrome.i18n.getMessage('Create__a__password')}
                value={password}
                className={classes.inputBox}
                fullWidth
                disableUnderline
                readOnly={!(password.length < 8)}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
                endAdornment={
                  <InputAdornment position="end">
                    {password && <PasswordIndicator value={password} />}
                    <IconButton onClick={() => setPasswordVisible(!isPasswordVisible)}>
                      {isPasswordVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormGroup>
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={isCheck}
                icon={<BpIcon />}
                checkedIcon={<BpCheckedIcon />}
                onChange={(event) => setCheck(event.target.checked)}
              />
            }
            label={
              <Typography variant="body1" color="text.secondary">
                {chrome.i18n.getMessage('Use__the__same__Google__Drive__password')}
              </Typography>
            }
          />
          <Box>
            <Button
              className="registerButton"
              onClick={login}
              disabled={isLoading}
              variant="contained"
              color="secondary"
              size="large"
              sx={{
                height: '56px',
                borderRadius: '12px',
                width: '640px',
                textTransform: 'capitalize',
                display: 'flex',
                gap: '12px',
              }}
            >
              {isLoading && <LLSpinner color="secondary" size={28} />}
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="background.paper">
                {chrome.i18n.getMessage('Login')}
              </Typography>
            </Button>
          </Box>
        </Box>
      ) : (
        <LLNotFound setShowDialog={setShowDialog} />
      )}
      <Snackbar open={showError} autoHideDuration={6000} onClose={handleErrorClose}>
        <Alert onClose={handleErrorClose} variant="filled" severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SetPassword;
