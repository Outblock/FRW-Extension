import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { Box, Typography, Drawer, Stack, Grid, CardMedia, IconButton, Button } from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import SlideRelative from '@/ui/FRWComponent/SlideRelative';
import StorageExceededAlert from '@/ui/FRWComponent/StorageExceededAlert';
import { WarningStorageLowSnackbar } from '@/ui/FRWComponent/WarningStorageLowSnackbar';
import { useStorageCheck } from '@/ui/utils/useStorageCheck';
import IconNext from 'ui/FRWAssets/svg/next.svg';
import { LLSpinner, LLProfile, FRWProfile, FRWTargetProfile } from 'ui/FRWComponent';
import { useWallet, isEmoji } from 'ui/utils';

interface TransferConfirmationProps {
  isConfirmationOpen: boolean;
  data: any;
  handleCloseIconClicked: () => void;
  handleCancelBtnClicked: () => void;
  handleAddBtnClicked: () => void;
}

const TransferConfirmation = (props: TransferConfirmationProps) => {
  const wallet = useWallet();
  const history = useHistory();
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);

  const [occupied, setOccupied] = useState(false);
  const [tid, setTid] = useState<string>('');
  const [count, setCount] = useState(0);

  const transferAmount = props?.data?.amount ? parseFloat(props.data.amount) : undefined;

  // This component is only used for sending Flow on the Flow network
  const movingBetweenEVMAndFlow = false;

  const { sufficient: isSufficient, sufficientAfterAction: isSufficientAfterAction } =
    useStorageCheck({
      transferAmount,
      coin: props.data?.coinInfo?.coin,
      movingBetweenEVMAndFlow,
    });

  const isLowStorage = isSufficient !== undefined && !isSufficient; // isSufficient is undefined when the storage check is not yet completed
  const isLowStorageAfterAction = isSufficientAfterAction !== undefined && !isSufficientAfterAction; // isSufficientAfterAction is undefined when the storage check is not yet completed
  const colorArray = [
    '#32E35529',
    '#32E35540',
    '#32E35559',
    '#32E35573',
    '#41CC5D',
    '#41CC5D',
    '#41CC5D',
  ];
  const startCount = useCallback(() => {
    let count = 0;
    let intervalId;
    if (props.data.contact.address) {
      intervalId = setInterval(function () {
        count++;
        if (count === 7) {
          count = 0;
        }
        setCount(count);
      }, 500);
    } else if (!props.data.contact.address) {
      clearInterval(intervalId);
    }
  }, [props.data.contact.address, setCount]);

  const getPending = useCallback(async () => {
    const pending = await wallet.getPendingTx();
    if (pending.length > 0) {
      setOccupied(true);
    }
  }, [wallet]);

  const updateOccupied = useCallback(() => {
    setOccupied(false);
  }, []);

  const transferToken = async () => {
    // TODO: Replace it with real data
    if (props.data.childType === 'evm') {
      withDrawEvm();
      return;
    } else if (props.data.childType) {
      sendFromChild();
      return;
    }
    setSending(true);
    const amount = parseFloat(props.data.amount).toFixed(8);
    wallet
      .transferInboxTokens(props.data.tokenSymbol, props.data.contact.address, amount)
      .then(async (txID) => {
        await wallet.setRecent(props.data.contact);
        console.log('send result ', txID, props.data);
        wallet.listenTransaction(
          txID,
          true,
          `${props.data.amount} ${props.data.coinInfo.coin} Sent`,
          `You have sent ${props.data.amount} ${props.data.tokenSymbol} to ${props.data.contact.contact_name}. \nClick to view this transaction.`,
          props.data.coinInfo.icon
        );
        props.handleCloseIconClicked();
        await wallet.setDashIndex(0);
        setSending(false);
        setTid(txID);
        history.push('/dashboard?activity=1');
      })
      .catch(() => {
        setSending(false);
        setFailed(true);
      });
  };

  const sendFromChild = async () => {
    const amount = parseFloat(props.data.amount).toFixed(8);
    wallet
      .sendFTfromChild(
        props.data.userContact.address,
        props.data.contact.address,
        'flowTokenProvider',
        amount,
        props.data.tokenSymbol
      )
      .then(async (txID) => {
        await wallet.setRecent(props.data.contact);
        wallet.listenTransaction(
          txID,
          true,
          `${props.data.amount} ${props.data.coinInfo.coin} Sent`,
          `You have sent ${props.data.amount} ${props.data.tokenSymbol} to ${props.data.contact.contact_name}. \nClick to view this transaction.`,
          props.data.coinInfo.icon
        );
        props.handleCloseIconClicked();
        await wallet.setDashIndex(0);
        setSending(false);
        setTid(txID);
        history.push('/dashboard?activity=1');
      })
      .catch((err) => {
        console.log('0xe8264050e6f51923 ', err);
        setSending(false);
        setFailed(true);
      });
  };

  const withDrawEvm = async () => {
    console.log('transferToken ->', props.data);
    setSending(true);
    if (props.data.tokenSymbol.toLowerCase() === 'flow') {
      transferFlow();
    } else {
      transferFt();
    }
  };

  const transferFlow = async () => {
    const amount = parseFloat(props.data.amount).toFixed(8);
    // const txID = await wallet.transferTokens(props.data.tokenSymbol, props.data.contact.address, amount);
    wallet
      .withdrawFlowEvm(amount, props.data.contact.address)
      .then(async (txID) => {
        await wallet.setRecent(props.data.contact);
        wallet.listenTransaction(
          txID,
          true,
          `${props.data.amount} ${props.data.coinInfo.coin} Sent`,
          `You have sent ${props.data.amount} ${props.data.tokenSymbol} to ${props.data.contact.contact_name}. \nClick to view this transaction.`,
          props.data.coinInfo.icon
        );
        props.handleCloseIconClicked();
        await wallet.setDashIndex(0);
        setSending(false);
        setTid(txID);
        history.push('/dashboard?activity=1');
      })
      .catch(() => {
        setSending(false);
        setFailed(true);
      });
  };

  const transferFt = async () => {
    const tokenResult = await wallet.openapi.getEvmTokenInfo(props.data.tokenSymbol);
    console.log('tokenResult ', tokenResult, props.data.amount);

    wallet
      .transferFTFromEvm(
        tokenResult!['flowIdentifier'],
        props.data.amount,
        props.data.contact.address,
        tokenResult
      )
      .then(async (txID) => {
        await wallet.setRecent(props.data.contact);
        wallet.listenTransaction(
          txID,
          true,
          `${props.data.amount} ${props.data.coinInfo.coin} Sent`,
          `You have sent ${props.data.amount} ${props.data.tokenSymbol} to ${props.data.contact.contact_name}. \nClick to view this transaction.`,
          props.data.coinInfo.icon
        );
        props.handleCloseIconClicked();
        await wallet.setDashIndex(0);
        setSending(false);
        setTid(txID);
        history.push('/dashboard?activity=1');
      })
      .catch(() => {
        setSending(false);
        setFailed(true);
      });
  };

  const transactionDoneHandler = useCallback(
    (request) => {
      if (request.msg === 'transactionDone') {
        updateOccupied();
      }
      if (request.msg === 'transactionError') {
        setFailed(true);
        setErrorMessage(request.errorMessage);
        setErrorCode(request.errorCode);
      }
      return true;
    },
    [updateOccupied]
  );

  useEffect(() => {
    startCount();
    getPending();
    chrome.runtime.onMessage.addListener(transactionDoneHandler);

    return () => {
      chrome.runtime.onMessage.removeListener(transactionDoneHandler);
    };
  }, [getPending, startCount, transactionDoneHandler]);

  const renderContent = () => (
    <Box
      px="18px"
      sx={{
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.5)',
        flexDirection: 'column',
        display: 'flex',
      }}
    >
      <Grid
        container
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Grid item xs={1}></Grid>
        <Grid item xs={10}>
          {tid ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h1" align="center" py="14px" fontSize="20px">
                {chrome.i18n.getMessage('Transaction_created')}
              </Typography>
            </Box>
          ) : (
            <Typography variant="h1" align="center" py="14px" fontWeight="bold" fontSize="20px">
              {!sending
                ? chrome.i18n.getMessage('Confirmation')
                : chrome.i18n.getMessage('Processing')}
            </Typography>
          )}
        </Grid>
        <Grid item xs={1}>
          <IconButton onClick={props.handleCloseIconClicked}>
            <CloseIcon fontSize="medium" sx={{ color: 'icon.navi', cursor: 'pointer' }} />
          </IconButton>
        </Grid>
      </Grid>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '16px' }}
      >
        {props.data.childType === 'evm' ? (
          <FRWProfile
            contact={props.data.userContact}
            isLoading={false}
            isEvm={true}
            fromEvm={'yes'}
          />
        ) : props.data.childType ? (
          <LLProfile contact={props.data.userContact} />
        ) : (
          <FRWProfile contact={props.data.userContact} fromEvm={'no'} />
        )}
        <Box
          sx={{
            marginLeft: '-15px',
            marginRight: '-15px',
            marginTop: '-32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {colorArray.map((color, index) => (
            <Box sx={{ mx: '5px' }} key={index}>
              {count === index ? (
                <CardMedia sx={{ width: '8px', height: '12px' }} image={IconNext} />
              ) : (
                <Box
                  key={index}
                  sx={{ height: '5px', width: '5px', borderRadius: '5px', backgroundColor: color }}
                />
              )}
            </Box>
          ))}
        </Box>
        {isEmoji(props.data.contact.avatar) ? (
          <FRWTargetProfile contact={props.data.contact} fromEvm={'to'} />
        ) : (
          <LLProfile contact={props.data.contact} />
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          px: '13px',
          py: '16px',
          backgroundColor: '#333333',
          borderRadius: '16px',
          my: '10px',
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
          <CardMedia sx={{ width: '24px', height: '24px' }} image={props.data.coinInfo.icon} />
          <Typography variant="body1" sx={{ fontSize: '18px', fontWeight: 'semi-bold' }}>
            {props.data.coinInfo.coin}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Typography
            variant="body1"
            sx={{ fontSize: '18px', fontWeight: '400', textAlign: 'end' }}
          >
            {props.data.amount} {props.data.coinInfo.unit}
          </Typography>
        </Stack>
        <Stack direction="column" spacing={1}>
          <Typography
            variant="body1"
            color="info"
            sx={{ fontSize: '14px', fontWeight: 'semi-bold', textAlign: 'end' }}
          >
            $ {props.data.secondAmount}
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ flexGrow: 1 }} />
      <SlideRelative direction="down" show={occupied}>
        <Box
          sx={{
            width: '95%',
            backgroundColor: 'error.light',
            mx: 'auto',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            py: '8px',
          }}
        >
          {/* <CardMedia style={{ color:'#E54040', width:'24px',height:'24px', margin: '0 12px 0' }} image={empty} />   */}
          <InfoIcon fontSize="medium" color="primary" style={{ margin: '0px 12px auto 12px' }} />
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '12px' }}>
            {chrome.i18n.getMessage('Your_address_is_currently_processing_another_transaction')}
          </Typography>
        </Box>
      </SlideRelative>
      <WarningStorageLowSnackbar
        isLowStorage={isLowStorage}
        isLowStorageAfterAction={isLowStorageAfterAction}
      />

      <Button
        onClick={transferToken}
        disabled={sending || occupied}
        variant="contained"
        color="success"
        size="large"
        sx={{
          height: '50px',
          width: '100%',
          borderRadius: '12px',
          textTransform: 'capitalize',
          display: 'flex',
          gap: '12px',
          marginBottom: '33px',
        }}
      >
        {sending ? (
          <>
            <LLSpinner size={28} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="text.primary">
              {chrome.i18n.getMessage('Sending')}
            </Typography>
          </>
        ) : (
          <>
            {failed ? (
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="text.primary">
                {chrome.i18n.getMessage('Transaction__failed')}
              </Typography>
            ) : (
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="text.primary">
                {chrome.i18n.getMessage('Send')}
              </Typography>
            )}
          </>
        )}
      </Button>
    </Box>
  );

  return (
    <>
      <Drawer
        anchor="bottom"
        open={props.isConfirmationOpen}
        transitionDuration={300}
        PaperProps={{
          sx: {
            width: '100%',
            height: '65%',
            bgcolor: 'background.paper',
            borderRadius: '18px 18px 0px 0px',
          },
        }}
      >
        {renderContent()}
      </Drawer>
      <StorageExceededAlert open={errorCode === 1103} onClose={() => setErrorCode(null)} />
    </>
  );
};

export default TransferConfirmation;
