import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Typography,
  IconButton,
  Box,
  CardMedia,
} from '@mui/material';
import {
  LLPrimaryButton,
  LLSpinner
} from 'ui/FRWComponent';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import '../../Unlock/style.css';
import flownsPBanner from 'ui/FRWAssets/svg/flownsPBanner.svg';
import enableBg from 'ui/FRWAssets/image/enableBg.png';
import CheckCircleIcon from '../../../components/iconfont/IconCheckmark';
import SubstructIcon from '../../../components/iconfont/IconSubtract'
import { useWallet } from 'ui/utils';


const Enable = () => {
  const expiry_time = 60000;
  const history = useHistory();
  const wallet = useWallet();
  const [claiming, setClaiming] = useState(false);
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState('');
  const [enough, setEnough] = useState(false);

  const handleClaiming = async () => {
    setClaiming(true);
    wallet.createCOA('0.0').then(async (createRes) => {
      wallet.listenTransaction(createRes, true, chrome.i18n.getMessage('Domain__creation__complete'), `Your flow EVM address has been created. \nClick to view this transaction.`);
      await wallet.setDashIndex(0);
      history.push('/dashboard?activity=1');

      setClaiming(false);
    }).catch((err) => {
      console.log(err);
      setClaiming(false);
    });


  };

  const getUsername = async () => {
    const storageData = await wallet.getCoinList(expiry_time);
    console.log('storageData ', storageData)
    const flowToken = storageData.find(token => token.unit === 'flow');
    if (flowToken!.balance >= 0.002) {
      setEnough(true);
    }
  };

  useEffect(() => {
    getUsername();
  }, []);

  return (
    <Box sx={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column'
    }}>
      <Box sx={{
        display: 'flex',
        padding: '20px 0 0',
        marginLeft: '18px',
        justifyContent: 'space-between'
      }}
      >
        <IconButton onClick={history.goBack}>
          <ArrowBackIcon sx={{
            color: 'icon.navi',
          }} />
        </IconButton>
        <IconButton onClick={history.goBack}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 'normal', color: 'rgba(255, 255, 255, 0.80)', textAlign: 'center', fontSize: '12px', borderRadius: '24px',
              background: ' rgba(255, 255, 255, 0.20)', width: '49px', height: '24px', lineHeight: '24px',
            }}
            color="error"
          >
            Skip
          </Typography>
        </IconButton>

      </Box>


      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'end', backgroundImage: `url(${enableBg})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'top' }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 'bold',
            color: '#e6e6e6',
            textAlign: 'center',
            fontFamily: 'Montserrat',
            fontSize: '20px',

          }}
          color="error"
        >
          Enable the Path
          to FlowEVM
        </Typography>
        {enough ?
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 'normal', color: '#bababa', textAlign: 'center', fontSize: '14px' }}
            color="error"
          >
            Manage multi-VM assets seamlessly.
          </Typography>
          :
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 'normal', color: '#bababa', textAlign: 'center', fontSize: '14px',paddingX:'38px' }}
            color="error"
          >
            Balance is lower than 0.002,
            please fund your account to continue.
          </Typography>
        }

      </Box>
      <Box sx={{ padding: '18px' }}>
        {claiming ? (
          <Box
            sx={{
              borderRadius: '12px',
              height: '50px',
              width: '100%',
              fontSize: '18px',
              textTransform: 'none !important',
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: '#f2f2f2',
              alignItems: 'center',
            }}
          >
            {failed ?
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 'bold', fontSize: '14px' }}
                color="error"
              >
                {chrome.i18n.getMessage('Submission_error') + error}
              </Typography>
              :
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                <LLSpinner size={28} />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold' }}
                  color="background.paper"
                >
                  {chrome.i18n.getMessage('Working_on_it')}
                </Typography>
              </Box>
            }
          </Box>
        ) : (
          <LLPrimaryButton
            label={chrome.i18n.getMessage('Claim')}
            onClick={handleClaiming}
            disabled={!enough}
            sx={{
              borderRadius: '14px',
              height: '50px',
              width: '100%',
              fontSize: '18px',
              textTransform: 'none !important',
            }}
          />
        )}
      </Box>
      <Box
        sx={{
          borderRadius: '12px',
          fontSize: '18px',
          textTransform: 'none !important',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: '48px'
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 'normal', fontSize: '14px', color: 'rgba(255, 255, 255, 0.80)' }}
        >
          Learn More
        </Typography>
      </Box>
    </Box >
  );
};

export default Enable;
