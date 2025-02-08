import { Box, Button, Typography, IconButton, CardMedia } from '@mui/material';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Web3 from 'web3';

import { type Contact } from '@/shared/types/network-types';
import { type ActiveChildType, type CoinItem } from '@/shared/types/wallet-types';
import { withPrefix, isValidEthereumAddress } from '@/shared/utils/address';
import { LLHeader } from '@/ui/FRWComponent';
import SlideRelative from '@/ui/FRWComponent/SlideRelative';
import { useTransactionHook } from '@/ui/hooks/useTransactionHook';
import { useCoinStore } from '@/ui/stores/coinStore';
import { useNetworkStore } from '@/ui/stores/networkStore';
import { useProfileStore } from '@/ui/stores/profileStore';
import { useTransactionStore } from '@/ui/stores/transactionStore';
import erc20ABI from 'background/utils/erc20.abi.json';
import { EVM_ENDPOINT } from 'consts';
import { LLContactCard } from 'ui/FRWComponent';
import { useWallet } from 'ui/utils';

import CancelIcon from '../../../../components/iconfont/IconClose';
import TransferAmount from '../TransferAmount';

import EvmToEvmConfirmation from './EvmToEvmConfirmation';
import FlowToEVMConfirmation from './FlowToEVMConfirmation';

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
  const { mainAddress, currentWallet, userInfo } = useProfileStore();
  const { coins } = useCoinStore();
  const { currentNetwork } = useNetworkStore();
  const { selectedToken, setFromNetwork, toAddress, setTokenType } = useTransactionStore();
  const { fetchAndSetToken } = useTransactionHook();
  const web3Instance = useMemo(() => {
    const provider = new Web3.providers.HttpProvider(EVM_ENDPOINT[currentNetwork]);
    return new Web3(provider);
  }, [currentNetwork]);

  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  const [exceed, setExceed] = useState(false);
  const [amount, setAmount] = useState<string | undefined>(undefined);
  const [secondAmount, setSecondAmount] = useState('0');
  const [validated, setValidated] = useState<any>(null);
  const [senderContact, setUserContact] = useState<Contact>(USER_CONTACT);
  const [coinInfo, setCoinInfo] = useState<CoinItem>(EMPTY_COIN);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [childType, setChildType] = useState<ActiveChildType>(null);
  const [erc20Contract, setErc20Contract] = useState<any>(null);

  const setUserWallet = useCallback(async () => {
    setLoading(true);
    setFromNetwork(currentWallet.address);
    let contractAddress = '0x7cd84a6b988859202cbb3e92830fff28813b9341';
    try {
      if (selectedToken?.symbol.toLowerCase() !== 'flow') {
        contractAddress = selectedToken!.address;
        setTokenType('FT');
      } else {
        setTokenType('Flow');
      }

      const contractInstance = new web3Instance.eth.Contract(erc20ABI, contractAddress);
      console.log('initial contractInstance ', contractInstance);
      setErc20Contract(contractInstance);
    } catch (error) {
      console.error('Error creating the web3 contract instance:', error);
    }
    console.log('selectedToken, ', selectedToken);
    // userWallet
    // TODO: change the structure of the coininfo in the background so we only need to get the coinInfo for everything.
    const coinInfo = coins.find(
      (coin) => coin.unit.toLowerCase() === selectedToken?.symbol.toLowerCase()
    );

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
    const userContact = { ...USER_CONTACT };
    userContact.address = withPrefix(currentWallet.address) || '';
    userContact.avatar = userInfo?.avatar || '';
    userContact.contact_name = userInfo?.username || '';
    setUserContact(userContact);
  }, [coins, userInfo, currentWallet, web3Instance, selectedToken, setTokenType, setFromNetwork]);

  const checkAddress = useCallback(async () => {
    const childType = await usewallet.getActiveWallet();
    console.log(' childType ', childType);
    setChildType(childType);
    //wallet controller api
    try {
      const address = toAddress;
      const validatedResult = isValidEthereumAddress(address);
      setValidated(validatedResult);
      return validatedResult;
    } catch (err) {
      console.log('validatedResult err ', err);
      setValidated(false);
    }
    setLoading(false);
  }, [setLoading, setValidated, usewallet, toAddress]);

  const updateCoontractInfo = useCallback(async () => {
    let contractAddress = '0x7cd84a6b988859202cbb3e92830fff28813b9341';
    if (selectedToken?.symbol.toLowerCase() !== 'flow') {
      contractAddress = selectedToken!.address;
      setTokenType('FT');
    } else {
      setTokenType('Flow');
    }
    const contractInstance = new web3Instance.eth.Contract(erc20ABI, contractAddress);
    console.log('updated ContractInstance ', contractInstance);
    setErc20Contract(contractInstance);
  }, [setErc20Contract, setTokenType, selectedToken, web3Instance]);

  const updateCoinInfo = useCallback(() => {
    const coin = coins.find(
      (coin) => coin.unit.toLowerCase() === selectedToken!.symbol.toLowerCase()
    );
    updateCoontractInfo();
    if (coin) {
      setCoinInfo(coin);
    }
  }, [coins, selectedToken, updateCoontractInfo]);

  useEffect(() => {
    setUserWallet();
    checkAddress();
  }, [setUserWallet, checkAddress]);

  useEffect(() => {
    updateCoinInfo();
  }, [selectedToken, updateCoinInfo]);

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
                        {` ${currentNetwork}`}
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
                coinList={coins}
                amount={amount}
                setAmount={setAmount}
                secondAmount={secondAmount}
                setSecondAmount={setSecondAmount}
                exceed={exceed}
                setExceed={setExceed}
                coinInfo={coinInfo}
                setCurrentCoin={fetchAndSetToken}
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
            <EvmToEvmConfirmation
              isConfirmationOpen={isConfirmationOpen}
              data={{
                contact: location.state.contact,
                amount: amount,
                secondAmount: secondAmount,
                userContact: senderContact,
                tokenSymbol: selectedToken?.symbol,
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
            <FlowToEVMConfirmation
              isConfirmationOpen={isConfirmationOpen}
              data={{
                contact: location.state.contact,
                amount: amount,
                secondAmount: secondAmount,
                userContact: senderContact,
                tokenSymbol: selectedToken?.symbol,
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
