import React, { useEffect, useState, useRef } from 'react';
import { useWallet } from 'ui/utils';
import { Typography, Box, ButtonBase } from '@mui/material';
import IconChevronRight from '../../../components/iconfont/IconChevronRight';
import { LLPrimaryButton } from '@/ui/FRWComponent';
import {
  TokenInfo,
} from 'flow-native-token-registry';

import { useHistory } from 'react-router-dom';
// import tips from 'ui/FRWAssets/svg/tips.svg';

const TokenInfoCard = ({ price, token, setAccessible, accessible, setMoveOpen }) => {
  const wallet = useWallet();
  const history = useHistory();
  const isMounted = useRef(true);
  const [balance, setBalance] = useState(0);
  const [active, setIsActive] = useState(true);
  const [data, setData] = useState<TokenInfo | undefined>(undefined);

  const toSend = async () => {
    await wallet.setCurrentCoin(token);
    history.push('/dashboard/wallet/send');
  };

  const getActive = async () => {
    const isChild = await wallet.getActiveWallet();

    const timerId = setTimeout(async () => {
      wallet.openapi.getTokenInfo(token).then(async (response) => {
        if (!isMounted.current) return;  // Early exit if component is not mounted
        setData(response!);

        if (isChild && response) {
          const address = await wallet.getCurrentAddress();
          const ftResult = await wallet.checkAccessibleFt(address);
          if (ftResult) {
            const hasMatch = ftResult.some(item => {
              const parts = item.id.split('.');
              const thirdString = parts[2];
              return response.contractName === thirdString;
            });

            if (hasMatch) {
              setAccessible(true);
              setIsActive(true);
            } else {
              setAccessible(false);
              setIsActive(false);
            }
          }
        } else {
          setIsActive(true);
          setAccessible(true);
        }
      });
      if (isChild === 'evm') {
        const address = await wallet.getEvmAddress();
        const balance = await wallet.getBalance(address.substring(2));
        setBalance(Number(balance) / 1e18);
      } else {
        wallet.openapi.getWalletTokenBalance(token).then((response) => {
          if (isMounted.current) {
            setBalance(parseFloat(parseFloat(response).toFixed(3)));
          }
        }).catch((err) => {
          console.log('err ', err)
        });

      }

    }, 400);

    return () => {
      isMounted.current = false;  // Mark component as unmounted
      clearTimeout(timerId);  // Clear the timer
    };
  };

  useEffect(() => {
    isMounted.current = true;
    getActive();

    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: '#121212',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        px: '18px',
        pb: '30px',
        mt: '12px',
        minHeight: '230px',
        borderRadius: '12px'
      }}>
      {data &&
        <>
          <Box sx={{ mt: '-12px', display: 'flex' }}>
            <img style={{ height: '64px', width: '64px', backgroundColor: '#282828', borderRadius: '32px' }} src={data.logoURI}></img>
            <ButtonBase onClick={() => data.extensions && window.open(data.extensions.website, '_blank')}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(270deg, #282828, #121212)',
                gap: '4px',
                px: '8px',
                py: '4px',
                borderRadius: '8px',
                alignSelf: 'end'
              }}>
                <Typography variant="h6" sx={{ fontWeight: '550' }}>{data.name}</Typography>
                <IconChevronRight size={20} />
              </Box>
            </ButtonBase>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '6px', pt: '18px' }}>
            <Typography variant="body1" sx={{ fontWeight: '700', fontSize: '32px' }}>{balance}</Typography>
            <Typography variant="caption" color="neutral2.main" sx={{ fontWeight: 'medium', fontSize: '14px', textTransform: 'uppercase' }}>{data.symbol}</Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '16px' }}>${(balance * price).toFixed(3)} {chrome.i18n.getMessage('USD')}</Typography>
          <Box sx={{ display: 'flex', gap: '12px', height: '36px', mt: '24px', width: '100%' }}>
            <LLPrimaryButton sx={{ borderRadius: '8px', height: '36px', fontSize: '14px', color: 'primary.contrastText', fontWeight: '600' }} disabled={!accessible} onClick={toSend} label={chrome.i18n.getMessage('Send')} fullWidth />
            <LLPrimaryButton sx={{ borderRadius: '8px', height: '36px', fontSize: '14px', color: 'primary.contrastText', fontWeight: '600' }} disabled={!accessible} onClick={() => history.push('/dashboard/wallet/deposit')} label={chrome.i18n.getMessage('Deposit')} fullWidth />
            <LLPrimaryButton sx={{ borderRadius: '8px', height: '36px', fontSize: '14px', color: 'primary.contrastText', fontWeight: '600' }} disabled={!accessible} onClick={setMoveOpen} label='Move' fullWidth />
          </Box>
        </>
      }
    </Box>
  );
};

export default TokenInfoCard;

