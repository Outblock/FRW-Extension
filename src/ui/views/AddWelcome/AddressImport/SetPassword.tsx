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
import React, { useCallback, useEffect, useState } from 'react';
import zxcvbn from 'zxcvbn';

import { storage } from '@/background/webapi';
import { getHashAlgo, getSignAlgo } from '@/shared/utils/algo';
import SlideRelative from '@/ui/FRWComponent/SlideRelative';
import { AccountKey } from 'background/service/networkModel';
import { LLSpinner } from 'ui/FRWComponent';
import { useWallet, saveIndex } from 'ui/utils';

import CheckCircleIcon from '../../../../components/iconfont/IconCheckmark';
import CancelIcon from '../../../../components/iconfont/IconClose';
import { BpUncheked, BpCheckedIcon } from '../../../FRWAssets/icons/CustomCheckboxIcons';

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

const SetPassword = ({ handleClick, mnemonic, pk, username, tempPassword, accounts, goEnd }) => {
  const classes = useStyles();
  const wallet = useWallet();

  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const [password, setPassword] = useState('');
  const [isCharacters, setCharacters] = useState(false);
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

  const loadTempPassword = useCallback(async () => {
    setPassword(tempPassword);
  }, [tempPassword]);

  useEffect(() => {
    loadTempPassword();
  }, [loadTempPassword]);

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

  const handleImport = async () => {
    setLoading(true);
    const accountKeyStruct = {
      public_key: accounts[0].pubK,
      sign_algo: getSignAlgo(accounts[0].signAlgo),
      hash_algo: getHashAlgo(accounts[0].hashAlgo),
      weight: 1000,
    };
    const result = await wallet.openapi.getLocation();
    const installationId = await wallet.openapi.getInstallationId();
    const userlocation = result.data;
    const device_info = {
      city: userlocation.city,
      continent: userlocation.country,
      continentCode: userlocation.countryCode,
      country: userlocation.country,
      countryCode: userlocation.countryCode,
      currency: userlocation.countryCode,
      device_id: installationId,
      district: '',
      ip: userlocation.query,
      isp: userlocation.as,
      lat: userlocation.lat,
      lon: userlocation.lon,
      name: 'FRW Chrome Extension',
      org: userlocation.org,
      regionName: userlocation.regionName,
      type: '2',
      user_agent: 'Chrome',
      zip: userlocation.zip,
    };
    const address = accounts[0].address.replace(/^0x/, '');
    wallet.openapi
      .importKey(accountKeyStruct, device_info, username, {}, address)
      .then((response) => {
        return wallet.boot(password);
      })
      .then(async (response) => {
        storage.remove('premnemonic');

        await saveIndex(username);
        if (pk) {
          return wallet.importPrivateKey(pk);
        } else {
          return wallet.createKeyringWithMnemonics(mnemonic);
        }
      })
      .then((address) => {
        setLoading(false);
        if (pk) {
          goEnd();
        } else {
          handleClick();
        }
      })
      .catch((error) => {
        console.log('error', error);
        setShowError(true);
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

  return (
    <>
      <Box className="registerBox">
        <Typography variant="h4">
          {chrome.i18n.getMessage('Create')}
          <Box display="inline" color="primary.main">
            {chrome.i18n.getMessage('Password')}
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
              readOnly={!(password.length < 8)}
              fullWidth
              disableUnderline
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
            <SlideRelative show={!!password} direction="down">
              <Box style={{ marginBottom: '24px' }}>{helperText}</Box>
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
          onClick={handleImport}
          size="large"
          sx={{
            height: '56px',
            width: '640px',
            borderRadius: '12px',
            textTransform: 'capitalize',
            gap: '12px',
            display: 'flex',
          }}
          disabled={isLoading ? true : !(isCharacters && isCheck && notBot)}
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
