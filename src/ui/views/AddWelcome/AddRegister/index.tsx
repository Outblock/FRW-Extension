import { IconButton, Slide, Typography } from '@mui/material';
import { Box } from '@mui/system';
import * as bip39 from 'bip39';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { LLPinAlert } from '@/ui/FRWComponent';
import Confetti from '@/ui/FRWComponent/Confetti';
import { storage } from 'background/webapi';
import { useWallet } from 'ui/utils';

import BackButtonIcon from '../../../../components/iconfont/IconBackButton';

import AllSet from './AllSet';
import GoogleBackup from './GoogleBackup';
import PickUsername from './PickUsername';
import RecoveryPhrase from './RecoveryPhrase';
import RegisterHeader from './RegisterHeader';
import RepeatPhrase from './RepeatPhrase';
import SetPassword from './SetPassword';

enum Direction {
  Right,
  Left,
}

const AddRegister = () => {
  const history = useHistory();
  const wallet = useWallet();
  const [activeIndex, onChange] = useState(0);
  const [direction, setDirection] = useState(Direction.Right);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(null);
  const [mnemonic] = useState(bip39.generateMnemonic());

  const getUsername = (username: string) => {
    setUsername(username.toLowerCase());
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
  }, [wallet, history]);

  const loadTempPassword = useCallback(async () => {
    const temp = await storage.get('tempPassword');
    if (temp) {
      setPassword(temp);
    }
  }, []);

  const goNext = () => {
    setDirection(Direction.Right);
    if (activeIndex < 5) {
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

  const page = (index) => {
    switch (index) {
      case 0:
        return (
          <PickUsername handleClick={goNext} savedUsername={username} getUsername={getUsername} />
        );
      case 1:
        return <RecoveryPhrase handleClick={goNext} mnemonic={mnemonic} />;
      case 2:
        return <RepeatPhrase handleClick={goNext} mnemonic={mnemonic} />;
      case 3:
        return (
          <SetPassword
            handleClick={goNext}
            setExPassword={setPassword}
            tempPassword={password}
            mnemonic={mnemonic}
            username={username}
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
    loadTempPassword();
  }, [loadView, loadTempPassword]);

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
            {activeIndex !== 4 && activeIndex !== 5 && (
              <IconButton onClick={goBack} size="small">
                <BackButtonIcon color="#5E5E5E" size={27} />
              </IconButton>
            )}

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
              {chrome.i18n.getMessage('STEP')} {activeIndex + 1}/6
            </Typography>
          </Box>

          <Slide direction={direction === Direction.Left ? 'left' : 'right'}>
            {page(activeIndex)}
          </Slide>
        </Box>

        <Box sx={{ flexGrow: 1 }} />
      </Box>
    </>
  );
};

export default AddRegister;
