import ExtensionRoundedIcon from '@mui/icons-material/ExtensionRounded';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { IconButton, Typography, Snackbar, SnackbarContent } from '@mui/material';
import { Box } from '@mui/system';
import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import { storage } from '@/background/webapi';
import Confetti from '@/ui/FRWComponent/Confetti';
import AllSet from '@/ui/FRWComponent/LandingPages/AllSet';
import PickUsername from '@/ui/FRWComponent/LandingPages/PickUsername';
import SlideLeftRight from '@/ui/FRWComponent/SlideLeftRight';

import lilicoIcon from '../../../../../_raw/images/icon-48.png';
import BackButtonIcon from '../../../../components/iconfont/IconBackButton';

import RecoveryPhrase from './RecoveryPhrase';
import SetPassword from './SetPassword';

enum Direction {
  Right,
  Left,
}
const RecoverRegister = () => {
  const history = useHistory();
  const [activeIndex, onChange] = useState(0);
  const [direction, setDirection] = useState(Direction.Right);
  const [username, setUsername] = useState('');
  const [mnemonic, setMnemonic] = useState('');

  const pageRef = useRef<HTMLDivElement>(null);
  const getUsername = (username: string) => {
    setUsername(username.toLowerCase());
  };

  const getPhrase = async () => {
    const phrase = await storage.get('premnemonic');
    if (phrase) {
      setMnemonic(phrase);
    }
    storage.remove('premnemonic');
  };

  useEffect(() => {
    getPhrase();
  }, []);

  const goNext = () => {
    setDirection(Direction.Right);
    if (activeIndex < 3) {
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

  const Page = React.forwardRef(({ index }: { index: number }, pageRef) => {
    switch (index) {
      case 0:
        return (
          <PickUsername handleClick={goNext} savedUsername={username} getUsername={getUsername} />
        );
      case 1:
        return <RecoveryPhrase handleClick={goNext} mnemonic={mnemonic} />;
      case 2:
        return <SetPassword handleClick={goNext} mnemonic={mnemonic} username={username} />;
      case 3:
        return <AllSet handleClick={goNext} variant="recover" />;
      default:
        return <Box />;
    }
  });

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {activeIndex === 3 && <Confetti />}

        <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'right' }} open={activeIndex === 3}>
          <SnackbarContent
            style={{ background: 'rgba(252, 129, 74, 0.8)' }}
            sx={{ borderRadius: '12px', opacity: '1', backdropFilter: 'blur(5px)' }}
            message={
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <img src={lilicoIcon} />

                <Box>
                  <Typography
                    sx={{
                      fontWeight: '600',
                      fontSize: '16px',
                      fontFamily: 'Inter',
                      fontStyle: 'normal',
                    }}
                  >
                    {chrome.i18n.getMessage('Put__your__wallet__within__reach')}
                    <br />
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Typography sx={{ fontWeight: '400', fontSize: '14px', fontFamily: 'Inter' }}>
                      {chrome.i18n.getMessage('Click__Extension')}
                    </Typography>
                    <ExtensionRoundedIcon style={{ fontSize: '16px' }} color="secondary" />
                    <Typography sx={{ fontWeight: '400', fontSize: '14px', fontFamily: 'Inter' }}>
                      {chrome.i18n.getMessage('and__Pin')}
                    </Typography>
                    <PushPinOutlinedIcon style={{ fontSize: '16px' }} color="secondary" />
                    <Typography sx={{ fontWeight: '400', fontSize: '14px', fontFamily: 'Inter' }}>
                      {chrome.i18n.getMessage('Flow_Core')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            }
          />
        </Snackbar>

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
              {chrome.i18n.getMessage('STEP')} {activeIndex + 1}/4
            </Typography>
          </Box>

          <SlideLeftRight show={true} direction={direction === Direction.Left ? 'left' : 'right'}>
            <Page index={activeIndex} />
          </SlideLeftRight>
        </Box>

        <Box sx={{ flexGrow: 1 }} />
      </Box>
    </>
  );
};

export default RecoverRegister;
