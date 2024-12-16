import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Button,
  Typography,
  IconButton,
  Alert,
  Snackbar,
  Link,
  Input,
  InputAdornment,
  FormGroup,
  LinearProgress,
} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { makeStyles, styled } from '@mui/styles';
import { Box } from '@mui/system';
import HDWallet from 'ethereum-hdwallet';
import React, { useEffect, useState } from 'react';
import zxcvbn from 'zxcvbn';

import { storage } from '@/background/webapi';
import { LLSpinner } from '@/ui/FRWComponent';
import SlideRelative from '@/ui/FRWComponent/SlideRelative';
import { type AccountKey } from 'background/service/networkModel';
import { useWallet, saveIndex } from 'ui/utils';

import CheckCircleIcon from '../../../components/iconfont/IconCheckmark';
import CancelIcon from '../../../components/iconfont/IconClose';
import { BpUncheked, BpCheckedIcon } from '../../FRWAssets/icons/CustomCheckboxIcons';

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

const SetPassword = ({ handleClick, mnemonic, username }) => {
  const classes = useStyles();
  const wallet = useWallet();

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCharacters, setCharacters] = useState(false);
  const [isMatch, setMatch] = useState(false);
  const [isCheck, setCheck] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const [errMessage, setErrorMessage] = useState('Something went wrong, please try again.');
  const [showError, setShowError] = useState(false);

  const handleErrorClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowError(false);
  };

  const getAccountKey = (mnemonic) => {
    const hdwallet = HDWallet.fromMnemonic(mnemonic);
    const publicKey = hdwallet.derive("m/44'/539'/0'/0/0").getPublicKey().toString('hex');
    const key: AccountKey = {
      hash_algo: 1,
      sign_algo: 2,
      weight: 1000,
      public_key: publicKey,
    };
    return key;
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

  const register = async () => {
    setLoading(true);

    await saveIndex(username);
    const accountKey = getAccountKey(mnemonic);

    wallet.openapi
      .register(accountKey, username)
      .then((response) => {
        setLoading(false);
        return wallet.boot(password);
      })
      .then((response) => {
        const formatted = mnemonic.trim().split(/\s+/g).join(' ');
        storage.remove('premnemonic');
        return wallet.createKeyringWithMnemonics(formatted);
      })
      .then((accounts) => {
        handleClick();
        return wallet.openapi.createFlowAddress();
      })
      .then((address) => {
        // console.log('address -->', address);
      })
      .catch((error) => {
        console.log('error -->', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (password.length > 7) {
      setHelperText(successInfo(chrome.i18n.getMessage('At__least__8__characters')));
      setCharacters(true);
    } else {
      setHelperText(errorInfo(chrome.i18n.getMessage('At__least__8__characters')));
      setCharacters(false);
    }
  }, [password]);

  useEffect(() => {
    if (confirmPassword === password) {
      setHelperMatch(successInfo(chrome.i18n.getMessage('Passwords__match')));
      setMatch(true);
    } else {
      setMatch(false);
      setHelperMatch(errorInfo(chrome.i18n.getMessage('Your__passwords__do__not__match')));
    }
  }, [confirmPassword, password]);

  return (
    <>
      <Box className="registerBox">
        <Typography variant="h4">
          {chrome.i18n.getMessage('Create') + ' '}
          <Box display="inline" color="primary.main">
            {' ' + chrome.i18n.getMessage('Password')}
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
              autoFocus
              disableUnderline
              autoComplete="new-password"
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
            <SlideRelative direction="down" show={!!password}>
              {helperText}
            </SlideRelative>
            <Input
              sx={{ pb: '30px', marginTop: password ? '0px' : '24px' }}
              id="pass2"
              type={isConfirmPasswordVisible ? 'text' : 'password'}
              name="password2"
              placeholder={chrome.i18n.getMessage('Confirm__your__password')}
              value={confirmPassword}
              className={classes.inputBox2}
              autoComplete="new-password"
              fullWidth
              disableUnderline
              onChange={(event) => {
                setConfirmPassword(event.target.value);
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                    {isConfirmPasswordVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              }
            />
            <SlideRelative direction="down" show={!!confirmPassword}>
              {helperMatch}
            </SlideRelative>
          </FormGroup>
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              icon={<BpUncheked />}
              checkedIcon={<BpCheckedIcon />}
              onChange={(event) => setCheck(event.target.checked)}
            />
          }
          label={
            <Typography variant="body1" color="text.secondary">
              {chrome.i18n.getMessage('I__agree__to__Lilico') + ' '}
              <Link
                underline="none"
                href="https://lilico.app/about/privacy-policy"
                target="_blank"
                color="success.main"
              >
                {chrome.i18n.getMessage('Privacy__Policy')}
              </Link>{' '}
              {chrome.i18n.getMessage('and') + ' '}
              <Link
                href="https://lilico.app/about/terms"
                target="_blank"
                color="success.main"
                underline="none"
              >
                {chrome.i18n.getMessage('Terms__of__Service')}
              </Link>{' '}
              .
            </Typography>
          }
        />
        <Button
          className="registerButton"
          variant="contained"
          color="secondary"
          onClick={register}
          size="large"
          sx={{
            height: '56px',
            width: '640px',
            borderRadius: '12px',
            textTransform: 'capitalize',
            gap: '12px',
            display: 'flex',
          }}
          disabled={isLoading ? true : !(isMatch && isCharacters && isCheck)}
        >
          {isLoading && <LLSpinner size={28} />}
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="background.paper">
            {chrome.i18n.getMessage('Register')}
          </Typography>
        </Button>
        <Snackbar open={showError} autoHideDuration={6000} onClose={handleErrorClose}>
          <Alert
            onClose={handleErrorClose}
            variant="filled"
            severity="error"
            sx={{ width: '100%' }}
          >
            {errMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default SetPassword;
