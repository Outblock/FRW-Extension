import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { Box, Typography, Drawer, Grid, CardMedia, IconButton, Button } from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import SlideRelative from '@/ui/FRWComponent/SlideRelative';
import StorageExceededAlert from '@/ui/FRWComponent/StorageExceededAlert';
import { WarningStorageLowSnackbar } from '@/ui/FRWComponent/WarningStorageLowSnackbar';
import { useStorageCheck } from '@/ui/utils/useStorageCheck';
import IconNext from 'ui/FRWAssets/svg/next.svg';
import { LLSpinner, LLSwap } from 'ui/FRWComponent';
import { useWallet } from 'ui/utils';

import Increment from '../../FRWAssets/svg/increment.svg';

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
  const { sufficient: isSufficient, sufficientAfterAction: isSufficientAfterAction } =
    useStorageCheck();

  const isLowStorage = isSufficient !== undefined && !isSufficient; // isSufficient is undefined when the storage check is not yet completed
  const isLowStorageAfterAction = isSufficientAfterAction !== undefined && !isSufficientAfterAction; // isSufficientAfterAction is undefined when the storage check is not yet completed

  const count = 0;
  const colorArray = [
    '#32E35529',
    '#32E35540',
    '#32E35559',
    '#32E35573',
    '#41CC5D',
    '#41CC5D',
    '#41CC5D',
  ];

  const getPending = useCallback(async () => {
    const pending = await wallet.getPendingTx();
    if (pending.length > 0) {
      setOccupied(true);
    }
  }, [wallet]);

  const updateOccupied = useCallback(() => {
    setOccupied(false);
  }, []);

  const execSwap = useCallback(() => {
    if (!props.data.estimateInfo) {
      return;
    }

    setSending(true);
    const resJson = props.data.estimateInfo;
    const deadline = new Date().getTime() / 1000.0 + 60 * 10;

    const slippageRate = 0.1;

    let tokenKeyFlatSplitPath: any[] = [];
    const amountInSplit: string[] = [];
    const amountOutSplit: string[] = [];
    for (let i = 0; i < resJson.routes.length; ++i) {
      const routeJson = resJson.routes[i];
      tokenKeyFlatSplitPath = tokenKeyFlatSplitPath.concat(routeJson.route);
      amountInSplit.push(parseFloat(routeJson.routeAmountIn).toFixed(8));
      amountOutSplit.push(parseFloat(routeJson.routeAmountOut).toFixed(8));
    }
    const estimateOut = resJson.tokenOutAmount;
    const amountOutMin = estimateOut * (1.0 - slippageRate);
    const storageIn = props.data.token0.storage_path;
    const storageOut = props.data.token1.storage_path;

    const estimateIn = resJson.tokenInAmount;
    const amountInMax = estimateIn / (1.0 - slippageRate);

    if (props.data.swapTypes) {
      wallet
        .swapSend(
          tokenKeyFlatSplitPath,
          amountInMax,
          storageIn.vault.split('/').pop(),
          amountOutSplit,
          storageOut.vault.split('/').pop(),
          storageOut.receiver.split('/').pop(),
          storageOut.balance.split('/').pop(),
          deadline
        )
        .then(async (txId) => {
          wallet.listenTransaction(
            txId,
            true,
            `${resJson.tokenInAmount} ${props.data.token0.symbol} swapped`,
            `You have swapped ${resJson.tokenInAmount} ${props.data.token0.symbol} to ${amountOutMin} ${props.data.token1.symbol}. \nClick to view this transaction.`
          );
          props.handleCloseIconClicked();
          await wallet.setDashIndex(0);
          setSending(false);
          setTid(txId);
          history.push(`/dashboard?activity=1&txId=${txId}`);
        })
        .catch(() => {
          setSending(false);
          setFailed(true);
        });
    } else {
      wallet
        .sendSwap(
          tokenKeyFlatSplitPath,
          amountInSplit,
          storageIn.vault.split('/').pop(),
          amountOutMin,
          storageOut.vault.split('/').pop(),
          storageOut.balance.split('/').pop(),
          storageOut.receiver.split('/').pop(),
          deadline
        )
        .then(async (txId) => {
          wallet.listenTransaction(
            txId,
            true,
            `${resJson.tokenInAmount} ${props.data.token0.symbol} swapped`,
            `You have swapped ${resJson.tokenInAmount} ${props.data.token0.symbol} to ${amountOutMin} ${props.data.token1.symbol}. \nClick to view this transaction.`
          );
          props.handleCloseIconClicked();
          await wallet.setDashIndex(0);
          setSending(false);
          setTid(txId);
          history.push(`/dashboard?activity=1&txId=${txId}`);
        })
        .catch(() => {
          setSending(false);
          setFailed(true);
        });
    }
  }, [history, props, wallet]);

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
    getPending();
    chrome.runtime.onMessage.addListener(transactionDoneHandler);

    return () => {
      chrome.runtime.onMessage.removeListener(transactionDoneHandler);
    };
  }, [getPending, transactionDoneHandler]);

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
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: '50px',
          py: '16px',
        }}
      >
        <LLSwap token={props.data.token0} amount={props.data.amount} />
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
              {count === index ? ( // Note: count is never set, so this is always false unless index is 0
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
        <LLSwap
          token={props.data.token1}
          amount={(Math.round(props.data.outamount * 1000) / 1000).toFixed(3)}
        />
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

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '16px',
          mb: '30px',
          mt: '10px',
          background: ' #333333',
          borderRadius: '16px',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            variant="body1"
            sx={{
              alignSelf: 'start',
              fontSize: '12px',
              color: '#BABABA',
            }}
          >
            Swap price
          </Typography>
          <Typography
            variant="body1"
            sx={{
              alignSelf: 'end',
              fontSize: '12px',
              color: '#00EF8B',
            }}
          >
            {props.data.estimateInfo
              ? `1 ${props.data.token0.symbol}  ≈ ${props.data.swapPrice} ${props.data.token1.symbol}`
              : '-'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            variant="body1"
            sx={{
              alignSelf: 'start',
              fontSize: '12px',
              color: '#BABABA',
            }}
          >
            Provider
          </Typography>
          <Typography
            variant="body1"
            sx={{
              alignSelf: 'end',
              fontSize: '12px',
              color: '#BABABA',
            }}
          >
            {props.data.estimateInfo ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={Increment}
                  style={{ height: '14px', width: '14px', marginRight: '4px' }}
                />
                Increment.fi
              </Box>
            ) : (
              '-'
            )}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            variant="body1"
            sx={{
              alignSelf: 'start',
              fontSize: '12px',
              color: '#BABABA',
            }}
          >
            Price Impact
          </Typography>
          <Typography
            variant="body1"
            sx={{
              alignSelf: 'end',
              fontSize: '12px',
              color: '#00EF8B',
            }}
          >
            {props.data.estimateInfo ? `-${props.data.estimateInfo.priceImpact * 100}%` : '-'}
          </Typography>
        </Box>
        {/* <Box sx={{display: 'flex', justifyContent:'space-between'}}>
          <Typography variant="body1"
            sx={{
              alignSelf: 'start',
              fontSize: '12px',
              color:'#BABABA'
            }}>
                Estimated Fees
          </Typography>
          <Typography variant="body1"
            sx={{
              alignSelf: 'end',
              fontSize: '12px',
              color:'#BABABA'
            }}>
            {props.data.estimateInfo ? props.data.estimateInfo.priceImpact : '-' }
          </Typography>
        </Box> */}
      </Box>
      <WarningStorageLowSnackbar
        isLowStorage={isLowStorage}
        isLowStorageAfterAction={isLowStorageAfterAction}
      />

      <Button
        onClick={execSwap}
        disabled={sending || occupied}
        variant="contained"
        color="primary"
        size="large"
        sx={{
          height: '50px',
          width: '100%',
          borderRadius: '12px',
          textTransform: 'capitalize',
          display: 'flex',
          gap: '12px',
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
      <Box sx={{ height: '20px' }}></Box>
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
            height: 'auto',
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
