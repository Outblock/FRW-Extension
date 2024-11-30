import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Typography, Drawer, IconButton, Grid } from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import wallet from '@/background/controller/wallet';
import { WarningStorageLowSnackbar } from '@/ui/FRWComponent/WarningStorageLowSnackbar';
import { useStorageCheck } from '@/ui/utils/useStorageCheck';
import type { CoinItem } from 'background/service/coinList';
import type { Contact } from 'background/service/networkModel';
import { LLSpinner } from 'ui/FRWComponent';
import { useWallet } from 'ui/utils';
import { withPrefix } from 'ui/utils/address';

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

const MoveFromEvm = (props: TransferConfirmationProps) => {
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
  const [exceed, setExceed] = useState(false);
  const [minAmount, setMinAmount] = useState<any>(0.001);

  const { sufficient: isSufficient, sufficientAfterAction } = useStorageCheck({
    transferAmount: Number(amount) || 0,
    movingBetweenEVMAndFlow: true,
  });

  const isLowStorage = isSufficient !== undefined && !isSufficient; // isSufficient is undefined when the storage check is not yet completed
  const isLowStorageAfterAction = sufficientAfterAction !== undefined && !sufficientAfterAction;

  const setUserWallet = useCallback(async () => {
    // const walletList = await storage.get('userWallet');
    setLoading(true);
    const wallet = await usewallet.getMainWallet();
    const network = await usewallet.getNetwork();
    const token = await usewallet.getCurrentCoin();
    setNetwork(network);
    setCurrentCoin(token);
    // userWallet
    await setWallet(wallet);
    const evmWallet = await usewallet.getEvmWallet();
    setEvmAddress(evmWallet.address);
    const coinList = await usewallet.getCoinList();
    setCoinList(coinList);
    const tokenResult = await usewallet.openapi.getEvmTokenInfo(token, network);
    const coinInfo = coinList.find(
      (coin) => coin && coin.unit.toLowerCase() === tokenResult!.symbol.toLowerCase()
    );
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

    try {
      // Try fetching the min amount from the API
      const minAmount = await usewallet.openapi.getAccountMinFlow(userContact.address);
      setMinAmount(minAmount);
    } catch (error) {
      // If there's an error, set the min amount to 0.001
      console.error('Error fetching min amount:', error);
      setMinAmount(0.001);
    }
    // const result = await usewallet.openapi.fetchTokenList(network);
    setLoading(false);
    return;
  }, [usewallet]);

  const moveToken = async () => {
    setLoading(true);
    usewallet
      .withdrawFlowEvm(amount, userInfo.address)
      .then(async (createRes) => {
        usewallet.listenTransaction(
          createRes,
          true,
          'Transfer from EVM complete',
          `Your have moved ${amount} Flow to your address ${userWallet}. \nClick to view this transaction.`
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

  const bridgeToken = async () => {
    setLoading(true);
    const tokenResult = await wallet.openapi.getEvmTokenInfo(currentCoin, network);

    let flowId = tokenResult!['flowIdentifier'];

    if (!flowId) {
      console.log('tokenResult ', tokenResult);
      const address = tokenResult!.address.startsWith('0x')
        ? tokenResult!.address.slice(2)
        : tokenResult!.address;
      flowId = `A.${address}.${tokenResult!.contractName}.Vault`;
    }

    usewallet
      .bridgeToFlow(flowId, amount, tokenResult)
      .then(async (createRes) => {
        usewallet.listenTransaction(
          createRes,
          true,
          'Transfer from EVM complete',
          `Your have moved ${amount} ${flowId.split('.')[2]} to your address ${userWallet}. \nClick to view this transaction.`
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

  const handleCoinInfo = useCallback(async () => {
    if (coinList.length > 0) {
      const coinInfo = coinList.find(
        (coin) => coin.unit.toLowerCase() === currentCoin.toLowerCase()
      );
      setCoinInfo(coinInfo!);
    }
  }, [coinList, currentCoin]);

  const handleMove = async () => {
    if (currentCoin.toLowerCase() === 'flow') {
      moveToken();
    } else {
      bridgeToken();
    }
  };

  useEffect(() => {
    setUserWallet();
  }, [setUserWallet]);

  useEffect(() => {
    handleCoinInfo();
  }, [currentCoin, handleCoinInfo]);

  return (
    <Drawer
      anchor="bottom"
      sx={{ zIndex: '1200 !important' }}
      open={props.isConfirmationOpen}
      transitionDuration={300}
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
        {userWallet && <TransferTo wallet={evmAddress} userInfo={userInfo} />}
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
              <Button sx={{ minWidth: '28px', borderRadius: '28px', padding: 0 }}>
                <IconSwitch
                  color={'#41CC5D'}
                  size={28}
                  style={{ borderRadius: '28px', border: '3px solid #000' }}
                />
              </Button>
            </Box>
          )}
        </Box>
        {evmAddress && <TransferFrom wallet={userWallet} userInfo={userInfo} />}
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
        {coinInfo && coinInfo.unit && (
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
            minAmount={minAmount}
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
          disabled={Number(amount) <= 0 || isLoading}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="text.primary">
            {chrome.i18n.getMessage('Move')}
          </Typography>
        </Button>
      </Box>
    </Drawer>
  );
};

export default MoveFromEvm;
