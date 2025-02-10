import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Typography, IconButton, CardMedia } from '@mui/material';
import BN from 'bignumber.js';
import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { type Contact } from '@/shared/types/network-types';
import { type ActiveChildType, type CoinItem } from '@/shared/types/wallet-types';
import { withPrefix } from '@/shared/utils/address';
import { LLHeader } from '@/ui/FRWComponent';
import SlideRelative from '@/ui/FRWComponent/SlideRelative';
import { useTransactionHook } from '@/ui/hooks/useTransactionHook';
import { useCoinStore } from '@/ui/stores/coinStore';
import { useNetworkStore } from '@/ui/stores/networkStore';
import { useProfileStore } from '@/ui/stores/profileStore';
import { useTransactionStore } from '@/ui/stores/transactionStore';
import { LLContactCard } from 'ui/FRWComponent';
import { useWallet } from 'ui/utils';

import CancelIcon from '../../../../components/iconfont/IconClose';
import TransferAmount from '../TransferAmount';

import TransferConfirmation from './TransferConfirmation';

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

const SendToCadence = () => {
  const history = useHistory();
  const location = useLocation<ContactState>();
  const usewallet = useWallet();
  const { childAccounts, currentWallet, userInfo } = useProfileStore();
  const { coins: coinList } = useCoinStore();
  const { currentNetwork: network } = useNetworkStore();
  const { selectedToken, setFromNetwork, toAddress, setTokenType } = useTransactionStore();
  const { fetchAndSetToken } = useTransactionHook();
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  const [exceed, setExceed] = useState(false);
  const [amount, setAmount] = useState<string>('0');
  const [secondAmount, setSecondAmount] = useState('0.0');
  const [validated, setValidated] = useState<any>(null);
  const [senderContact, setUserContact] = useState<Contact>(USER_CONTACT);
  const [coinInfo, setCoinInfo] = useState<CoinItem>(EMPTY_COIN);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [childType, setChildType] = useState<ActiveChildType>(null);

  const setUserWallet = useCallback(async () => {
    // const walletList = await storage.get('userWallet');
    setLoading(true);
    setFromNetwork(currentWallet.address);
    const token = selectedToken!.symbol;
    if (token !== 'flow') {
      setTokenType('FT');
    } else {
      setTokenType('Flow');
    }

    // userWallet
    const coinInfo = coinList.find((coin) => coin.unit.toLowerCase() === token.toLowerCase());
    console.log('coinInfo ', coinInfo);

    setCoinInfo(coinInfo!);

    const userContact = { ...USER_CONTACT };
    userContact.address = withPrefix(currentWallet.address) || '';
    userContact.avatar = userInfo?.avatar || '';
    userContact.contact_name = userInfo?.username || '';
    setUserContact(userContact);
  }, [
    coinList,
    selectedToken,
    setCoinInfo,
    setFromNetwork,
    setUserContact,
    setTokenType,
    currentWallet,
    userInfo,
  ]);

  const checkAddress = useCallback(async () => {
    const child = await usewallet.getActiveWallet();
    setChildType(child);

    //wallet controller api
    try {
      const address = withPrefix(toAddress);
      const validatedResult = await usewallet.checkAddress(address!);
      setValidated(validatedResult);
      return validatedResult;
    } catch (err) {
      setValidated(false);
    }
    setLoading(false);
  }, [setLoading, setValidated, toAddress, usewallet]);

  const updateCoinInfo = useCallback(() => {
    const coin = coinList.find(
      (coin) => coin.unit.toLowerCase() === selectedToken?.symbol.toLowerCase()
    );
    if (selectedToken?.symbol.toLowerCase() !== 'flow') {
      setTokenType('FT');
    } else {
      setTokenType('Flow');
    }

    if (coin) {
      setCoinInfo(coin);
    }
  }, [coinList, selectedToken, setTokenType, setCoinInfo]);

  useEffect(() => {
    checkAddress();
  }, [checkAddress]);

  useEffect(() => {
    setUserWallet();
  }, [childType, setUserWallet]);

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
              {validated !== null &&
                (validated ? (
                  <></>
                ) : (
                  <SlideRelative show={true} direction="up">
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
                  </SlideRelative>
                ))}
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
              onClick={history.goBack}
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
              // disabled={true}
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
                new BN(amount || '-1').isLessThanOrEqualTo(0)
              }
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="text.primary">
                {chrome.i18n.getMessage('Next')}
              </Typography>
            </Button>
          </Box>
          {validated && (
            <TransferConfirmation
              isConfirmationOpen={isConfirmationOpen}
              data={{
                contact: location.state.contact,
                amount: amount,
                secondAmount: secondAmount,
                userContact: senderContact,
                tokenSymbol: selectedToken?.symbol,
                coinInfo: coinInfo,
                childType,
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

export default SendToCadence;
