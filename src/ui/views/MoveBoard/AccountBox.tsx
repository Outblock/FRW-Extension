import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useWallet } from 'ui/utils';
import {
  Typography,
  Box,
  CardMedia
} from '@mui/material';
import accountMove from 'ui/FRWAssets/svg/accountMove.svg';


function AccountBox({ isEvm }) {
  const usewallet = useWallet();

  const [first, setFirst] = useState<string>('');
  const [second, setSecond] = useState<string>('');

  const requestAddress = async () => {
    let evmAddress = await usewallet.getEvmAddress();
    evmAddress = formatString(evmAddress);
    const address = await usewallet.getCurrentAddress();
    if (isEvm) {
      setFirst(evmAddress)
      setSecond(address!)
    } else {
      setFirst(address!)
      setSecond(evmAddress)

    }
  }
  function formatString(str: string): string {
    if (!str || str.length < 16) return str; // Check if string is too short
    return `0x${str.substring(0, 6)}...${str.substring(str.length - 6)}`;
  }

  useEffect(() => {
    requestAddress();
  }, [])

  return (
    <Box sx={{ padding: '0 18px' }}>
      <Typography>
        Account
      </Typography>

      < Box sx={{ display: 'flex', justifyContent: 'space-between' }}>

        <Box sx={{padding:'8px 12px',height:'60px',backgroundColor:'#2C2C2C',borderRadius:'12px'}}>

          <Typography sx={{ fontSize: '10px', fontWeight: '400' }}>
            {first}
          </Typography>
        </Box>
        <Box>
          <CardMedia sx={{ width: '24px', height: '24px', mx: '8px', }} image={accountMove} />
        </Box>
        <Box sx={{padding:'8px 12px',height:'60px',backgroundColor:'#2C2C2C',borderRadius:'12px'}}>
          <Typography sx={{ fontSize: '10px', fontWeight: '400' }}>
            {second}
          </Typography>
        </Box>
      </Box>

    </Box>
  );
}

export default AccountBox; 