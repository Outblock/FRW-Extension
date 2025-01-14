import CloseIcon from '@mui/icons-material/Close';
import { Box, Typography, Drawer, IconButton, Button } from '@mui/material';
import BN from 'bignumber.js';
import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import StorageExceededAlert from '@/ui/FRWComponent/StorageExceededAlert';
import { WarningStorageLowSnackbar } from '@/ui/FRWComponent/WarningStorageLowSnackbar';
import { useStorageCheck } from '@/ui/utils/useStorageCheck';
import { notification } from 'background/webapi';
import { LLSpinner } from 'ui/FRWComponent';
import { useWallet } from 'ui/utils';

interface TransferConfirmationProps {
  isConfirmationOpen: boolean;
  data: any;
  handleCloseIconClicked: () => void;
  handleCancelBtnClicked: () => void;
  handleAddBtnClicked: () => void;
}

const StakeConfirm = (props: TransferConfirmationProps) => {
  const wallet = useWallet();
  const history = useHistory();
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);

  const [occupied, setOccupied] = useState(false);
  const { sufficient: isSufficient } = useStorageCheck();

  const isLowStorage = isSufficient !== undefined && !isSufficient; // isSufficient is undefined when the storage check is not yet completed

  const getPending = useCallback(async () => {
    const pending = await wallet.getPendingTx();
    if (pending.length > 0) {
      setOccupied(true);
    }
  }, [wallet]);

  const updateOccupied = useCallback(() => {
    setOccupied(false);
  }, []);

  const createStake = useCallback(() => {
    const MIN_STAKE_AMOUNT = new BN(50);
    if (new BN(props.data.amount).isLessThan(MIN_STAKE_AMOUNT)) {
      notification.create('/', 'Not enough Flow', 'A minimum of 50 Flow is required for staking');
      return;
    }

    const amount = new BN(props.data.amount).toFixed(8, BN.ROUND_DOWN);
    wallet
      .createStake(amount, props.data.nodeid, props.data.delegateid)
      .then(async (txID) => {
        wallet.listenTransaction(
          txID,
          true,
          `${props.data.amount} have sent to the node`,
          `You have sent ${props.data.amount} Flow to node id: ${props.data.nodeid}. \nClick to view this transaction.`,
          props.data.coinInfo.icon
        );
        props.handleCloseIconClicked();
        await wallet.setDashIndex(0);
        setSending(false);
        history.push('/dashboard?activity=1');
      })
      .catch(() => {
        setSending(false);
        setFailed(true);
      });
  }, [history, props, wallet]);

  const createDelegate = () => {
    if (props.data.amount < 50) {
      notification.create('/', 'Not enough Flow', 'A minimum of 50 Flow is required for staking');
      return;
    }

    const amount = parseFloat(props.data.amount).toFixed(8);
    wallet
      .createDelegator(amount, props.data.nodeid)
      .then(async (txID) => {
        wallet.listenTransaction(
          txID,
          true,
          `${props.data.amount} have sent to the node`,
          `You have sent ${props.data.amount} Flow to node id: ${props.data.nodeid}. \nClick to view this transaction.`,
          props.data.coinInfo.icon
        );
        props.handleCloseIconClicked();
        await wallet.setDashIndex(0);
        setSending(false);
        history.push('/dashboard?activity=1');
      })
      .catch(() => {
        setSending(false);
        setFailed(true);
      });
  };

  const startStake = () => {
    setSending(true);
    if (props.data.delegateid === 'null') {
      createDelegate();
    } else {
      createStake();
    }
  };

  const transactionDoneHandler = useCallback(
    (request) => {
      if (request.msg === 'transactionDone') {
        updateOccupied();
      }
      // Handle error
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
    // startCount();
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box
          sx={{
            width: '100%',
            height: '60px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 18px',
          }}
        >
          <Box sx={{ width: '28px' }}></Box>
          <Typography
            display="inline"
            sx={{
              fontWeight: '700',
              fontSize: '14PX',
              color: '#E6E6E6',
            }}
            variant="body2"
          >
            Check & Confirm your Stake
          </Typography>
          <Box>
            <IconButton onClick={props.handleCloseIconClicked}>
              <CloseIcon sx={{ color: '#E6E6E6', cursor: 'pointer', fontSize: '12px' }} />
            </IconButton>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'left',
          padding: '18px 18px 0',
          borderRadius: '12PX',
          backgroundColor: '#121212',
        }}
      >
        <Box sx={{ display: 'flex' }}>
          <img
            src="https://raw.githubusercontent.com/Outblock/Assets/main/ft/flow/logo.png"
            style={{
              height: '20px',
              width: '20px',
              marginRight: '8px',
              backgroundColor: '#282828',
              borderRadius: '18px',
            }}
          />

          <Typography
            display="inline"
            sx={{
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#fff',
            }}
            variant="body2"
          >
            Stake FLOW
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ paddingTop: '4px' }}>
            <Typography
              display="inline"
              sx={{
                marginLeft: '4px',
                fontWeight: 'normal',
                fontSize: '32px',
                color: '#FFFFFF',
              }}
              variant="body2"
            >
              {props.data.amount}
            </Typography>
            <Typography
              display="inline"
              sx={{
                marginLeft: '4px',
                fontWeight: 'normal',
                fontSize: '14px',
                color: '#5E5E5E',
              }}
              variant="body2"
            >
              FLOW
            </Typography>
          </Box>
          <Box sx={{ lineHeight: '67px ' }}>
            <Typography
              display="inline"
              sx={{
                marginLeft: '4px',
                fontWeight: 'normal',
                fontSize: '12px',
                color: '#5E5E5E',
              }}
              variant="body2"
            >
              ${' '}
              {parseFloat(
                (props.data.coinInfo.price * (Number(props.data.amount) * props.data.apr)).toFixed(
                  2
                )
              ).toLocaleString('en-US')}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '18px',
          borderRadius: '12PX',
          marginTop: '16px',
          backgroundColor: '#121212',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            variant="body1"
            sx={{
              alignSelf: 'start',
              fontSize: '14px',
              color: '#e6e6e6',
            }}
          >
            Rate
          </Typography>
          <Typography
            variant="body1"
            sx={{
              alignSelf: 'end',
              fontSize: '14px',
              fontWeight: '700',
              color: '#60C293',
            }}
          >
            {props.data.apr * 100}%
          </Typography>
        </Box>
        <Box
          sx={{ width: '100%', backgroundColor: '#333333', height: '1px', margin: '8px 0' }}
        ></Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            variant="body1"
            sx={{
              alignSelf: 'start',
              fontSize: '14px',
              color: '#e6e6e6',
            }}
          >
            Est. annual reward
          </Typography>
          <Box>
            <Typography
              variant="body1"
              sx={{
                textAlign: 'right',
                fontSize: '14px',
                color: '#e6e6e6',
              }}
            >
              {(Number(props.data.amount) * props.data.apr).toFixed(8)} flow
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '12px',
                color: '#e6e6e6',
                display: 'inline',
                textAlign: 'right',
                float: 'right',
              }}
            >
              ≈ $
              {parseFloat(
                (props.data.coinInfo.price * (Number(props.data.amount) * props.data.apr)).toFixed(
                  2
                )
              ).toLocaleString('en-US')}
              <Typography
                sx={{ color: '#5E5E5E', display: 'inline', textAlign: 'right', fontSize: '12px' }}
              >
                {' '}
                USD
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Box>
      <WarningStorageLowSnackbar isLowStorage={isLowStorage} />
      <Button
        onClick={startStake}
        disabled={sending || occupied}
        variant="contained"
        size="large"
        sx={{
          backgroundColor: '#60C293',
          height: '50px',
          marginTop: '38px',
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
                Confirm
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
            height: '77%',
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

export default StakeConfirm;
