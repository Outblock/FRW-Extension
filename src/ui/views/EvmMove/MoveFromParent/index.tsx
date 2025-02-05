import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Typography, Drawer, IconButton, Grid } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import type { Contact } from '@/shared/types/network-types';
import { isValidEthereumAddress, withPrefix } from '@/shared/utils/address';
import { WarningStorageLowSnackbar } from '@/ui/FRWComponent/WarningStorageLowSnackbar';
import { useProfileStore } from '@/ui/stores/useProfileStore';
import { useStorageCheck } from '@/ui/utils/useStorageCheck';
import { type CoinItem } from 'background/service/coinList';
import { LLSpinner } from 'ui/FRWComponent';
import { useWallet } from 'ui/utils';

import IconSwitch from '../../../../components/iconfont/IconSwitch';
import theme from '../../../style/LLTheme';
import TransferFrom from '../TransferFrom';
import TransferTo from '../TransferTo';

import MoveToken from './MoveToken';

interface TransferConfirmationProps {
  isConfirmationOpen: boolean;
  data: any;
  handleCloseIconClicked: () => void;
  handleCancelBtnClicked: () => void;
  handleAddBtnClicked: () => void;
}
const USER_CONTACT = {
  address: '',
  id: 0,
  contact_name: '',
  avatar: '',
  domain: {
    domain_type: 999,
    value: '',
  },
} as unknown as Contact;

const CHILD_CONTACT = {
  address: '',
  id: 0,
  contact_name: '',
  avatar: '',
  domain: {
    domain_type: 999,
    value: '',
  },
} as unknown as Contact;

const EMPTY_COIN: CoinItem = {
  coin: '',
  unit: '',
  balance: 0,
  price: 0,
  change24h: 0,
  total: 0,
  icon: '',
};

const MoveFromParent = (props: TransferConfirmationProps) => {
  enum ENV {
    Mainnet = 'mainnet',
    Testnet = 'testnet',
  }
  enum Error {
    Exceed = 'Insufficient balance',
    Fail = 'Cannot find swap pair',
  }

  // declare enum Strategy {
  //   GitHub = 'GitHub',
  //   Static = 'Static',
  //   CDN = 'CDN'
  // }

  const usewallet = useWallet();
  const history = useHistory();
  const { childAccounts } = useProfileStore();
  const [userWallet, setWallet] = useState<any>(null);
  const [currentCoin, setCurrentCoin] = useState<string>('flow');
  const [coinList, setCoinList] = useState<CoinItem[]>([]);
  // const [exceed, setExceed] = useState(false);
  const [amount, setAmount] = useState<string | undefined>('');
  // const [validated, setValidated] = useState<any>(null);
  const [userInfo, setUser] = useState<Contact>(USER_CONTACT);
  const [childUserInfo, setChildUser] = useState<Contact>(CHILD_CONTACT);
  const [network, setNetwork] = useState('mainnet');
  const [childAddress, setChildAddress] = useState('');
  const [coinInfo, setCoinInfo] = useState<CoinItem>(EMPTY_COIN);
  const [secondAmount, setSecondAmount] = useState('0.0');
  const [isLoading, setLoading] = useState<boolean>(false);
  const [errorType, setErrorType] = useState<any>(null);
  const [exceed, setExceed] = useState(false);
  const { sufficient: isSufficient, sufficientAfterAction } = useStorageCheck({
    transferAmount: Number(amount) || 0,
    coin: currentCoin,
    // Determine if the transfer is between EVM and Flow
    movingBetweenEVMAndFlow:
      isValidEthereumAddress(userInfo.address) !== isValidEthereumAddress(childUserInfo.address),
  });

  const isLowStorage = isSufficient !== undefined && !isSufficient; // isSufficient is undefined when the storage check is not yet completed
  const isLowStorageAfterAction = sufficientAfterAction !== undefined && !sufficientAfterAction;

  const setUserWallet = useCallback(async () => {
    // const walletList = await storage.get('userWallet');
    setLoading(true);
    const token = await usewallet.getCurrentCoin();
    console.log('getCurrentCoin ', token);
    const wallet = await usewallet.getMainWallet();
    const network = await usewallet.getNetwork();
    setNetwork(network);
    setCurrentCoin(token);
    // userWallet
    await setWallet(wallet);
    const coinList = await usewallet.getCoinList();
    setCoinList(coinList);
    const currentAddress = await usewallet.getCurrentAddress();
    setChildAddress(currentAddress!);
    const coinInfo = coinList.find((coin) => coin.unit.toLowerCase() === token.toLowerCase());
    setCoinInfo(coinInfo!);

    const info = await usewallet.getUserInfo(false);
    const userContact = {
      ...USER_CONTACT,
      address: withPrefix(wallet) || '',
      avatar: info.avatar,
      contact_name: info.username,
    };
    setUser(userContact);

    const cwallet = childAccounts[currentAddress!];
    const childContact = {
      ...CHILD_CONTACT,
      address: withPrefix(currentAddress!) || '',
      avatar: cwallet.thumbnail.url,
      contact_name: cwallet.name,
    };

    setChildUser(childContact);
    setLoading(false);

    return;
  }, [usewallet, childAccounts]);

  const moveToken = async () => {
    setLoading(true);
    const tokenResult = await usewallet.openapi.getTokenInfo(currentCoin, network);
    console.log('tokenResult ', tokenResult);
    usewallet
      .moveFTfromChild(childUserInfo!.address, 'flowTokenProvider', amount!, tokenResult!.name)
      .then(async (createRes) => {
        usewallet.listenTransaction(
          createRes,
          true,
          'Transfer complete',
          `Your have moved ${amount} Flow to your address ${childAddress}. \nClick to view this transaction.`
        );
        await usewallet.setDashIndex(0);
        history.push('/dashboard?activity=1');
        setLoading(false);
        props.handleCloseIconClicked();
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const handleMove = async () => {
    console.log('currentCoin ', currentCoin);
    moveToken();
  };

  const handleCoinInfo = useCallback(async () => {
    if (coinList.length > 0) {
      const coinInfo = coinList.find(
        (coin) => coin.unit.toLowerCase() === currentCoin.toLowerCase()
      );
      setCoinInfo(coinInfo!);
    }
  }, [coinList, currentCoin]);

  useEffect(() => {
    setUserWallet();
  }, [setUserWallet]);

  useEffect(() => {
    handleCoinInfo();
  }, [currentCoin, handleCoinInfo]);

  return (
    <Drawer
      anchor="bottom"
      open={props.isConfirmationOpen}
      transitionDuration={300}
      sx={{ zIndex: '1200 !important' }}
      PaperProps={{
        sx: {
          width: '100%',
          height: 'auto',
          background: '#222',
          borderRadius: '18px 18px 0px 0px',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', px: '16px' }}>
        <Box
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
            display: 'flex',
            pb: '6px',
          }}
        >
          <Box sx={{ width: '40px' }}></Box>
          <Box sx={{ pt: '16px' }}>
            <Typography sx={{ fontWeight: '700', fontFamily: 'e-Ukraine', fontSize: '20px' }}>
              {chrome.i18n.getMessage('move_tokens')}
            </Typography>
          </Box>
          <Box sx={{ pt: '14px' }} onClick={props.handleCancelBtnClicked}>
            <IconButton>
              <CloseIcon fontSize="medium" sx={{ color: 'icon.navi', cursor: 'pointer' }} />
            </IconButton>
          </Box>
        </Box>
        {childAddress && (
          <TransferFrom wallet={childAddress} userInfo={childUserInfo} isChild={true} />
        )}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            my: '-21px',
            zIndex: '99',
          }}
        >
          {isLoading ? (
            <Box
              sx={{ borderRadius: '28px', backgroundColor: '#000', width: '28px', height: '28px' }}
            >
              <LLSpinner size={28} />
            </Box>
          ) : (
            <Box sx={{ width: '100%', height: '28px', display: 'flex', justifyContent: 'center' }}>
              <Button
                // onClick={() => switchSide()}

                sx={{ minWidth: '28px', borderRadius: '28px', padding: 0 }}
              >
                <IconSwitch
                  color={'#41CC5D'}
                  size={28}
                  style={{ borderRadius: '28px', border: '3px solid #000' }}
                />
              </Button>
            </Box>
          )}
        </Box>
        {userWallet && <TransferFrom wallet={userWallet} userInfo={userInfo} />}
      </Box>

      <Box sx={{ flexGrow: 1 }} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          mx: '18px',
          mb: '35px',
          mt: '10px',
        }}
      >
        {coinInfo.unit && (
          <MoveToken
            coinList={coinList}
            amount={amount}
            setAmount={setAmount}
            secondAmount={secondAmount}
            setSecondAmount={setSecondAmount}
            exceed={exceed}
            setExceed={setExceed}
            coinInfo={coinInfo}
            setCurrentCoin={setCurrentCoin}
          />
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: '8px', mx: '18px', mb: '35px', mt: '10px' }}>
        <WarningStorageLowSnackbar
          isLowStorage={isLowStorage}
          isLowStorageAfterAction={isLowStorageAfterAction}
        />

        <Button
          onClick={() => {
            handleMove();
          }}
          variant="contained"
          color="success"
          size="large"
          sx={{
            height: '48px',
            flexGrow: 1,
            borderRadius: '8px',
            textTransform: 'capitalize',
          }}
          disabled={Number(amount) <= 0 || errorType || isLoading}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="text.primary">
            {errorType ? errorType : chrome.i18n.getMessage('Move')}
          </Typography>
        </Button>
      </Box>
    </Drawer>
  );
};

export default MoveFromParent;
