import { Typography, FormGroup } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/system';
import HDWallet from 'ethereum-hdwallet';
import React, { useEffect, useState } from 'react';

import { storage } from '@/background/webapi';
import {
  PasswordInput,
  TermsCheckbox,
  ErrorSnackbar,
  SubmitButton,
} from '@/ui/FRWComponent/LandingPages/SetPassword';
import SlideRelative from '@/ui/FRWComponent/SlideRelative';
import { type AccountKey } from 'background/service/networkModel';
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

const SetPassword = ({ handleClick, mnemonic, username, setExPassword, tempPassword = '' }) => {
  const classes = useStyles();
  const wallet = useWallet();

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [password, setPassword] = useState(tempPassword);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCharacters, setCharacters] = useState(false);
  const [isMatch, setMatch] = useState(false);
  const [isCheck, setCheck] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [notBot, setNotBot] = useState(true);
  const [errMessage, setErrorMessage] = useState('Something wrong, please try again');
  const [showError, setShowError] = useState(false);

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
  const handleErrorClose = () => setShowError(false);

  const register = async () => {
    setLoading(true);

    await saveIndex(username);
    const accountKey = getAccountKey(mnemonic);
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
          {tempPassword ? (
            chrome.i18n.getMessage('Confirm__Password')
          ) : (
            <>
              {chrome.i18n.getMessage('Create')}
              <Box display="inline" color="primary.main">
                {chrome.i18n.getMessage('Password')}
              </Box>
            </>
          )}
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
              readOnly={tempPassword ? !(password.length < 8) : false}
              className={classes.inputBox}
              autoFocus={!tempPassword}
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
                  className={classes.inputBox2}
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
          onClick={register}
          isLoading={isLoading}
          disabled={!(isMatch && isCharacters && isCheck && notBot)}
        />
      </Box>

      <ErrorSnackbar open={showError} message={errMessage} onClose={handleErrorClose} />
    </>
  );
};

export default SetPassword;
