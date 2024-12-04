import { IconButton, Typography, Snackbar, Alert } from '@mui/material';
import { Box } from '@mui/system';
import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import Confetti from '@/ui/FRWComponent/Confetti';
import SlideLeftRight from '@/ui/FRWComponent/SlideLeftRight';
import { storage } from 'background/webapi';
import { LLPinAlert } from 'ui/FRWComponent';
import { useWallet } from 'ui/utils';

import BackButtonIcon from '../../../../components/iconfont/IconBackButton';
import AllSet from '../../Register/AllSet';
import RegisterHeader from '../../Register/RegisterHeader';

import GoogleBackup from './GoogleBackup';
import ImportPager from './ImportPager';
import PickUsername from './PickUsername';
import RecoverPassword from './RecoverPassword';
import SetPassword from './SetPassword';

enum Direction {
  Right,
  Left,
}

const AddressImport = () => {
  const history = useHistory();
  const wallet = useWallet();
  const [activeIndex, onChange] = useState(0);
  const [mnemonic, setMnemonic] = useState('');
  const [pk, setPk] = useState(null);
  const [username, setUsername] = useState('');
  const [errMessage, setErrorMessage] = useState(chrome.i18n.getMessage('No__backup__found'));
  const [showError, setShowError] = useState(false);
  const [direction, setDirection] = useState(Direction.Right);
  const [password, setPassword] = useState(null);
  const [accounts, setAccounts] = useState<any>([]);

  const getUsername = (username: string) => {
    setUsername(username.toLowerCase());
  };

  const loadTempPassword = async () => {
    const temp = await storage.get('tempPassword');
    if (temp) {
      setPassword(temp);
    }
  };

  const loadView = useCallback(async () => {
    // console.log(wallet);
    wallet
      .getCurrentAccount()
      .then((res) => {
        if (res) {
          history.push('/');
        }
      })
      .catch(() => {
        return;
      });
  }, [history, wallet]);
  const goNext = () => {
    setDirection(Direction.Right);
    if (activeIndex < 5) {
      onChange(activeIndex + 1);
    } else {
      window.close();
    }
  };
  const goPassword = () => {
    setDirection(Direction.Right);
    onChange(3);
  };
  const goGoogle = () => {
    setDirection(Direction.Right);
    onChange(4);
  };
  const goEnd = () => {
    setDirection(Direction.Right);
    onChange(5);
  };

  const goBack = () => {
    setDirection(Direction.Left);
    if (activeIndex >= 1) {
      onChange(activeIndex - 1);
    } else {
      history.goBack();
    }
  };

  useEffect(() => {
    loadTempPassword();
  }, []);

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
          <ImportPager
            setMnemonic={setMnemonic}
            setPk={setPk}
            setAccounts={setAccounts}
            accounts={accounts}
            mnemonic={mnemonic}
            pk={pk}
            setUsername={setUsername}
            goPassword={goPassword}
            handleClick={goNext}
            setErrorMessage={setErrorMessage}
            setShowError={setShowError}
          />
        );
      case 1:
        return (
          <PickUsername handleClick={goNext} savedUsername={username} getUsername={getUsername} />
        );
      case 2:
        return (
          <SetPassword
            handleClick={goGoogle}
            tempPassword={password}
            mnemonic={mnemonic}
            pk={pk}
            username={username}
            accounts={accounts}
            goEnd={goEnd}
          />
        );
      case 3:
        return (
          <RecoverPassword
            handleClick={goNext}
            mnemonic={mnemonic}
            pk={pk}
            tempPassword={password}
            goEnd={goEnd}
            accountKey={accounts}
          />
        );
      case 4:
        return (
          <GoogleBackup
            handleClick={goNext}
            mnemonic={mnemonic}
            username={username}
            password={password}
          />
        );
      case 5:
        return <AllSet handleClick={goNext} />;
      default:
        return <div />;
    }
  };

  useEffect(() => {
    loadView();
  }, [loadView]);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
          width: '100%',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {activeIndex === 5 && <Confetti />}
        <RegisterHeader />

        <LLPinAlert open={activeIndex === 5} />

        <Box sx={{ flexGrow: 0.7 }} />
        {/* height why not use auto */}
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
            overflowY: 'auto',
            overflowX: 'hidden',
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
              {chrome.i18n.getMessage('STEP')} {activeIndex + 1}/5
            </Typography>
          </Box>
          <SlideLeftRight
            show={activeIndex === 0}
            direction={direction === Direction.Left ? 'left' : 'right'}
          >
            <ImportPager
              setMnemonic={setMnemonic}
              setPk={setPk}
              setAccounts={setAccounts}
              accounts={accounts}
              mnemonic={mnemonic}
              pk={pk}
              setUsername={setUsername}
              goPassword={goPassword}
              handleClick={goNext}
              setErrorMessage={setErrorMessage}
              setShowError={setShowError}
            />
          </SlideLeftRight>
          <SlideLeftRight
            show={activeIndex === 1}
            direction={direction === Direction.Left ? 'left' : 'right'}
          >
            <PickUsername handleClick={goNext} savedUsername={username} getUsername={getUsername} />
          </SlideLeftRight>

          <SlideLeftRight
            show={activeIndex === 2}
            direction={direction === Direction.Left ? 'left' : 'right'}
          >
            <SetPassword
              handleClick={goGoogle}
              tempPassword={password}
              mnemonic={mnemonic}
              pk={pk}
              username={username}
              accounts={accounts}
              goEnd={goEnd}
            />
          </SlideLeftRight>
          <SlideLeftRight
            show={activeIndex === 3}
            direction={direction === Direction.Left ? 'left' : 'right'}
          >
            <RecoverPassword
              handleClick={goNext}
              mnemonic={mnemonic}
              pk={pk}
              tempPassword={password}
              goEnd={goEnd}
              accountKey={accounts}
            />
          </SlideLeftRight>
          <SlideLeftRight
            show={activeIndex === 4}
            direction={direction === Direction.Left ? 'left' : 'right'}
          >
            <GoogleBackup
              handleClick={goNext}
              mnemonic={mnemonic}
              username={username}
              password={password}
            />
          </SlideLeftRight>
          <SlideLeftRight
            show={activeIndex === 5}
            direction={direction === Direction.Left ? 'left' : 'right'}
          >
            <AllSet handleClick={goNext} />
          </SlideLeftRight>
        </Box>

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

export default AddressImport;
