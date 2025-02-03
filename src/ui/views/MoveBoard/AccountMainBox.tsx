import { Typography, Box, CardMedia } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useCallback, useEffect, useState } from 'react';

import { ensureEvmAddressPrefix } from '@/shared/utils/address';
import { useProfileStore } from '@/ui/stores/useProfileStore';
import accountMove from 'ui/FRWAssets/svg/accountMove.svg';
import { FWMoveDropdown } from 'ui/FRWComponent';
import { useWallet } from 'ui/utils';

const USER_CONTACT = {
  contact_name: '',
  avatar: '',
};

function AccountMainBox({ isChild, setSelectedChildAccount, selectedAccount, isEvm = false }) {
  const usewallet = useWallet();
  const { mainAddress, evmAddress, childAccounts, currentWallet } = useProfileStore();
  const [first, setFirst] = useState<string>('');
  const [userInfo, setUser] = useState<any>(USER_CONTACT);
  const [firstEmoji, setFirstEmoji] = useState<any>(null);
  const [childWallets, setChildWallets] = useState({});

  const requestAddress = useCallback(async () => {
    const address = await usewallet.getCurrentAddress();
    const eWallet = await usewallet.getEvmWallet();

    if (isChild) {
      const newWallet = {
        [mainAddress!]: {
          name: currentWallet.name,
          description: currentWallet.name,
          thumbnail: {
            url: currentWallet.icon,
          },
        },
      };

      let evmWallet = {};
      if (evmAddress) {
        evmWallet = {
          [evmAddress!]: {
            name: eWallet.name,
            description: eWallet.name,
            thumbnail: {
              url: eWallet.icon,
            },
          },
        };
      }

      // Merge wallet lists
      const walletList = { ...childAccounts, ...newWallet, ...evmWallet };
      delete walletList[address!];
      const firstWalletAddress = Object.keys(walletList)[0];
      const wallet = childAccounts[address!];
      setChildWallets(walletList);

      const userContact = {
        avatar: wallet.thumbnail.url,
        contact_name: wallet.name,
      };
      if (firstWalletAddress) {
        setSelectedChildAccount(walletList[firstWalletAddress]);
      }
      setUser(userContact);
      setFirst(address!);
    } else {
      let evmWallet = {};
      if (evmAddress) {
        evmWallet = {
          [evmAddress!]: {
            name: eWallet.name,
            description: eWallet.name,
            thumbnail: {
              url: eWallet.icon,
            },
          },
        };
      }
      const walletList = { ...childAccounts, ...evmWallet };
      setChildWallets(walletList);
      const firstWalletAddress = Object.keys(walletList)[0];
      if (firstWalletAddress) {
        setSelectedChildAccount(walletList[firstWalletAddress]);
      }
      setFirst(mainAddress!);
      setFirstEmoji(currentWallet);
    }
  }, [
    usewallet,
    isChild,
    setSelectedChildAccount,
    mainAddress,
    evmAddress,
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
                backgroundColor: firstEmoji ? firstEmoji['bgcolor'] : 'none',
                marginRight: '4px',
              }}
            >
              {firstEmoji ? (
                <Typography sx={{ fontSize: '32px', fontWeight: '400' }}>
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
          <Typography sx={{ fontSize: '12px', fontWeight: '400' }}>{first}</Typography>
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

export default AccountMainBox;
