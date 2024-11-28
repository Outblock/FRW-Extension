import { Typography, Box, ButtonBase, CardMedia } from '@mui/material';
import { type TokenInfo } from 'flow-native-token-registry';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { LLPrimaryButton } from '@/ui/FRWComponent';
import { isValidEthereumAddress } from '@/ui/utils/address';
import iconMove from 'ui/FRWAssets/svg/moveIcon.svg';
import { useWallet } from 'ui/utils';
import { addDotSeparators } from 'ui/utils/number';

import IconChevronRight from '../../../components/iconfont/IconChevronRight';

// import tips from 'ui/FRWAssets/svg/tips.svg';

const TokenInfoCard = ({
  price,
  token,
  setAccessible,
  accessible,
  setMoveOpen,
  tokenInfo,
  network,
  childType,
  childAccount,
  setAlertOpen,
}) => {
  const wallet = useWallet();
  const history = useHistory();
  const isMounted = useRef(true);
  const [balance, setBalance] = useState(0);
  const [active, setIsActive] = useState(true);
  const [data, setData] = useState<TokenInfo | undefined>(undefined);
  const [evmEnabled, setEvmEnabled] = useState<boolean>(false);

  const [canMoveChild, setCanMoveChild] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      const result = await wallet.checkCanMoveChild();
      if (balance > 0 || !tokenInfo.custom) {
        setCanMoveChild(result);
      } else {
        setCanMoveChild(false);
      }
    };

    checkPermission();
  }, [balance, tokenInfo.custom, wallet]);

  const toSend = async () => {
    await wallet.setCurrentCoin(token);
    history.push('/dashboard/wallet/send');
  };

  const getActive = useCallback(async () => {
    const evmEnabled = await wallet.getEvmEnabled();
    setEvmEnabled(evmEnabled);
    const isChild = await wallet.getActiveWallet();

    const timerId = setTimeout(async () => {
      if (!isMounted.current) return; // Early exit if component is not mounted
      setData(tokenInfo!);
      console.log('tokenInfo ', tokenInfo);
      setIsActive(true);
      setAccessible(true);
      if (isChild === 'evm') {
        const coins = await wallet.getCoinList();
        const thisCoin = coins.filter((coin) => coin.unit.toLowerCase() === token);
        const balance = thisCoin[0].balance;
        setBalance(Number(balance));
      } else {
        wallet.openapi
          .getWalletTokenBalance(token)
          .then((response) => {
            if (isMounted.current) {
              setBalance(parseFloat(parseFloat(response).toFixed(3)));
            }
          })
          .catch((err) => {
            console.log('err ', err);
          });
      }
    }, 400);

    return () => {
      isMounted.current = false; // Mark component as unmounted
      clearTimeout(timerId); // Clear the timer
    };
  }, [setAccessible, token, tokenInfo, wallet]);

  const moveToken = () => {
    if (childType && childType !== 'evm') {
      setAlertOpen(true);
    } else if (data) {
      wallet.setCurrentCoin(data?.symbol);
      setMoveOpen(true);
    }
  };

  const getUrl = (data) => {
    if (data.extensions?.website?.trim()) {
      return data.extensions.website;
    }
    if (isValidEthereumAddress(data.address)) {
      return `https://evm.flowscan.io/token/${data.address}`;
    }
    return `https://flowscan.io/account/${data.address}/tokens`;
  };

  useEffect(() => {
    isMounted.current = true;
    getActive();

    return () => {
      isMounted.current = false;
    };
  }, [token, getActive]);

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
        borderRadius: '12px',
      }}
    >
      {data && (
        <>
          <Box
            sx={{ mt: '-12px', display: 'flex', justifyContent: 'space-between', width: '100%' }}
          >
            <img
              style={{
                height: '64px',
                width: '64px',
                backgroundColor: '#282828',
                borderRadius: '32px',
              }}
              src={
                data.logoURI ||
                'https://cdn.jsdelivr.net/gh/FlowFans/flow-token-list@main/token-registry/A.1654653399040a61.FlowToken/logo.svg'
              }
            ></img>
            <ButtonBase onClick={() => window.open(getUrl(data), '_blank')}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'linear-gradient(270deg, #282828, #121212)',
                  gap: '4px',
                  px: '8px',
                  py: '4px',
                  marginRight: '4px',
                  borderRadius: '8px',
                  alignSelf: 'end',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: '550',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '130px',
                  }}
                >
                  {data.name}
                </Typography>
                <IconChevronRight size={20} />
              </Box>
            </ButtonBase>

            <Box sx={{ flex: 1 }} />
            {canMoveChild && (
              <ButtonBase onClick={() => moveToken()}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(65, 204, 93, 0.16)',
                    gap: '4px',
                    px: '8px',
                    py: '4px',
                    borderRadius: '8px',
                    alignSelf: 'end',
                  }}
                >
                  <Typography sx={{ fontWeight: 'normal', color: '#41CC5D' }}>
                    {chrome.i18n.getMessage('Move')}
                  </Typography>
                  <CardMedia
                    sx={{ width: '12px', height: '12px', marginLeft: '4px' }}
                    image={iconMove}
                  />
                </Box>
              </ButtonBase>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '6px', pt: '18px' }}>
            <Typography variant="body1" sx={{ fontWeight: '700', fontSize: '32px' }}>
              {addDotSeparators(balance)}
            </Typography>
            <Typography
              variant="caption"
              color="neutral2.main"
              sx={{ fontWeight: 'medium', fontSize: '14px', textTransform: 'uppercase' }}
            >
              {data.symbol}
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '16px' }}>
            ${addDotSeparators(balance * price)} {chrome.i18n.getMessage('USD')}
          </Typography>
          <Box sx={{ display: 'flex', gap: '12px', height: '36px', mt: '24px', width: '100%' }}>
            {(!childType || childType === 'evm') && (
              <LLPrimaryButton
                sx={{
                  borderRadius: '8px',
                  height: '36px',
                  fontSize: '14px',
                  color: 'primary.contrastText',
                  fontWeight: '600',
                }}
                disabled={!accessible}
                onClick={toSend}
                label={chrome.i18n.getMessage('Send')}
                fullWidth
              />
            )}
            <LLPrimaryButton
              sx={{
                borderRadius: '8px',
                height: '36px',
                fontSize: '14px',
                color: 'primary.contrastText',
                fontWeight: '600',
              }}
              disabled={!accessible}
              onClick={() => history.push('/dashboard/wallet/deposit')}
              label={chrome.i18n.getMessage('Deposit')}
              fullWidth
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default TokenInfoCard;
