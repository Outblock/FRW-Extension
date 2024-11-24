import { IconButton, Typography, Button, Snackbar, Alert } from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import { ComponentTransition, AnimationTypes } from 'react-component-transition';
import { useHistory } from 'react-router-dom';

import Confetti from '@/ui/FRWComponent/Confetti';
import { LLPinAlert, LLSpinner } from 'ui/FRWComponent';
import { useWallet } from 'ui/utils';

import BackButtonIcon from '../../../components/iconfont/IconBackButton';
import IconGoogleDrive from '../../../components/iconfont/IconGoogleDrive';
import AllSet from '../Register/AllSet';
import RegisterHeader from '../Register/RegisterHeader';

import ImportRecoveryPhrase from './ImportRecoveryPhrase';
import RecoverPassword from './RecoverPassword';

enum Direction {
  Right,
  Left,
}

const ImportPager = () => {
  const history = useHistory();
  const wallets = useWallet();
  const [activeIndex, onChange] = useState(0);
  const [mnemonic, setMnemonic] = useState('');
  const [username, setUsername] = useState('');
  const [pk, setPk] = useState('');
  const [errMessage, setErrorMessage] = useState(chrome.i18n.getMessage('No__backup__found'));
  const [showError, setShowError] = useState(false);
  const [direction, setDirection] = useState(Direction.Right);
  const [loading, setLoading] = useState(false);

  const goNext = () => {
    setDirection(Direction.Right);
    if (activeIndex < 2) {
      onChange(activeIndex + 1);
    } else {
      window.close();
    }
  };

  const goBack = () => {
    setDirection(Direction.Left);
    if (activeIndex >= 1) {
      onChange(activeIndex - 1);
    } else {
      history.goBack();
    }
  };

  const getGoogle = async () => {
    setLoading(true);

    try {
      const accounts = await wallets.loadBackupAccounts();
      if (accounts.length > 0) {
        history.push({
          pathname: '/import/google',
          state: {
            accounts: accounts,
          },
        });
      } else {
        setShowError(true);
        setErrorMessage(chrome.i18n.getMessage('No__backup__found'));
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
      setShowError(true);
      setErrorMessage(chrome.i18n.getMessage('Something__is__wrong'));
      setLoading(false);
    }
  };

  const handleErrorClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowError(false);
  };

  const page = (index) => {
    switch (index) {
      case 0:
        return (
          <ImportRecoveryPhrase
            handleClick={goNext}
            confirmMnemonic={setMnemonic}
            confirmPk={setPk}
            setUsername={setUsername}
          />
        );
      case 1:
        return (
          <RecoverPassword handleClick={goNext} pk={pk} mnemonic={mnemonic} username={username} />
        );
      case 2:
        return <AllSet handleClick={goNext} />;
      default:
        return <div />;
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {activeIndex === 2 && <Confetti />}

        <LLPinAlert open={activeIndex === 2} />

        <RegisterHeader />
        <Box sx={{ flexGrow: 1 }} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: 720,
            marginTop: '80px',
            height: 'auto',
            transition: 'all .3s ease-in-out',
            borderRadius: '24px',
            boxShadow: '0px 24px 24px rgba(0,0,0,0.36)',
            overflow: 'hidden',
            backgroundColor: 'background.paper',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              // height: '56px',
              // backgroundColor: '#404040',
              padding: '24px 24px 0px 24px',
            }}
          >
            <IconButton onClick={goBack} size="small">
              <BackButtonIcon color="#5E5E5E" size={27} />
            </IconButton>

            <div style={{ flexGrow: 1 }}></div>

            <Typography
              variant="body1"
              sx={{
                color: '#5E5E5E',
                alignSelf: 'end',
                lineHeight: '37px',
                fontWeight: '700',
                fontSize: '16px',
              }}
            >
              {chrome.i18n.getMessage('STEP')} {activeIndex + 1}/3
            </Typography>
          </Box>

          <ComponentTransition
            enterAnimation={
              direction === Direction.Left
                ? AnimationTypes.slideLeft.enter
                : AnimationTypes.slideRight.enter
            }
            exitAnimation={
              direction === Direction.Left
                ? AnimationTypes.slideRight.exit
                : AnimationTypes.slideLeft.exit
            }
            animateContainer={true}
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            {page(activeIndex)}
          </ComponentTransition>
        </Box>

        {activeIndex === 0 && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{
              backgroundColor: 'background.paper',
              px: '24px',
              py: '18px',
              marginBottom: '15px',
              borderRadius: '12px',
              textTransform: 'none',
              boxShadow: '0px 24px 24px rgba(0,0,0,0.36)',
              mt: '36px',
            }}
            onClick={getGoogle}
            startIcon={loading ? <LLSpinner size={20} /> : <IconGoogleDrive />}
          >
            <Typography variant="body1" color="text.primary">
              {chrome.i18n.getMessage('Restore__Backup__from__Google__Drive')}
            </Typography>
          </Button>
        )}
        <Box sx={{ flexGrow: 1 }} />
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

export default ImportPager;
