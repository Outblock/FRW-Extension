import { Box, Button, Typography, IconButton, CardMedia } from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Web3 from 'web3';

import { LLHeader } from '@/ui/FRWComponent';
import SlideRelative from '@/ui/FRWComponent/SlideRelative';
import { type CoinItem } from 'background/service/coinList';
import { type Contact } from 'background/service/networkModel';
import erc20ABI from 'background/utils/erc20.abi.json';
import { EVM_ENDPOINT } from 'consts';
import { LLContactCard } from 'ui/FRWComponent';
import { useWallet } from 'ui/utils';
import { withPrefix, isValidEthereumAddress } from 'ui/utils/address';

import CancelIcon from '../../../../components/iconfont/IconClose';
import TransferAmount from '../TransferAmount';

import EvmConfirmation from './EvmConfirmation';
import ToEthConfirmation from './ToEthConfirmation';
interface ContactState {
  contact: Contact;
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

const EMPTY_COIN: CoinItem = {
  coin: '',
  unit: '',
  balance: 0,
  price: 0,
  change24h: 0,
  total: 0,
  icon: '',
};
const SendEth = () => {
  const location = useLocation<ContactState>();
  const usewallet = useWallet();
  const [userWallet, setWallet] = useState<any>(null);
  const [currentCoin, setCurrentCoin] = useState<string>('flow');
  const [coinList, setCoinList] = useState<CoinItem[]>([]);
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  const [exceed, setExceed] = useState(false);
  const [amount, setAmount] = useState<string | undefined>(undefined);
  const [secondAmount, setSecondAmount] = useState('0');
  const [validated, setValidated] = useState<any>(null);
  const [userInfo, setUser] = useState<Contact>(USER_CONTACT);
  const [network, setNetwork] = useState('mainnet');
  const [coinInfo, setCoinInfo] = useState<CoinItem>(EMPTY_COIN);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [childType, setChildType] = useState<string>('');
  const [minAmount, setMinAmount] = useState<any>(0);
  const [erc20Contract, setErc20Contract] = useState<any>(null);
  const [web3, setWeb3] = useState<any>(null);

  const setUserMinAmount = useCallback(
    async (address: string) => {
      try {
        // Try fetching the min amount from the API
        const minAmount = await usewallet.openapi.getAccountMinFlow(address);
        setMinAmount(minAmount);
      } catch (error) {
        // If there's an error, set the min amount to 0.001
        console.error('Error fetching min amount:', error);
        setMinAmount(0.001);
      }
    },
    [usewallet]
  );
  const setUserWallet = useCallback(async () => {
    // const walletList = await storage.get('userWallet');
    setLoading(true);
    const token = await usewallet.getCurrentCoin();
    const wallet = await usewallet.getEvmWallet();
    const mainWallet = await usewallet.getMainWallet();
    const network = await usewallet.getNetwork();
    const provider = new Web3.providers.HttpProvider(EVM_ENDPOINT[network]);
    const web3Instance = new Web3(provider);
    setWeb3(web3Instance);
    let contractAddress = '0x7cd84a6b988859202cbb3e92830fff28813b9341';
    try {
      if (token !== 'flow') {
        const tokenInfo = await usewallet.openapi.getEvmTokenInfo(token);
        contractAddress = tokenInfo!.address;
      }

      const contractInstance = new web3Instance.eth.Contract(erc20ABI, contractAddress);
      setErc20Contract(contractInstance);
    } catch (error) {
      console.error('Error creating the web3 contract instance:', error);
    }
    setNetwork(network);
    setCurrentCoin(token);
    // userWallet
    await setWallet(wallet);
    const coinList = await usewallet.getCoinList();
    setCoinList(coinList);
    const coinInfo = coinList.find((coin) => coin.unit.toLowerCase() === token.toLowerCase());

    if (
      coinInfo?.balance &&
      coinInfo?.price &&
      !isNaN(coinInfo.balance) &&
      !isNaN(coinInfo.price)
    ) {
      coinInfo.total =
        parseFloat(coinInfo.balance.toString()) * parseFloat(coinInfo.price.toString());
    } else {
      console.error('Invalid balance or price in coinInfo');
      coinInfo!.total = 0;
    }
    setCoinInfo(coinInfo!);

    const info = await usewallet.getUserInfo(false);
    const ct = await usewallet.getActiveWallet();

    const userContact = { ...USER_CONTACT };
    if (ct === 'evm') {
      userContact.address = withPrefix(wallet.address) || '';
    } else {
      userContact.address = withPrefix(mainWallet) || '';
    }
    userContact.avatar = info.avatar;
    userContact.contact_name = info.username;
    setUserMinAmount(userContact.address);
    setUser(userContact);
  }, [setUserMinAmount, usewallet]);

  const checkAddress = useCallback(async () => {
    const childType = await usewallet.getActiveWallet();
    console.log(' childType ', childType);
    setChildType(childType);
    //wallet controller api
    try {
      const address = location.state.contact.address;
      const validatedResult = isValidEthereumAddress(address);
      console.log('validatedResult address ', validatedResult);
      setValidated(validatedResult);
      return validatedResult;
    } catch (err) {
      console.log('validatedResult err ', err);
      setValidated(false);
    }
    setLoading(false);
  }, [setLoading, setValidated, location?.state?.contact?.address, usewallet]);

  const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const updateCoinInfo = useCallback(() => {
    const coin = coinList.find((coin) => coin.unit.toLowerCase() === currentCoin.toLowerCase());
    if (coin) {
      setCoinInfo(coin);
    }
  }, [coinList, currentCoin]);

  useEffect(() => {
    setUserWallet();
    checkAddress();
  }, [setUserWallet, checkAddress]);

  useEffect(() => {
    updateCoinInfo();
  }, [currentCoin, updateCoinInfo]);

  return (
    <div className="page">
      <>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <LLHeader title={chrome.i18n.getMessage('Send_to')} help={true} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', px: '16px' }}>
            <Box>
              <Box sx={{ zIndex: 999, backgroundColor: '#121212' }}>
                <LLContactCard
                  contact={location.state.contact}
                  hideCloseButton={false}
                  isSend={true}
                />
              </Box>
              <SlideRelative direction="down" show={validated !== null}>
                {validated ? (
                  <></>
                ) : (
                  <Box
                    sx={{
                      width: '95%',
                      backgroundColor: 'error.light',
                      mx: 'auto',
                      borderRadius: '0 0 12px 12px',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <CancelIcon size={24} color={'#E54040'} style={{ margin: '8px' }} />
                      <Typography variant="body1" color="text.secondary">
                        {chrome.i18n.getMessage('Invalid_address_in')}
                        {` ${network}`}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </SlideRelative>
            </Box>

            <Typography
              variant="body1"
              sx={{
                alignSelf: 'start',
                fontSize: '14px',
              }}
            >
              {chrome.i18n.getMessage('Transfer__Amount')}
            </Typography>
            {coinInfo.unit && (
              <TransferAmount
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

            {coinInfo.unit && (
              <>
                <Typography
                  variant="body1"
                  sx={{
                    alignSelf: 'start',
                    fontSize: '14px',
                  }}
                >
                  {chrome.i18n.getMessage('Available__Balance')}
                </Typography>

                <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <CardMedia sx={{ width: '18px', height: '18px' }} image={coinInfo.icon} />
                  <Typography
                    variant="body1"
                    sx={{
                      alignSelf: 'start',
                      fontSize: '15px',
                    }}
                  >
                    {(Math.round(coinInfo.balance * 100) / 100).toFixed(2) +
                      ' ' +
                      coinInfo.unit.toUpperCase() +
                      ' ≈ ' +
                      '$ ' +
                      coinInfo.total}
                  </Typography>
                </Box>
              </>
            )}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', gap: '8px', mx: '18px', mb: '35px', mt: '10px' }}>
            <Button
              // onClick={() => {}}
              variant="contained"
              // @ts-expect-error custom color
              color="neutral"
              size="large"
              sx={{
                height: '48px',
                borderRadius: '8px',
                flexGrow: 1,
                textTransform: 'capitalize',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="text.primary">
                {chrome.i18n.getMessage('Cancel')}
              </Typography>
            </Button>

            <Button
              onClick={() => {
                setConfirmationOpen(true);
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
              disabled={
                validated === null ||
                exceed === true ||
                amount === null ||
                parseFloat(amount || '-1') < 0
              }
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="text.primary">
                {chrome.i18n.getMessage('Next')}
              </Typography>
            </Button>
          </Box>
          {childType === 'evm' ? (
            <EvmConfirmation
              isConfirmationOpen={isConfirmationOpen}
              data={{
                contact: location.state.contact,
                amount: amount,
                secondAmount: secondAmount,
                userContact: userInfo,
                tokenSymbol: currentCoin,
                coinInfo: coinInfo,
                erc20Contract,
              }}
              handleCloseIconClicked={() => setConfirmationOpen(false)}
              handleCancelBtnClicked={() => setConfirmationOpen(false)}
              handleAddBtnClicked={() => {
                setConfirmationOpen(false);
              }}
            />
          ) : (
            <ToEthConfirmation
              isConfirmationOpen={isConfirmationOpen}
              data={{
                contact: location.state.contact,
                amount: amount,
                secondAmount: secondAmount,
                userContact: userInfo,
                tokenSymbol: currentCoin,
                coinInfo: coinInfo,
                erc20Contract,
              }}
              handleCloseIconClicked={() => setConfirmationOpen(false)}
              handleCancelBtnClicked={() => setConfirmationOpen(false)}
              handleAddBtnClicked={() => {
                setConfirmationOpen(false);
              }}
            />
          )}
        </Box>
      </>
    </div>
  );
};

export default SendEth;
