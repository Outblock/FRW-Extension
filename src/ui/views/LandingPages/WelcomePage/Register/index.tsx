import { IconButton, Typography } from '@mui/material';
import { Box } from '@mui/system';
import * as bip39 from 'bip39';
import React, { useCallback, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useHistory } from 'react-router-dom';

import { LLPinAlert } from '@/ui/FRWComponent';
import Confetti from '@/ui/FRWComponent/Confetti';
import { PickUsername, RepeatPhrase, AllSet, RegisterHeader } from '@/ui/FRWComponent/LandingPages';
import SlideLeftRight from '@/ui/FRWComponent/SlideLeftRight';
import { type PageConfig, renderPage } from '@/ui/utils/landingPage';
import { useWallet } from 'ui/utils';

import BackButtonIcon from '../../../../../components/iconfont/IconBackButton';

import GoogleBackup from './GoogleBackup';
import RecoveryPhrase from './RecoveryPhrase';
import SetPassword from './SetPassword';

enum Direction {
  Right,
  Left,
}

const Register = () => {
  const history = useHistory();
  const wallet = useWallet();
  const [activeIndex, onChange] = useState(0);
  const [direction, setDirection] = useState(Direction.Right);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState<string | null>(null);
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

  const pages: Record<number, PageConfig> = {
    0: {
      component: PickUsername,
      props: { handleClick: goNext, savedUsername: username, getUsername },
    },
    1: {
      component: RecoveryPhrase,
      props: { handleClick: goNext, mnemonic },
    },
    2: {
      component: RepeatPhrase,
      props: { handleClick: goNext, mnemonic },
    },
    3: {
      component: SetPassword,
      props: { handleClick: goNext, setExPassword: setPassword, mnemonic, username },
    },
    4: {
      component: GoogleBackup,
      props: { handleClick: goNext, mnemonic, username, password },
    },
    5: {
      component: AllSet,
      props: { handleClick: goNext, variant: 'register' },
    },
  };

  const page = (index: number) => renderPage(pages, index);

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

          <SlideLeftRight direction={direction === Direction.Left ? 'left' : 'right'} show={true}>
            {page(activeIndex)}
          </SlideLeftRight>
        </Box>

        <Box sx={{ flexGrow: 1 }} />
      </Box>
    </>
  );
};

export default Register;