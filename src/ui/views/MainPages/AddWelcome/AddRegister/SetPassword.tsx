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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/system';
import HDWallet from 'ethereum-hdwallet';
import React, { useState } from 'react';
import zxcvbn from 'zxcvbn';

import { storage } from '@/background/webapi';
import SlideRelative from '@/ui/FRWComponent/SlideRelative';
import { type AccountKey } from 'background/service/networkModel';
import { LLSpinner } from 'ui/FRWComponent';
import { useWallet, saveIndex } from 'ui/utils';

import CheckCircleIcon from '../../../../../components/iconfont/IconCheckmark';
import CancelIcon from '../../../../../components/iconfont/IconClose';
import { BpUncheked, BpCheckedIcon } from '../../../../FRWAssets/icons/CustomCheckboxIcons';

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

const SetPassword = ({ handleClick, mnemonic, username, setExPassword, tempPassword }) => {
  const classes = useStyles();
  const wallet = useWallet();

  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const [password, setPassword] = useState(tempPassword);
  const [isCheck, setCheck] = useState(false);
  const [isLoading, setLoading] = useState(false);
  // TODO: FIX ME
  const [notBot, setNotBot] = useState(true);

  const [errMessage, setErrorMessage] = useState('Something wrong, please try again');
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
    // track the time until account_created is called
    wallet.openapi
      .register(accountKey, username)
      .then((response) => {
        return wallet.boot(password);
      })
      .then((response) => {
        setExPassword(password);
        storage.remove('premnemonic');
        return wallet.createKeyringWithMnemonics(mnemonic);
      })
      .then((accounts) => {
        handleClick();
        return wallet.openapi.createFlowAddress();
      })
      .then((address) => {
        setLoading(false);
      })
      .catch((error) => {
        console.log('error', error);
        setShowError(true);
        setLoading(false);
      });
  };

  return (
    <>
      <Box className="registerBox">
        <Typography variant="h4">{chrome.i18n.getMessage('Confirm__Password')} </Typography>
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
            <Box style={{ marginBottom: '24px' }}>
              <SlideRelative show={!!password} direction="down">
                {helperText}
              </SlideRelative>
            </Box>
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
          disabled={isLoading ? true : !(isCheck && notBot)}
        >
          {isLoading && <LLSpinner size={28} />}
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="background.paper">
            {chrome.i18n.getMessage('Register')}
          </Typography>
        </Button>
      </Box>
      <Snackbar open={showError} autoHideDuration={6000} onClose={handleErrorClose}>
        <Alert onClose={handleErrorClose} variant="filled" severity="error" sx={{ width: '100%' }}>
          {errMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SetPassword;
