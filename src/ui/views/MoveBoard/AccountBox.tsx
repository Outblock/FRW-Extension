import { Typography, Box, CardMedia } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useCallback, useEffect, useState } from 'react';

import { storage } from '@/background/webapi';
import { ensureEvmAddressPrefix, formatString } from '@/shared/utils/address';
import { useProfileStore } from '@/ui/stores/useProfileStore';
import emoji from 'background/utils/emoji.json';
import accountMove from 'ui/FRWAssets/svg/accountMove.svg';
import { FRWProfileCard, FWMoveDropdown } from 'ui/FRWComponent';
import { useWallet, formatAddress } from 'ui/utils';

const USER_CONTACT = {
  contact_name: '',
  avatar: '',
};

function AccountBox({ isChild, setSelectedChildAccount, selectedAccount, isEvm = false }) {
  const usewallet = useWallet();
  const { mainAddress, evmAddress, childAccounts, currentWallet } = useProfileStore();
  const [first, setFirst] = useState<string>('');
  const [second, setSecond] = useState<string>('');
  const [userInfo, setUser] = useState<any>(USER_CONTACT);
  const [firstEmoji, setFirstEmoji] = useState<any>(null);
  const [childWallets, setChildWallets] = useState({});

  const requestAddress = useCallback(async () => {
    const address = await usewallet.getCurrentAddress();
    const eWallet = await usewallet.getEvmWallet();

    const newWallet = {
      [mainAddress!]: {
        name: currentWallet.name,
        description: currentWallet.name,
        thumbnail: {
          url: currentWallet.icon,
        },
      },
    };

    // Merge wallet lists
    const walletList = { ...newWallet, ...childAccounts };
    const firstWalletAddress = Object.keys(walletList)[0];
    const wallet = walletList[firstWalletAddress];
    setChildWallets(walletList);

    const userContact = {
      avatar: wallet.thumbnail.url,
      contact_name: wallet.name,
    };
    if (firstWalletAddress) {
      setSelectedChildAccount(walletList[firstWalletAddress]);
    }
    console.log('wallet is here ', eWallet);
    setUser(userContact);
    if (isEvm) {
      setFirst(evmAddress!);
      setFirstEmoji(eWallet);
    } else {
      setFirst(address!);
    }
    setSecond(mainAddress!);
  }, [
    isEvm,
    evmAddress,
    mainAddress,
    usewallet,
    setSelectedChildAccount,
    childAccounts,
    currentWallet,
  ]);

  useEffect(() => {
    requestAddress();
  }, [requestAddress]);

  return (
    <Box sx={{ padding: '0 18px' }}>
      <Typography sx={{ mb: '8px' }}>{chrome.i18n.getMessage('Account')}</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box
          sx={{
            padding: '16px 12px',
            height: '106px',
            flex: '1',
            backgroundColor: '#2C2C2C',
            borderRadius: '12px',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                height: '32px',
                width: '32px',
                borderRadius: '32px',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: firstEmoji ? firstEmoji['color'] : 'none',
                marginRight: '4px',
              }}
            >
              {firstEmoji ? (
                <Typography sx={{ fontSize: '12px', fontWeight: '400' }}>
                  {firstEmoji.icon}
                </Typography>
              ) : (
                <CardMedia
                  sx={{
                    margin: '0 auto',
                    width: '20px',
                    height: '20px',
                    borderRadius: '20px',
                    display: 'block',
                  }}
                  image={userInfo.avatar}
                />
              )}
            </Box>
          </Box>
          <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
            {firstEmoji ? firstEmoji.name : userInfo.contact_name}
          </Typography>
          <Typography sx={{ fontSize: '10px', fontWeight: '400' }}>
            {first && formatString(first)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mx: '8px' }}>
          <CardMedia sx={{ width: '24px', height: '24px' }} image={accountMove} />
        </Box>
        <Box
          sx={{
            padding: '16px 12px',
            height: '106px',
            flex: '1',
            backgroundColor: '#2C2C2C',
            borderRadius: '12px',
          }}
        >
          {selectedAccount && (
            <FWMoveDropdown
              contact={selectedAccount}
              contacts={childWallets}
              setSelectedChildAccount={setSelectedChildAccount}
            />
          )}
        </Box>
      </Box>
      <Box sx={{ padding: '8px 0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>Move Fee</Typography>
          <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>0.001 FLOW</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            sx={{ fontSize: '12px', fontWeight: '400', color: 'rgba(255, 255, 255, 0.60)' }}
          >
            It appears when moving between VM accounts
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default AccountBox;
