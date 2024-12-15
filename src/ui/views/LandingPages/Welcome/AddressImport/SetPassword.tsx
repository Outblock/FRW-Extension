import { Box, Typography, FormGroup } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useCallback, useEffect, useState } from 'react';

import { storage } from '@/background/webapi';
import { getHashAlgo, getSignAlgo } from '@/shared/utils/algo';
import {
  PasswordInput,
  TermsCheckbox,
  ErrorSnackbar,
  SubmitButton,
} from '@/ui/FRWComponent/LandingPages/SetPassword';
import SlideRelative from '@/ui/FRWComponent/SlideRelative';
import { useWallet, saveIndex } from 'ui/utils';

import CheckCircleIcon from '../../../../../components/iconfont/IconCheckmark';
import CancelIcon from '../../../../../components/iconfont/IconClose';

const useStyles = makeStyles(() => ({
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
}));

const SetPassword = ({ handleClick, mnemonic, pk, username, tempPassword, accounts, goEnd }) => {
  const classes = useStyles();
  const wallet = useWallet();

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [isCharacters, setCharacters] = useState(false);
  const [isCheck, setCheck] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [notBot, setNotBot] = useState(true);
  const [errMessage, setErrorMessage] = useState('Something wrong, please try again');
  const [showError, setShowError] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isMatch, setMatch] = useState(false);

  const loadTempPassword = useCallback(async () => {
    setPassword(tempPassword);
  }, [tempPassword]);

  useEffect(() => {
    loadTempPassword();
  }, [loadTempPassword]);

  const successInfo = (message) => (
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

  const errorInfo = (message) => (
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

  const [helperText, setHelperText] = useState(<div />);
  const [helperMatch, setHelperMatch] = useState(<div />);

  const handleImport = async () => {
    setLoading(true);
    try {
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

      await wallet.openapi.importKey(accountKeyStruct, device_info, username, {}, address);
      await wallet.boot(password);
      storage.remove('premnemonic');
      await saveIndex(username);

      if (pk) {
        await wallet.importPrivateKey(pk);
        goEnd();
      } else {
        await wallet.createKeyringWithMnemonics(mnemonic);
        handleClick();
      }
      setLoading(false);
    } catch (error) {
      console.log('error', error);
      setShowError(true);
      setLoading(false);
    }
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
    if (!tempPassword) {
      if (confirmPassword === password) {
        setHelperMatch(successInfo(chrome.i18n.getMessage('Passwords__match')));
        setMatch(true);
      } else {
        setMatch(false);
        setHelperMatch(errorInfo(chrome.i18n.getMessage('Your__passwords__do__not__match')));
      }
    } else {
      setMatch(true); // Auto-match when using tempPassword
    }
  }, [confirmPassword, password, tempPassword]);

  return (
    <>
      <Box className="registerBox">
        <Typography variant="h4">
          {chrome.i18n.getMessage('Create')}
          <Box display="inline" color="primary.main">
            {chrome.i18n.getMessage('Password')}
          </Box>
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {chrome.i18n.getMessage(
            'Lilico__uses__this__password__to__protect__your__recovery__phrase'
          )}
        </Typography>

        <Box sx={{ flexGrow: 1, width: 640, maxWidth: '100%', my: '32px', display: 'flex' }}>
          <FormGroup sx={{ width: '100%' }}>
            <PasswordInput
              value={password}
              onChange={setPassword}
              isVisible={isPasswordVisible}
              setVisible={setPasswordVisible}
              readOnly={!(password.length < 8)}
              className={classes.inputBox}
            />
            <SlideRelative show={!!password} direction="down">
              <Box style={{ marginBottom: '24px' }}>{helperText}</Box>
            </SlideRelative>

            {!tempPassword && (
              <Box sx={{ pb: '30px', marginTop: password ? '0px' : '24px' }}>
                <PasswordInput
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  isVisible={isConfirmPasswordVisible}
                  setVisible={setConfirmPasswordVisible}
                  placeholder={chrome.i18n.getMessage('Confirm__your__password')}
                  className={classes.inputBox}
                />
                <SlideRelative show={!!confirmPassword} direction="down">
                  {helperMatch}
                </SlideRelative>
              </Box>
            )}
          </FormGroup>
        </Box>

        <TermsCheckbox onChange={setCheck} />

        <SubmitButton
          onClick={handleImport}
          isLoading={isLoading}
          disabled={!(isMatch && isCharacters)}
          isLogin={true}
        />
      </Box>

      <ErrorSnackbar open={showError} message={errMessage} onClose={() => setShowError(false)} />
    </>
  );
};

export default SetPassword;
