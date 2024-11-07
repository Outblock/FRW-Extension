import React, { useEffect, useState } from 'react';
import { Box, ThemeProvider } from '@mui/system';
import { makeStyles } from '@mui/styles';
import {
  Typography,
  FormControl,
  Input,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
  CssBaseline,
} from '@mui/material';
import theme from '../../style/LLTheme';
import { Presets } from 'react-component-transition';
import { useWallet } from 'ui/utils';
import CancelIcon from '../../../components/iconfont/IconClose';
import CheckCircleIcon from '../../../components/iconfont/IconCheckmark';
import * as bip39 from 'bip39';
import { LLNotFound, LLSpinner } from 'ui/FRWComponent';
import { storage } from '@/background/webapi';

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

const ResetRecoveryPhrase = ({ handleClick, confirmMnemonic, setUsername }) => {
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

  const mnemonicError = (errorMsg) => (
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

  const mnemonicCorrect = (
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

  const mnemonicLoading = () => (
    <Typography
      variant="body1"
      color="text.secondary"
      sx={{ display: 'flex', alignItems: 'center' }}
    >
      <CircularProgress
        color="primary"
        size={22}
        style={{ fontSize: '22px', margin: '8px' }}
      />
      {chrome.i18n.getMessage('Checking')}
    </Typography>
  );

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

  useEffect(() => {
    setMnemonicValid(false);
    setHelperText(mnemonicLoading);
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      setLoading(false);
      const length = mnemonic.trim().split(/\s+/g).length;
      if (!(length == 12 || length == 24)) {
        setErrorMessage(
          chrome.i18n.getMessage(
            'Recovery_phrases_word_count_must_be_12_or_24_words'
          )
        );
        return;
      }

      const formatted = mnemonic.trim().split(/\s+/g).join(' ');
      if (!bip39.validateMnemonic(formatted)) {
        setErrorMessage(
          chrome.i18n.getMessage('Mnemonic__phrase__is__invalid')
        );
        return;
      }

      setMnemonicValid(true);
      setHelperText(mnemonicCorrect);
      storage.set('premnemonic', formatted);
      setMnemonic(formatted);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [mnemonic]);

  const setErrorMessage = (message: string) => {
    setLoading(false);
    setMnemonicValid(false);
    setHelperText(mnemonicError(message));
  };

  const msgBgColor = () => {
    if (isLoading) {
      return 'neutral.light';
    }
    return mnemonicValid ? 'success.light' : 'error.light';
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
              <Presets.TransitionSlideUp>
                {mnemonic && (
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
                )}
              </Presets.TransitionSlideUp>
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
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 'bold' }}
              color="background.paper"
            >
              {chrome.i18n.getMessage('Next')}
            </Typography>
          </Button>

          {renderSnackBar()}
        </Box>
      ) : (
        <LLNotFound setShowDialog={setShowDialog} />
      )}
    </ThemeProvider>
  );
};

export default ResetRecoveryPhrase;
