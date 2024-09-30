import React, { useEffect, useState } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import {
  Typography,
  List,
  ListItemText,
  ListItemIcon,
  ListItem,
  ListItemButton,
  Divider,
  CardMedia,
  Box
} from '@mui/material';
import { isValidEthereumAddress } from 'ui/utils/address';
import { storage } from 'background/webapi';
import IconEnd from '../../../../components/iconfont/IconAVector11Stroke';
import { LLHeader } from '@/ui/FRWComponent';
import { useWallet } from '@/ui/utils';
import { formatAddress } from 'ui/utils';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const tempEmoji = [
  {
    "emoji": "🥥",
    "name": "Coconut",
    "bgcolor": "#FFE4C4"
  },
  {
    "emoji": "🥑",
    "name": "Avocado",
    "bgcolor": "#98FB98"
  }
];

const Wallet = () => {
  const { url } = useRouteMatch();
  const usewallet = useWallet();
  const [isLoading, setLoading] = useState(true);
  const [userWallet, setWallet] = useState<any>([]);
  const [evmList, setEvmList] = useState<any>([]);
  const [currentAddress, setCurrentWallet] = useState('');
  const [emojis, setEmojis] = useState<any>(tempEmoji);


  function handleWalletClick(wallet, eindex) {
    const selectedEmoji = emojis[eindex]
    const walletDetailInfo = { wallet, selectedEmoji }
    storage.set('walletDetail', JSON.stringify(walletDetailInfo));
  }



  const setUserWallet = async () => {
    await usewallet.setDashIndex(3);
    const emojires = await usewallet.getEmoji();
    const wallet = await usewallet.getUserWallets();
    const fectechdWallet = await fetchBalances(wallet);
    const cwallet = await usewallet.getCurrentWallet();
    setCurrentWallet(cwallet.address)
    const evmWallet = await usewallet.getEvmWallet();
    const filteredEvm = [evmWallet].filter(
      evm => evm.address

    );
    if (filteredEvm.length > 0) {
      const fetchedEvm = await fetchEvmBalances(transformData(filteredEvm));
      setEvmList(fetchedEvm)
    }
    setEmojis(emojires);
    setWallet(fectechdWallet);
  };

  const transformData = (data) => {
    return data.map((item, index) => ({
      id: item.id,
      name: item.name,
      chain_id: item.chain_id,
      icon: item.icon,
      color: item.color,
      blockchain: [
        {
          id: index + 1,
          name: item.name,
          chain_id: item.chain_id,
          address: item.address,
          coins: item.coins,
        }
      ]
    }));
  };

  const fetchBalances = async (wallet) => {
    const updatedData = await Promise.all(wallet.map(async (item) => {
      const blockchainData = await Promise.all(item.blockchain.map(async (bc) => {
        const balance = await usewallet.getFlowBalance(bc.address);
        return { ...bc, balance };
      }));
      return { ...item, blockchain: blockchainData };
    }));
    return updatedData;
  };

  const fetchEvmBalances = async (wallet) => {
    const updatedData = await Promise.all(wallet.map(async (item) => {
      const blockchainData = await Promise.all(item.blockchain.map(async (bc) => {
        let balance = ''
        if (isValidEthereumAddress(bc.address)) {
          balance = await usewallet.getBalance(bc.address);
        }
        return { ...bc, balance };
      }));
      return { ...item, blockchain: blockchainData };
    }));
    return updatedData;
  };


  useEffect(() => {
    setUserWallet();
  }, []);

  return (
    <div className="page">

      <LLHeader title={chrome.i18n.getMessage('Acc__list')} help={false} />
      <Box sx={{ justifyContent: 'center', alignItems: 'center', width: '100%', px: '18px', }}>

        <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#787878', margin: '20px 0 8px' }}>
          {chrome.i18n.getMessage('main_wallet')}
        </Typography>
        <List
          sx={{
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: '#292929',
            margin: '8px auto 16px auto',
            pt: 0,
            pb: 0,
          }}
        >
          {userWallet.map(item => (
            <ListItem
              key={item.address}
              component={Link}
              to='/dashboard/setting/wallet/detail'
              onClick={() => handleWalletClick(item, 0)}
              disablePadding
              sx={{
                height: '72px',
                width: '100%',
                overflow: 'hidden',
              }}
            >
              <ListItemButton
                sx={{
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  margin: '0 auto',
                  padding: '16px 20px',
                  '&:hover': {
                    backgroundColor: '#262626'
                  },
                }}
              >


                <Box sx={{
                  display: 'flex', height: '32px', width: '32px', borderRadius: '32px', alignItems: 'center', justifyContent: 'center', backgroundColor: item.color, marginRight: '12px'
                }}>
                  <Typography sx={{ fontSize: '20px', fontWeight: '600' }}>
                    {item.icon}
                  </Typography>
                </Box>
                <Box key={item.blockchain[0].address} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '##FFFFFF', fontSize: '14px', fontWeight: '600', marginRight: '4px' }}>{item.name}</Typography>
                    <Typography sx={{ color: '#808080', fontSize: '12px', fontWeight: '400' }}>{`(${item.blockchain[0].address})`}</Typography>
                    {item.blockchain[0].address == currentAddress && (
                      <ListItemIcon
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <FiberManualRecordIcon
                          style={{
                            fontSize: '10px',
                            color: '#40C900',
                            marginLeft: '10px',
                          }}
                        />
                      </ListItemIcon>
                    )}
                  </Box>
                  <Typography sx={{ color: '#808080', fontSize: '12px', fontWeight: '400' }}>{(item.blockchain[0].balance / 100000000).toFixed(3)} Flow</Typography>
                </Box>
                <Box sx={{ flex: "1" }}></Box>
                <IconEnd size={12} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {evmList.length > 0 &&
          <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#787878', margin: '20px 0 8px' }}>
            {chrome.i18n.getMessage('multi_vm')}
          </Typography>
        }

        <List
          sx={{
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: '#292929',
            margin: '8px auto 16px auto',
            pt: 0,
            pb: 0,
          }}
        >
          {evmList.map(item => (
            <ListItem
              key={item.address}
              component={Link}
              to='/dashboard/setting/wallet/detail'
              onClick={() => handleWalletClick(item, 1)}
              disablePadding
              sx={{
                height: '72px',
                width: '100%',
                overflow: 'hidden',
              }}
            >
              <ListItemButton
                sx={{
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  margin: '0 auto',
                  padding: '16px 20px'
                }}
              >


                <Box sx={{
                  display: 'flex', height: '32px', width: '32px', borderRadius: '32px', alignItems: 'center', justifyContent: 'center', backgroundColor: item.color, marginRight: '12px'
                }}>
                  <Typography sx={{ fontSize: '20px', fontWeight: '600' }}>
                    {item.icon}
                  </Typography>
                </Box>
                <Box key={item.blockchain[0].address} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '##FFFFFF', fontSize: '14px', fontWeight: '600', marginRight: '4px' }}>{item.blockchain[0].name}</Typography>
                    <Typography sx={{ color: '#808080', fontSize: '12px', fontWeight: '400' }}>{`(${formatAddress(item.blockchain[0].address)})`}</Typography>
                    <Typography
                      variant="body1"
                      component="span"
                      color="#FFF"
                      fontSize={'9px'}
                      sx={{
                        backgroundColor: '#627EEA',
                        padding: '0 8px',
                        borderRadius: '18px',
                        textAlign: 'center',
                        marginLeft: '8px',
                        lineHeight: '16px',
                        height: '16px'
                      }}
                    >
                      EVM
                    </Typography>
                  </Box>
                  <Typography sx={{ color: '#808080', fontSize: '12px', fontWeight: '400' }}>{(parseFloat(item.blockchain[0].balance) / 1e18).toFixed(3)} Flow</Typography>
                </Box>
                <Box sx={{ flex: "1" }}></Box>
                <IconEnd size={12} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </div >
  );
};

export default Wallet;
