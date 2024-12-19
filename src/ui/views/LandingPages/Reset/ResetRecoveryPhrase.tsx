import {
  Typography,
  FormControl,
  Input,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/system';
import * as bip39 from 'bip39';
import React, { useCallback, useEffect, useState } from 'react';

import { storage } from '@/background/webapi';
import SlideRelative from '@/ui/FRWComponent/SlideRelative';
import { LLNotFound, LLSpinner } from 'ui/FRWComponent';
import { useWallet } from 'ui/utils';

import CheckCircleIcon from '../../../../components/iconfont/IconCheckmark';
import CancelIcon from '../../../../components/iconfont/IconClose';

const useStyles = makeStyles((theme) => ({
  customInputLabel: {
    '& legend': {
      visibility: 'visible',
    },
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

const MnemonicError = (errorMsg) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    }}
  >
    <CancelIcon size={24} color={'#E54040'} style={{ margin: '8px' }} />
    <Typography variant="body1" color="error">
      {errorMsg}
    </Typography>
  </Box>
);

const MnemonicCorrect = (
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

const MnemonicLoading = () => (
  <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
    <CircularProgress color="primary" size={22} style={{ fontSize: '22px', margin: '8px' }} />
    {chrome.i18n.getMessage('Checking')}
  </Typography>
);

const ResetRecoveryPhrase = ({ handleSwitchTab, confirmMnemonic, setUsername }) => {
  const classes = useStyles();
  const wallet = useWallet();

  const [mnemonicValid, setMnemonicValid] = useState(true);

  const [mnemonic, setMnemonic] = useState('');

  const [isLoading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showError, setShowError] = useState(false);
  const [helperText, setHelperText] = useState(<div />);
  const [isSignLoading, setSignLoading] = useState(false);

  const signIn = async () => {
    setSignLoading(true);
    try {
      const result = await wallet.signInWithMnemonic(mnemonic);
      setSignLoading(false);
      await wallet.reset();
      confirmMnemonic(mnemonic);
      const userInfo = await wallet.getUserInfo(false);
      setUsername(userInfo.username);
      handleSwitchTab();
    } catch (error) {
      setSignLoading(false);
      if (error.message === 'NoUserFound') {
        setShowDialog(true);
      } else {
        setShowError(true);
      }
    }
  };

  const renderSnackBar = () => {
    return (
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
    );
  };
  const setErrorMessage = useCallback(
    (message: string) => {
      setLoading(false);
      setMnemonicValid(false);
      setHelperText(MnemonicError(message));
    },
    [setLoading, setMnemonicValid, setHelperText]
  );

  useEffect(() => {
    setMnemonicValid(false);
    setHelperText(MnemonicLoading);
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      setLoading(false);
      const length = mnemonic.trim().split(/\s+/g).length;
      if (!(length === 12 || length === 24)) {
        setErrorMessage(
          chrome.i18n.getMessage('Recovery_phrases_word_count_must_be_12_or_24_words')
        );
        return;
      }

      const formatted = mnemonic.trim().split(/\s+/g).join(' ');
      if (!bip39.validateMnemonic(formatted)) {
        setErrorMessage(chrome.i18n.getMessage('Mnemonic__phrase__is__invalid'));
        return;
      }

      setMnemonicValid(true);
      setHelperText(MnemonicCorrect);
      storage.set('premnemonic', formatted);
      setMnemonic(formatted);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [mnemonic, setErrorMessage]);

  const msgBgColor = () => {
    if (isLoading) {
      return 'neutral.light';
    }
    return mnemonicValid ? 'success.light' : 'error.light';
  };

  return (
    <>
      {!showDialog ? (
        <Box className="registerBox">
          <Typography variant="h4">
            {chrome.i18n.getMessage('Reset_Your')}{' '}
            <Box display="inline" color="primary.main">
              {chrome.i18n.getMessage('Wallet')}
            </Box>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {chrome.i18n.getMessage(
              'Enter_the_12_or_24_word_recovery_phrase_given_when_you_first_created_your_wallet'
            )}
          </Typography>

          <Box sx={{ flexGrow: 1, width: 640, maxWidth: '100%', my: '16px' }}>
            <FormControl sx={{ width: '100%' }}>
              <Input
                id="textfield"
                className={classes.inputBox}
                placeholder={chrome.i18n.getMessage(
                  'Enter_your_recovery_phrase_using_spaces_to_separate_each_word'
                )}
                autoFocus
                fullWidth
                multiline
                minRows={3}
                disableUnderline
                value={mnemonic}
                onChange={(event) => {
                  setMnemonic(event.target.value);
                }}
              />
              <SlideRelative direction="down" show={!!mnemonic}>
                <Box
                  sx={{
                    width: '95%',
                    backgroundColor: msgBgColor(),
                    mx: 'auto',
                    borderRadius: '0 0 12px 12px',
                  }}
                >
                  <Box sx={{ p: '4px' }}>{helperText}</Box>
                </Box>
              </SlideRelative>
            </FormControl>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

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

          {renderSnackBar()}
        </Box>
      ) : (
        <LLNotFound setShowDialog={setShowDialog} />
      )}
    </>
  );
};

export default ResetRecoveryPhrase;
