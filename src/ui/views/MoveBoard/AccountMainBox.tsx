import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useWallet } from 'ui/utils';
import { formatString } from 'ui/utils/address';
import {
  Typography,
  Box,
  CardMedia
} from '@mui/material';
import { FRWProfileCard, FWDropDownProfile } from 'ui/FRWComponent';
import accountMove from 'ui/FRWAssets/svg/accountMove.svg';
import emoji from 'background/utils/emoji.json';
import { storage } from '@/background/webapi';


function AccountMainBox({ isChild,setSelectedChildAccount, selectedAccount  }) {
  const usewallet = useWallet();
  const userContact = {
    contact_name: '',
    avatar: '',
  }

  const [first, setFirst] = useState<string>('');
  const [second, setSecond] = useState<string>('');
  const [userInfo, setUser] = useState<any>(userContact);
  const [firstEmoji, setFirstEmoji] = useState<any>(null);
  const [secondEmoji, setSecondEmoji] = useState<any>(null);
  const [childWallets, setChildWallets] = useState({});

  const requestAddress = async () => {

    const parentAddress = await usewallet.getMainAddress();
    const address = await usewallet.getCurrentAddress();
    const childResp = await usewallet.checkUserChildAccount();

    setChildWallets(childResp);
    const emojires = await usewallet.getEmoji();

    if (isChild) {
      const wallet = childResp[address!];
      console.log('checkUserChildAccount ', childResp)

      userContact.avatar = wallet.thumbnail.url;
      userContact.contact_name = wallet.name;
      setUser(userContact);
      setFirst(address!)
      setSecond(parentAddress!)
      setSecondEmoji(emojires[0])
    } else {
      const firstWalletAddress = Object.keys(childResp)[0];
      if (firstWalletAddress) {
        setSelectedChildAccount(childResp[firstWalletAddress]);
      }
      setFirst(parentAddress!)
      setSecond(address!)
      setFirstEmoji(emojires[0])
      setSecondEmoji(emojires[1])
    }
  }


  useEffect(() => {
    requestAddress();
  }, [])

  return (
    <Box sx={{ padding: '0 18px' }}>
      <Typography sx={{ mb: '8px' }}>
        {chrome.i18n.getMessage('Account')}
      </Typography>

      < Box sx={{ display: 'flex', justifyContent: 'space-between' }}>

        <Box sx={{ padding: '8px 12px', height: '60px', flex: '1', backgroundColor: '#2C2C2C', borderRadius: '12px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <Box sx={{
              display: 'flex', height: '20px', width: '20px', borderRadius: '20px', justifyContent: 'center', alignItems: 'center', backgroundColor: firstEmoji ? firstEmoji['bgcolor'] : 'none', marginRight: '4px'
            }}>
              {firstEmoji ?
                <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                  {firstEmoji.emoji}
                </Typography>
                :
                <CardMedia sx={{ margin: '0 auto', width: '20px', height: '20px', borderRadius: '20px', display: 'block' }} image={userInfo.avatar} />
              }
            </Box>
            <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
              {firstEmoji ? firstEmoji.name : userInfo.contact_name}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '10px', fontWeight: '400' }}>
            {first}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mx: '8px' }}>
          <CardMedia sx={{ width: '24px', height: '24px', }} image={accountMove} />
        </Box>
        <Box sx={{ padding: '8px 12px', height: '60px', flex: '1', backgroundColor: '#2C2C2C', borderRadius: '12px' }}>
          {isChild ? (
            <>
              {secondEmoji && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <Box sx={{
                    display: 'flex', height: '20px', width: '20px', borderRadius: '20px', justifyContent: 'center', alignItems: 'center', backgroundColor: secondEmoji['bgcolor'], marginRight: '4px'
                  }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                      {secondEmoji.emoji}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                    {secondEmoji.name}
                  </Typography>
                </Box>
              )}
              <Typography sx={{ fontSize: '10px', fontWeight: '400' }}>
                {second}
              </Typography>
            </>
          ) : (
            selectedAccount && (
              <FWDropDownProfile
                contact={selectedAccount}
                contacts={childWallets}
                setSelectedChildAccount={setSelectedChildAccount}
              />
            )
          )}
        </Box>
      </Box>

    </Box>
  );
}

export default AccountMainBox; 