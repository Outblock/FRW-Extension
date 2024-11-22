import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { ListItem, ListItemButton, ListItemIcon, Typography, Box } from '@mui/material';
import React, { useState, useEffect } from 'react';

import { useWallet } from 'ui/utils';

const WalletFunction = (props) => {
  const usewallet = useWallet();
  const [currentBalance, setCurrentBalance] = useState(null);

  const walletFlowBalance = async (address) => {
    const balance = await usewallet.getFlowBalance(address);
    if (balance) {
      return balance;
    } else {
      return 0;
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balance = await walletFlowBalance(props.address);
        setCurrentBalance(balance);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
  }, [props.address]);

  return (
    <ListItem
      onClick={() => {
        props.setWallets(props, null, props.props_id);
      }}
      sx={{ mb: 0, padding: '0', cursor: 'pointer' }}
    >
      <ListItemButton
        sx={{
          my: 0,
          display: 'flex',
          px: '16px',
          py: '4px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {props.icon && (
          <Box
            sx={{
              display: 'flex',
              height: '32px',
              width: '32px',
              borderRadius: '32px',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: props.color,
              marginRight: '12px',
            }}
          >
            <Typography sx={{ fontSize: '20px', fontWeight: '600' }}>{props.icon}</Typography>
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            background: 'none',
          }}
        >
          <Typography
            variant="body1"
            component="span"
            fontWeight={'semi-bold'}
            sx={{ fontSize: '12px' }}
            display="flex"
            color={props.props_id === props.currentWallet ? 'text.title' : 'text.nonselect'}
          >
            {props.name}
            {props.address === props.mainAddress && (
              <ListItemIcon style={{ display: 'flex', alignItems: 'center' }}>
                <FiberManualRecordIcon
                  style={{
                    fontSize: '10px',
                    color: props.address === props.current['address'] ? '#40C900' : '#40C90080',
                    marginLeft: '10px',
                  }}
                />
              </ListItemIcon>
            )}
          </Typography>
          <Typography
            variant="body1"
            component="span"
            color={'text.nonselect'}
            sx={{ fontSize: '12px', textTransform: 'uppercase' }}
          >
            {currentBalance !== null
              ? `${(Number(currentBalance) / 100000000).toFixed(3)} FLOW`
              : 'Loading...'}
          </Typography>
        </Box>
        <Box sx={{ flex: '1' }}></Box>
      </ListItemButton>
    </ListItem>
  );
};

export default WalletFunction;
