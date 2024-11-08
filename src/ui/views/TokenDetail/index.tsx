import React, { useEffect, useState } from 'react';
import { useWallet } from 'ui/utils';
import { useHistory, useParams } from 'react-router-dom';
import { Box, Menu, MenuItem, Typography, IconButton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { StyledEngineProvider } from '@mui/material/styles';
import TokenInfoCard from './TokenInfoCard';
import StackingCard from './StackingCard';
import PriceCard from './PriceCard';
import ClaimTokenCard from './ClaimTokenCard';
import MoveFromEvm from '../EvmMove/MoveFromEvm';
import MoveFromChild from '../EvmMove/MoveFromChild';
import MoveFromFlow from '../EvmMove/MoveFromFlow';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { PriceProvider } from '@/background/service/networkModel';
import LLComingSoon from '@/ui/FRWComponent/LLComingSoonWarning';
import tips from 'ui/FRWAssets/svg/tips.svg';
import { storage } from '@/background/webapi';

const useStyles = makeStyles(() => ({
  page: {
    width: '100%',
    height: '100%',
    overflow: 'auto',
    backgroundColor: 'black',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '0 18px',
    paddingTop: '4px',
    width: '100%',
    paddingBottom: '18px',
  },
}));

const TokenDetail = () => {
  const classes = useStyles();
  const usewallet = useWallet();
  const history = useHistory();
  const [price, setPrice] = useState(0);
  const [accessible, setAccessible] = useState(true);
  const token = useParams<{ id: string }>().id.toLowerCase();
  const [network, setNetwork] = useState('mainnet');
  const [walletName, setCurrentWallet] = useState({ name: '' });
  const [moveOpen, setMoveOpen] = useState<boolean>(false);
  const [tokenInfo, setTokenInfo] = useState<any>(undefined);
  const [providers, setProviders] = useState<PriceProvider[]>([]);
  const [childAccount, setChildAccount] = useState<any>({});
  const [childType, setChildType] = useState<string>('');
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  const handleDeleteEFT = async () => {
    const network = await usewallet.getNetwork();

    let evmCustomToken = (await storage.get(`${network}evmCustomToken`)) || [];

    // Filter out any empty objects from evmCustomToken
    evmCustomToken = evmCustomToken.filter(token => Object.keys(token).length > 0);

    // Filter out the token with the matching address
    evmCustomToken = evmCustomToken.filter(
      (token) => token.address.toLowerCase() !== tokenInfo.address.toLowerCase()
    );

    await storage.set(`${network}evmCustomToken`, evmCustomToken);
    console.log('evmCustomToken ', evmCustomToken)
    await usewallet.clearCoinList();
    await usewallet.openapi.refreshCustomEvmGitToken(network);
    history.replace({ pathname: history.location.pathname, state: { refreshed: true } });
    history.goBack();
  };



  const Header = () => {
    return (
      <Box sx={{ display: 'flex', mx: '-12px', position: 'relative' }}>
        <IconButton onClick={history.goBack}>
          <ArrowBackIcon sx={{ color: 'icon.navi' }} />
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />
        {tokenInfo && tokenInfo.custom &&
          <IconButton onClick={handleMenuToggle}>
            <MoreHorizIcon sx={{ color: 'icon.navi' }} />
          </IconButton>
        }
        {menuOpen && (
          <Box
            sx={{
              position: 'absolute',
              top: '100%',
              right: 0,
              bgcolor: '#222222',
              color: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
            }}
          >
            <MenuItem onClick={handleDeleteEFT} sx={{ fontSize: '12px', fontWeight: 400 }}>Delete EFT</MenuItem>
          </Box>
        )}
      </Box>
    );
  };

  const getProvider = async () => {
    const result = await usewallet.openapi.getPriceProvider(token);
    const tokenResult = await usewallet.openapi.getTokenInfo(token);
    if (tokenResult) {
      setTokenInfo(tokenResult);
    }
    setProviders(result);
    if (result.length == 0) {
      const data = await usewallet.openapi.getTokenPrices();
      const price = await usewallet.openapi.getPricesByAddress(tokenResult!.address, data);
      if (price) {
        setPrice(price);
      }
    }
  };

  const loadNetwork = async () => {
    const network = await usewallet.getNetwork();
    const currentWallet = await usewallet.getCurrentWallet();
    setCurrentWallet(currentWallet);
    setNetwork(network);
  };

  const requestChildType = async () => {
    const result = await usewallet.getActiveWallet();
    const childresp = await usewallet.checkUserChildAccount();
    setChildAccount(childresp);
    setChildType(result);
  };

  const renderMoveComponent = () => {
    if (childType === 'evm') {
      return (
        <MoveFromEvm
          isConfirmationOpen={moveOpen}
          data={{ amount: 0 }}
          handleCloseIconClicked={() => setMoveOpen(false)}
          handleCancelBtnClicked={() => setMoveOpen(false)}
          handleAddBtnClicked={() => {
            setMoveOpen(false);
          }}
        />
      );
    } else if (childType) {
      return (
        <MoveFromChild
          isConfirmationOpen={moveOpen}
          data={{ amount: 0 }}
          handleCloseIconClicked={() => setMoveOpen(false)}
          handleCancelBtnClicked={() => setMoveOpen(false)}
          handleAddBtnClicked={() => {
            setMoveOpen(false);
          }}
        />
      );

    }
    else {
      return (
        <MoveFromFlow
          isConfirmationOpen={moveOpen}
          data={{ amount: 0 }}
          handleCloseIconClicked={() => setMoveOpen(false)}
          handleCancelBtnClicked={() => setMoveOpen(false)}
          handleAddBtnClicked={() => {
            setMoveOpen(false);
          }}
        />
      );
    }
  };


  useEffect(() => {
    loadNetwork();
    getProvider();
    requestChildType();
  }, []);

  return (
    <StyledEngineProvider injectFirst>
      <div className={`${classes.page} page`}>
        <div className={classes.container}>
          <Header />
          {!accessible && (
            <Box
              sx={{
                display: 'flex',
                marginBottom: '12px',
                borderRadius: '8px',
                padding: '8px 11px',
                backgroundColor: 'error.light',
              }}
            >
              <img
                style={{ height: '16px', width: '16px', borderRadius: '16px' }}
                src={tips}
              ></img>
              <Typography
                sx={{
                  fontSize: '12px',
                  marginLeft: '5px',
                  color: 'error.main',
                }}
              >
                Flow Wallet doesn’t have access to {`${token}`} in
                {`${walletName.name}`} Account, please check your linked account
                settings.
              </Typography>
            </Box>
          )}
          {tokenInfo &&
            <TokenInfoCard
              price={price}
              token={token}
              setAccessible={setAccessible}
              accessible={accessible}
              setMoveOpen={setMoveOpen}
              tokenInfo={tokenInfo}
              network={network}
              childType={childType}
              childAccount={childAccount}
              setAlertOpen={setAlertOpen}
            />
          }
          {token === 'flow' && <StackingCard network={network} />}
          {/* {network === 'testnet' || network === 'crescendo' && token === 'flow' && <ClaimTokenCard token={token} />} */}
          <ClaimTokenCard token={token} />
          {providers?.length > 0 && (
            <PriceCard
              token={token}
              price={price}
              setPrice={setPrice}
              providers={providers}
            />
          )}
          {
            moveOpen && renderMoveComponent()
          }
          {network === 'mainnet' && (
            <LLComingSoon
              alertOpen={alertOpen}
              handleCloseIconClicked={() => setAlertOpen(false)}
            />
          )}

        </div>
      </div>
    </StyledEngineProvider>
  );
};

export default TokenDetail;
