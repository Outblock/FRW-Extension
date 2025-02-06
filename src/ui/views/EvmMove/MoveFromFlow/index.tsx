import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Typography, Drawer, IconButton, Grid } from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import type { Contact } from '@/shared/types/network-types';
import { withPrefix, isValidEthereumAddress } from '@/shared/utils/address';
import { WarningStorageLowSnackbar } from '@/ui/FRWComponent/WarningStorageLowSnackbar';
import { useStorageCheck } from '@/ui/utils/useStorageCheck';
import type { CoinItem } from 'background/service/coinList';
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

const EVM_CONTACT = {
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

const MoveFromFlow = (props: TransferConfirmationProps) => {
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
  const [userWallet, setWallet] = useState<any>(null);
  const [currentCoin, setCurrentCoin] = useState<string>('flow');
  const [coinList, setCoinList] = useState<CoinItem[]>([]);
  // const [exceed, setExceed] = useState(false);
  const [amount, setAmount] = useState<string | undefined>('');
  // const [validated, setValidated] = useState<any>(null);
  const [userInfo, setUser] = useState<Contact>(USER_CONTACT);
  const [evmUserInfo, setEvmUser] = useState<Contact>(EVM_CONTACT);
  const [network, setNetwork] = useState('mainnet');
  const [evmAddress, setEvmAddress] = useState('');
  const [coinInfo, setCoinInfo] = useState<CoinItem>(EMPTY_COIN);
  const [secondAmount, setSecondAmount] = useState('0.0');
  const [isLoading, setLoading] = useState<boolean>(false);
  const [errorType, setErrorType] = useState<any>(null);
  const [exceed, setExceed] = useState(false);

  const { sufficient: isSufficient, sufficientAfterAction } = useStorageCheck({
    transferAmount: Number(amount) || 0,
    coin: currentCoin,
    // We are moving from a Flow account to an EVM account
    movingBetweenEVMAndFlow: true,
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
    const evmWallet = await usewallet.getEvmWallet();
    console.log('evmWallet ', evmWallet);
    setEvmAddress(evmWallet.address);
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

    const evmContact = {
      ...EVM_CONTACT,
      address: withPrefix(evmWallet.address) || '',
      avatar: evmWallet.icon,
      contact_name: evmWallet.name,
    };
    setEvmUser(evmContact);
    setLoading(false);

    return;
  }, [usewallet]);

  const moveToken = async () => {
    setLoading(true);
    usewallet
      .fundFlowEvm(amount)
      .then(async (txId) => {
        usewallet.listenTransaction(
          txId,
          true,
          'Transfer to EVM complete',
          `Your have moved ${amount} Flow to your EVM address ${evmAddress}. \nClick to view this transaction.`
        );
        await usewallet.setDashIndex(0);
        history.push(`/dashboard?activity=1&txId=${txId}`);
        setLoading(false);
        props.handleCloseIconClicked();
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const bridgeToken = async () => {
    setLoading(true);
    const tokenResult = await usewallet.openapi.getTokenInfo(currentCoin, network);
    console.log('tokenResult ', tokenResult);
    const address = tokenResult!.address.startsWith('0x')
      ? tokenResult!.address.slice(2)
      : tokenResult!.address;

    let flowId = `A.${address}.${tokenResult!.contractName}.Vault`;

    if (isValidEthereumAddress(address)) {
      flowId = tokenResult!['flowIdentifier'];
    }
    usewallet
      .bridgeToEvm(flowId, amount)
      .then(async (txId) => {
        usewallet.listenTransaction(
          txId,
          true,
          'Transfer to EVM complete',
          `Your have moved ${amount} ${tokenResult!.contractName} to your EVM address ${evmAddress}. \nClick to view this transaction.`
        );
        await usewallet.setDashIndex(0);
        history.push(`/dashboard?activity=1&txId=${txId}`);
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
    if (currentCoin.toLowerCase() === 'flow') {
      moveToken();
    } else {
      bridgeToken();
    }
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
        {userWallet && <TransferFrom wallet={userWallet} userInfo={userInfo} />}
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
        {evmAddress && <TransferTo wallet={evmAddress} userInfo={userInfo} />}
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

export default MoveFromFlow;
