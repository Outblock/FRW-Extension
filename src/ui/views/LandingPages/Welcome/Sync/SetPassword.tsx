import { Typography, FormGroup } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';

import { storage } from '@/background/webapi';
import {
  PasswordInput,
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

const SetPassword = ({ handleClick, mnemonic, username, setUsername, accountKey, deviceInfo }) => {
  const classes = useStyles();
  const wallet = useWallet();

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCharacters, setCharacters] = useState(false);
  const [isMatch, setMatch] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Something went wrong');
  const [showError, setShowError] = useState(false);

  const loadTempPassword = async () => {
    const temp = await storage.get('tempPassword');
    if (temp) {
      setPassword(temp);
    }
  };

  useEffect(() => {
    loadTempPassword();
  }, []);

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

  const register = async () => {
    setLoading(true);
    try {
      await wallet.signInV3(mnemonic, accountKey, deviceInfo);
      const userInfo = await wallet.getUserInfo(true);
      setUsername(userInfo.username);
      await saveIndex(userInfo.username);
      await wallet.boot(password);
      const formatted = mnemonic.trim().split(/\s+/g).join(' ');
      await wallet.createKeyringWithMnemonics(formatted);
      setLoading(false);
      handleClick();
    } catch (e) {
      setLoading(false);
      setErrorMessage(e.message);
      setShowError(true);
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
          {chrome.i18n.getMessage('Welcome__Back')}
          <Box display="inline" color="primary.main">
            {username}
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
              autoFocus
            />
            <SlideRelative show={!!password} direction="down">
              {helperText}
            </SlideRelative>

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
          </FormGroup>
        </Box>

        <SubmitButton
          onClick={register}
          isLoading={isLoading}
          disabled={!(isMatch && isCharacters)}
          isLogin={true}
        />
      </Box>

      <ErrorSnackbar open={showError} message={errorMessage} onClose={() => setShowError(false)} />
    </>
  );
};

export default SetPassword;
