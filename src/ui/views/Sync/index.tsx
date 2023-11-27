import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, ThemeProvider } from '@mui/system';
import {
  IconButton,
  Typography,
} from '@mui/material';
import BackButtonIcon from '../../../components/iconfont/IconBackButton';
import theme from '../../style/LLTheme';
import RegisterHeader from './RegisterHeader';
import SyncQr from './SyncQr';
import RecoveryPhrase from './RecoveryPhrase';
import RepeatPhrase from './RepeatPhrase';
import GoogleBackup from './GoogleBackup';
import AllSet from './AllSet';
import SetPassword from './SetPassword';
import Particles from 'react-tsparticles';
import * as bip39 from 'bip39';
import {
  ComponentTransition,
  AnimationTypes,
} from 'react-component-transition';
import { LLPinAlert } from '@/ui/FRWComponent';
import options from '../Import/options'
import { useWallet } from 'ui/utils';

enum Direction {
  Right,
  Left,
}

const Sync = () => {
  const history = useHistory();
  const wallet = useWallet();
  const [activeIndex, onChange] = useState(0);
  const [direction, setDirection] = useState(Direction.Right);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(null);
  const [mnemonic, setMnemonic] = useState(bip39.generateMnemonic());

  const getUsername = (username: string) => {
    setUsername(username.toLowerCase());
  };

  const loadView = async () => {
    // console.log(wallet);
    wallet.getCurrentAccount().then((res) => {
      if (res) {
        history.push('/');
      }
    }).catch(() => {
      return;
    });
  };

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
          <SyncQr
            handleClick={goNext}
            savedUsername={username}
            getUsername={getUsername}
          />
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
            mnemonic={mnemonic}
            username={username}
          />
        );
      case 4:
        return <GoogleBackup handleClick={goNext} mnemonic={mnemonic} username={username} password={password} />
      case 5:
        return <AllSet handleClick={goNext} />;
      default:
        return <div />;
    }
  };

  useEffect(() => {
    console.log('wallet');
    loadView();
  }, []);

  const height = [480, 600, 640, 620, 480, 480]

  return (
    <ThemeProvider theme={theme}>
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
        {activeIndex == 5 && (
          <Particles
            //@ts-expect-error customized option
            options={options}
          />
        )}
        <RegisterHeader />

        <LLPinAlert open={activeIndex == 5} />

        <Box sx={{ flexGrow: 0.7 }} />
        {/* height why not use auto */}
        <Box
          sx={{
            height: '460px',
            backgroundColor: 'transparent'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              px: '60px',
              backgroundColor: '#222',
              height: '380px',
              width: '620px',
              position: 'relative',
              borderRadius: '24px'
            }}
          >


            <Box
              sx={{
                display: 'flex',
                // height: '56px',
                // backgroundColor: '#404040',
                padding: '  0px 0',
                position: 'absolute',
                left: '-95px',
                top:'0px'
              }}
            >
              {(activeIndex !== 4 && activeIndex !== 5) &&
                <IconButton onClick={goBack} size="small">
                  <BackButtonIcon color="#5E5E5E" size={27} />
                </IconButton>
              }

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
        </Box>

        <Box sx={{ flexGrow: 1 }} />
      </Box>
    </ThemeProvider>
  );
};

export default Sync;
