import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Typography, IconButton, Box, CardMedia } from '@mui/material';
import { LLPrimaryButton, LLSpinner } from 'ui/FRWComponent';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import '../../Unlock/style.css';
import flownsPBanner from 'ui/FRWAssets/svg/flownsPBanner.svg';
import CheckCircleIcon from '../../../components/iconfont/IconCheckmark';
import SubstructIcon from '../../../components/iconfont/IconSubtract';
import { useWallet } from 'ui/utils';

const Flowns = () => {
  const history = useHistory();
  const wallet = useWallet();
  const [claiming, setClaiming] = useState(false);
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');

  const handleClaiming = async () => {
    setClaiming(true);
    wallet
      .flownsPrepare()
      .then(async (res) => {
        if (res.status == 400) {
          setFailed(true);
          setError(chrome.i18n.getMessage('Domain__already__exist'));
          return;
        }
        const script = res.data.cadence;
        const domain = res.data.domain;
        const domainArray = domain.split('.');
        const flownsAddress = res.data.flowns_server_address;
        const lilicoAddress = res.data.lilico_server_address;
        wallet
          .flownsResponse(script, domainArray[0], flownsAddress, lilicoAddress)
          .then(async (res) => {
            wallet.listenTransaction(
              res['txId'],
              true,
              chrome.i18n.getMessage('Domain__creation__complete'),
              `Your flowns domain ${domain} has been created. \nClick to view this transaction.`
            );
            await wallet.setDashIndex(0);
            history.push('/dashboard?activity=1');
          })
          .catch((err) => {
            console.log(err);
            setFailed(true);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getUsername = async () => {
    const userInfo = await wallet.getUserInfo(false);
    setUsername(userInfo.username);
  };

  useEffect(() => {
    getUsername();
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          padding: '20px 0 0',
          marginLeft: '18px',
        }}
      >
        <IconButton onClick={history.goBack}>
          <ArrowBackIcon sx={{ color: 'icon.navi' }} />
        </IconButton>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            marginLeft: '45px',
            alignItems: 'center',
          }}
        >
          <CardMedia
            sx={{ width: '260px', height: '34px', borderRadius: '12px' }}
            image={flownsPBanner}
          />
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '18px',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '60px',
            backgroundColor: '#282828',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            display="inline"
            sx={{
              fontWeight: 'bold',
              fontSize: '20px',
              color: '#fff',
            }}
            variant="body2"
          >
            {username}
            <Typography
              display="inline"
              sx={{
                fontWeight: 'bold',
                fontSize: '20px',
                color: '#41CC5D',
              }}
              variant="body2"
            >
              .meow
            </Typography>
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: '0 36px',
        }}
      >
        <Typography
          component="div"
          sx={{ textAlign: 'left', fontSize: '14px' }}
          variant="overline"
          color="#787878"
        >
          {chrome.i18n.getMessage('Things__You__should__Know')}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'start',
            alignItems: 'flex-start',
            py: '17px',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <CheckCircleIcon color="#41CC5D" size={24} />
          </Box>
          <Typography
            component="div"
            sx={{
              textAlign: 'left',
              lineHeight: '18px',
              marginLeft: '11px',
              fontSize: '15px',
            }}
            variant="overline"
            color="text.primary"
          >
            {chrome.i18n.getMessage(
              'Free__lilico__domain__help__you__find__each__other__easier__on__chain'
            )}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'start',
            alignItems: 'flex-start',
            paddingBottom: '17px',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <CheckCircleIcon color="#41CC5D" size={24} />
          </Box>
          <Typography
            component="div"
            sx={{
              textAlign: 'left',
              lineHeight: '18px',
              marginLeft: '11px',
              fontSize: '15px',
            }}
            variant="overline"
            color="text.primary"
          >
            {chrome.i18n.getMessage(
              'An__Inbox__system__will__help__you__send__tokens__and__NFT__to__your__friend__without__enable__vault'
            )}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'start',
            alignItems: 'flex-start',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <SubstructIcon color="#FFD500" size={24} />
          </Box>
          <Typography
            component="div"
            sx={{
              textAlign: 'left',
              lineHeight: '18px',
              marginLeft: '11px',
              fontSize: '15px',
            }}
            variant="overline"
            color="text.primary"
          >
            {chrome.i18n.getMessage(
              'Anonymous__mode__will__be__affected__others__can__find__your__address__by__your__domain'
            )}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1 }} />
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
            {failed ? (
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 'bold', fontSize: '14px' }}
                color="error"
              >
                {chrome.i18n.getMessage('Submission_error') + error}
              </Typography>
            ) : (
              <Box
                sx={{ display: 'flex', justifyContent: 'center', gap: '5px' }}
              >
                <LLSpinner size={28} />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold' }}
                  color="background.paper"
                >
                  {chrome.i18n.getMessage('Working_on_it')}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <LLPrimaryButton
            label={chrome.i18n.getMessage('Claim')}
            onClick={handleClaiming}
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
    </Box>
  );
};

export default Flowns;
