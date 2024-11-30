import { Typography, Tabs, Tab, CircularProgress, Button, Snackbar, Alert } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/system';
import * as bip39 from 'bip39';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { storage } from '@/background/webapi';
import { LLNotFound, LLSpinner } from 'ui/FRWComponent';
import { useWallet } from 'ui/utils';

import CheckCircleIcon from '../../../components/iconfont/IconCheckmark';
import CancelIcon from '../../../components/iconfont/IconClose';

import PrivateKey from './ImportComponent/PrivateKey';
import SeedPhrase from './ImportComponent/SeedPhrase';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={0}>{children}</Box>}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  customInputLabel: {
    '& legend': {
      visibility: 'visible',
    },
  },
  sxStyles: {
    fontFamily: 'Inter',
    fontSize: '18px',
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: '24px',
    letterSpacing: '-0.252px',
    textTransform: 'capitalize',
  },
  inputBox: {
    height: '128px',
    padding: '16px',
    paddingTop: '0px',
    zIndex: '999',
    overflow: 'scroll',
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

const mnemonicError = (errorMsg) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    }}
  >
    <CancelIcon size={24} color={'#E54040'} style={{ margin: '8px' }} />
    <Typography variant="body1" color="text.error">
      {errorMsg}
    </Typography>
  </Box>
);

const MnemonicCorrect: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    }}
  >
    <CheckCircleIcon size={24} color={'#41CC5D'} style={{ margin: '8px' }} />
    <Typography variant="body1" color="success.main">
      {chrome.i18n.getMessage('Recovery__phrase__valid')}
    </Typography>
  </Box>
);

const PrivateCorrect: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    }}
  >
    <CheckCircleIcon size={24} color={'#41CC5D'} style={{ margin: '8px' }} />
    <Typography variant="body1" color="success.main">
      {chrome.i18n.getMessage('Private__key_valid')}
    </Typography>
  </Box>
);

const MnemonicLoading: React.FC = () => (
  <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
    <CircularProgress color="primary" size={22} style={{ fontSize: '22px', margin: '8px' }} />
    {chrome.i18n.getMessage('Checking')}
  </Typography>
);

const ImportRecoveryPhrase = ({ handleClick, confirmMnemonic, confirmPk, setUsername }) => {
  const classes = useStyles();
  const wallet = useWallet();

  const [mnemonicValid, setMnemonicValid] = useState(true);

  const [mnemonic, setMnemonic] = useState('');

  const [pk, setPk] = useState('');

  const [isSignLoading, setSignLoading] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showError, setShowError] = useState(false);

  const [helperText, setHelperText] = useState<React.ReactNode>(<div />);
  const [selectedTab, setSelectedTab] = useState(0);

  const signIn = async () => {
    setSignLoading(true);
    if (mnemonic) {
      signMnemonic();
    } else {
      signPk();
    }
  };

  const signMnemonic = async () => {
    try {
      const result = await wallet.signInWithMnemonic(mnemonic);
      setSignLoading(false);
      confirmMnemonic(mnemonic);
      const userInfo = await wallet.getUserInfo(true);
      setUsername(userInfo.username);
      handleClick();
    } catch (error) {
      setSignLoading(false);
      if (error.message === 'NoUserFound') {
        setShowDialog(true);
      } else {
        setShowError(true);
      }
    }
  };

  const signPk = async () => {
    const privateKey = pk.replace(/^0x/, '');
    try {
      const result = await wallet.signInWithPrivatekey(privateKey);
      setSignLoading(false);
      confirmPk(privateKey);
      const userInfo = await wallet.getUserInfo(true);
      setUsername(userInfo.username);
      handleClick();
    } catch (error) {
      setSignLoading(false);
      if (error.message === 'NoUserFound') {
        setShowDialog(true);
      } else {
        setShowError(true);
      }
    }
  };

  const setErrorMessage = useCallback(
    (message: string) => {
      setLoading(false);
      setMnemonicValid(false);
      setHelperText(mnemonicError(message));
    },
    [setLoading, setMnemonicValid, setHelperText]
  );
  useEffect(() => {
    setMnemonicValid(false);
    setHelperText(<MnemonicLoading />);
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      setLoading(false);
      const length = mnemonic.trim().split(/\s+/g).length;
      if (!(length === 12 || length === 24)) {
        setErrorMessage(
          chrome.i18n.getMessage('Recovery__phrases__word__count__must__be__12__or__24__words')
        );
        return;
      }

      const formatted = mnemonic.trim().split(/\s+/g).join(' ');
      if (!bip39.validateMnemonic(formatted)) {
        setErrorMessage(chrome.i18n.getMessage('Mnemonic__phrase__is__invalid'));
        return;
      }

      setMnemonicValid(true);
      setHelperText(<MnemonicCorrect />);
      storage.set('premnemonic', formatted);
      setMnemonic(formatted);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [mnemonic, setErrorMessage]);

  useEffect(() => {
    setMnemonicValid(false);
    setHelperText(<MnemonicLoading />);
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      setLoading(false);
      const hexRegex = /^(0x)?[0-9a-fA-F]{64}$/;
      const isvalid = hexRegex.test(pk);
      if (isvalid) {
        setMnemonicValid(true);
        setHelperText(<PrivateCorrect />);
        return;
      } else {
        setErrorMessage(chrome.i18n.getMessage('Private__is__invalid'));
        return;
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [pk, setErrorMessage]);

  const msgBgColor = () => {
    if (isLoading) {
      return 'neutral.light';
    }
    return mnemonicValid ? 'success.light' : 'error.light';
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <>
      {!showDialog ? (
        <Box className="registerBox">
          <Typography variant="h4">
            {chrome.i18n.getMessage('Sign__in__with')}
            <Box display="inline" color="primary.main">
              {chrome.i18n.getMessage('Sign__in__Recovery__Phrase')}
            </Box>
          </Typography>

          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            aria-label="simple tabs example"
            sx={{ padding: '0' }}
          >
            <Tab className={classes.sxStyles} label={chrome.i18n.getMessage('Seed_Phrase')} />
            <Tab className={classes.sxStyles} label={chrome.i18n.getMessage('Private_Key')} />
          </Tabs>
          <TabPanel sx={{ padding: '0' }} value={selectedTab} index={0}>
            <SeedPhrase
              helperText={helperText}
              msgBgColor={msgBgColor}
              mnemonic={mnemonic}
              setmnemonic={setMnemonic}
            />
          </TabPanel>
          <TabPanel sx={{ padding: '0' }} value={selectedTab} index={1}>
            <PrivateKey helperText={helperText} msgBgColor={msgBgColor} pk={pk} setpk={setPk} />
          </TabPanel>

          <Button
            className="registerButton"
            onClick={signIn}
            variant="contained"
            color="secondary"
            size="large"
            sx={{
              height: '56px',
              width: '640px',
              borderRadius: '12px',
              textTransform: 'capitalize',
              gap: '12px',
              display: 'flex',
            }}
            disabled={isSignLoading ? true : !mnemonicValid}
          >
            {isSignLoading && <LLSpinner size={28} />}
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="background.paper">
              {chrome.i18n.getMessage('Next')}
            </Typography>
          </Button>

          <Snackbar
            autoHideDuration={6000}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            open={showError}
            onClose={() => setShowError(false)}
          >
            <Alert
              variant="filled"
              severity="error"
              onClose={() => {
                setShowError(false);
              }}
            >
              Something went wrong, please try again later
            </Alert>
          </Snackbar>
        </Box>
      ) : (
        <LLNotFound setShowDialog={setShowDialog} />
      )}
    </>
  );
};

export default ImportRecoveryPhrase;
