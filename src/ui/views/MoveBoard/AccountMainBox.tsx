import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useWallet, formatAddress} from 'ui/utils';
import { ensureEvmAddressPrefix } from 'ui/utils/address';
import {
  Typography,
  Box,
  CardMedia
} from '@mui/material';
import { FRWProfileCard, FWDropDownProfile } from 'ui/FRWComponent';
import accountMove from 'ui/FRWAssets/svg/accountMove.svg';
import emoji from 'background/utils/emoji.json';
import { storage } from '@/background/webapi';


function AccountMainBox({ isChild, setSelectedChildAccount, selectedAccount }) {
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
    const emojires = await usewallet.getEmoji();
    const evmWallet = await usewallet.getEvmWallet();
    let evmAddress
    if (evmWallet.address) {
      evmAddress = ensureEvmAddressPrefix(evmWallet.address)
    }

    if (isChild) {
      const newWallet = {
        [parentAddress!]: {
          "name": emojires[0].name,
          "description": emojires[0].name,
          "thumbnail": {
            "url": emojires[0].emoji
          }
        }
      };

      let evmWallet = {};
      if (evmAddress) {
        evmWallet = {
          [evmAddress!]: {
            "name": emojires[1].name,
            "description": emojires[1].name,
            "thumbnail": {
              "url": emojires[1].emoji
            }
          }
        };
      }

      // Merge wallet lists
      const walletList = { ...childResp, ...newWallet, ...evmWallet };
      delete walletList[address!];
      const firstWalletAddress = Object.keys(walletList)[0]; 
      const wallet = walletList[firstWalletAddress];  
      setChildWallets(walletList);

      userContact.avatar = wallet.thumbnail.url;
      userContact.contact_name = wallet.name;
      if (firstWalletAddress) {
        setSelectedChildAccount(childResp[firstWalletAddress]);
      }
      setUser(userContact);
      setFirst(address!)
      setSecond(parentAddress!)
      setSecondEmoji(emojires[0])
    } else {

      let evmWallet = {};
      if (evmAddress) {
        evmWallet = {
          [evmAddress!]: {
            "name": emojires[1].name,
            "description": emojires[1].name,
            "thumbnail": {
              "url": emojires[1].emoji
            }
          }
        };
      }
      const walletList = { ...childResp, ...evmWallet };
      setChildWallets(walletList);
      const firstWalletAddress = Object.keys(walletList)[0];
      if (firstWalletAddress) {
        setSelectedChildAccount(walletList[firstWalletAddress]);
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
                <Typography sx={{ fontSize: '12px', fontWeight: '400' }}>
                  {firstEmoji.emoji}
                </Typography>
                :
                <CardMedia sx={{ margin: '0 auto', width: '20px', height: '20px', borderRadius: '20px', display: 'block' }} image={userInfo.avatar} />
              }
            </Box>
            <Typography sx={{ fontSize: '12px', fontWeight: '400' }}>
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
            selectedAccount && (
              <FWDropDownProfile
                contact={selectedAccount}
                contacts={childWallets}
                setSelectedChildAccount={setSelectedChildAccount}
              />
            )
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