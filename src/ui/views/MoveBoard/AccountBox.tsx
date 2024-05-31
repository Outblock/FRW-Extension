import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useWallet } from 'ui/utils';
import {formatString} from 'ui/utils/address';
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
  const [userInfo, setUser] = useState<any>(null);

  const requestAddress = async () => {
    const userContact = {
      contact_name: '',
      avatar: '',
    }
    const info = await usewallet.getUserInfo(false);
    userContact.avatar = info.avatar;
    userContact.contact_name = info.username;
    setUser(userContact);

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


  useEffect(() => {
    requestAddress();
  }, [])

  return (
    <Box sx={{ padding: '0 18px' }}>
      <Typography>
        Account
      </Typography>

      < Box sx={{ display: 'flex', justifyContent: 'space-between' }}>

        <Box sx={{ padding: '8px 12px', height: '60px', flex:'1', backgroundColor: '#2C2C2C', borderRadius: '12px' }}>
          {userInfo &&
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <CardMedia sx={{ width: '20px', height: '20px', marginRight: '4px', }} image={userInfo.avatar} />
              <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                {userInfo.contact_name.split('_')[0]}
              </Typography>
            </Box>
          }
          <Typography sx={{ fontSize: '10px', fontWeight: '400' }}>
            {first}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mx: '8px' }}>
          <CardMedia sx={{ width: '24px', height: '24px',}} image={accountMove} />
        </Box>
        <Box sx={{ padding: '8px 12px', height: '60px', flex:'1',backgroundColor: '#2C2C2C', borderRadius: '12px' }}>
          {userInfo &&
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <CardMedia sx={{ width: '20px', height: '20px', marginRight: '4px', }} image={userInfo.avatar} />
              <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                {userInfo.contact_name.split('_')[0]}
              </Typography>
            </Box>
          }
          <Typography sx={{ fontSize: '10px', fontWeight: '400' }}>
            {second}
          </Typography>
        </Box>
      </Box>

    </Box>
  );
}

export default AccountBox; 