import React, { useState, useEffect } from 'react';
import { Box, ListItemButton, Typography, ListItem, ListItemIcon, CardMedia } from '@mui/material';
import { useWallet } from 'ui/utils';
import mainnetIndicator from '../../../FRWAssets/svg/mainnetArrow.svg';
import testnetIndicator from '../../../FRWAssets/svg/testnetArrow.svg';
import previewnetIndicator from '../../../FRWAssets/svg/previewnetArrow.svg';
import testnetMigrationArrow from '../../../FRWAssets/svg/testnetMigrationArrow.svg';
import networkLink from '../../../FRWAssets/svg/networkLink.svg';


const NetworkList = ({ networkColor, currentNetwork }) => {


  const usewallet = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const [sandboxEnable, setSandboxEnabled] = useState(false);

  const [isMigrationEnabled, setMigrationEnabled] = useState(false);
  const [indicatorRotation, setIndicatorRotation] = useState(180); // Initial rotation angle

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const checkPreviewnet = async () => {

    const previewnet = await usewallet.checkPreviewnet() || [];
    if (previewnet.length > 0) {
      setSandboxEnabled(true);
    }


    const migration = await usewallet.checkTestnetMigration() || [];
    if (migration.length > 0) {
      setMigrationEnabled(true);
    }

  }




  useEffect(() => {
    checkPreviewnet();
  }, [currentNetwork]);

  const rotateIndicator = () => {
    setIndicatorRotation(indicatorRotation === 180 ? 0 : 180); // Toggle rotation angle
  };

  const switchNetwork = async (network: string) => {
    // if (network === 'crescendo' && !isSandboxEnabled) {
    //   return;
    // }

    usewallet.switchNetwork(network);

    if (currentNetwork !== network) {
      // TODO: replace it with better UX
      window.location.reload();
    }
  };

  const getIndicatorImage = () => {
    switch (currentNetwork) {
      case 'mainnet':
        return mainnetIndicator;
      case 'testnet':
        return testnetIndicator;
      case 'previewnet':
        return previewnetIndicator;
      case 'testnetMigration':
        return testnetMigrationArrow;
      default:
        return previewnetIndicator; // Default to mainnet if no match
    }
  };


  const bgColor = (network: string) => {
    switch (network) {
      case 'mainnet':
        return '#41CC5D14';
      case 'testnet':
        return '#FF8A0014';
      case 'crescendo':
        return '#CCAF2114';
      case 'previewnet':
        return '#CCAF2114';
      case 'testnetMigration':
        return '#22BAD014';
    }
  };
  return (
    <ListItem
      disablePadding
      sx={{ display: 'flex', justifyContent: 'space-between' }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '8px 16px',
          margin: '0',
          borderRadius: '0',
          flex: '1'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <ListItemIcon
            sx={{
              width: '24px',
              minWidth: '16px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}
          >
            <CardMedia component="img" sx={{ width: '16px', height: '16px' }} image={networkLink} />
          </ListItemIcon>
          <Typography
            variant="body1"
            component="div"
            display="inline"
            color='text'
            sx={{ fontSize: '12px' }}
          >
            {chrome.i18n.getMessage('Network')}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ flex: '1' }}></Box>
      <ListItemButton
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative',
          alignItems: 'center',
          padding: '4px 12px',
          borderRadius: '24px',
          cursor: 'pointer',
          height: '24px',
          maxWidth: 'auto',
          backgroundColor: bgColor(currentNetwork),
          marginRight: '16px'
        }}
        onClick={() => {
          rotateIndicator();
          toggleDropdown();
        }}
      >
        <Typography
          sx={{
            fontSize: '12px',
            marginRight: '12px',
            lineHeight: '24px',
            fontWeight: '400',
            color: networkColor(currentNetwork),
            textTransform: 'capitalize'
          }}
        >
          {currentNetwork}
        </Typography>
        <CardMedia
          component="img"
          sx={{
            width: '16px',
            height: '16px',
            transform: `rotate(${indicatorRotation}deg)`
          }}
          image={getIndicatorImage()}
        />
        {showDropdown &&
          <ListItem disablePadding sx={{
            position: 'absolute', width: 'auto', height: 'auto', display: 'flex', top: '28px', py: '4px', flexDirection: 'column', alignItems: 'flex-start', zIndex: '2000', textAlign: 'left',
            left: '0',
            backgroundColor: '#222222', borderRadius: '8px'
          }}>

            <ListItemButton
              onClick={() => switchNetwork('mainnet')}
              sx={{
                padding: '4px 8px',
                width: '100%',
                '&:hover': {
                  color: networkColor('mainnet')
                }
              }}>
              <Typography
                sx={{
                  fontSize: '12px',
                  lineHeight: '16px',
                  fontWeight: '400',
                  textAlign: 'left',
                  '&:hover': {
                    color: networkColor('mainnet')
                  }
                }}
              >
                Mainnet
              </Typography>
            </ListItemButton>

            <ListItemButton
              onClick={() => switchNetwork('testnet')}
              sx={{
                padding: '4px 8px',
                width: '100%',
                '&:hover': {
                  color: networkColor('testnet')
                }
              }}
            >
              <Typography
                sx={{
                  fontSize: '12px',
                  lineHeight: '16px',
                  fontWeight: '400',
                  '&:hover': {
                    color: networkColor('testnet')
                  }
                }}
              >
                Testnet
              </Typography>
            </ListItemButton>
            {sandboxEnable &&
              <ListItemButton
                onClick={() => switchNetwork('previewnet')}
                sx={{
                  padding: '4px 8px',
                  width: '100%',
                  '&:hover': {
                    color: networkColor('previewnet')
                  }
                }}
              >
                <Typography
                  sx={{
                    fontSize: '12px',
                    lineHeight: '16px',
                    fontWeight: '400',
                    '&:hover': {
                      color: networkColor('previewnet')
                    }
                  }}
                >
                  Previewnet
                </Typography>
              </ListItemButton>
            }

            {isMigrationEnabled &&
              <ListItemButton
                onClick={() => switchNetwork('testnetMigration')}
                sx={{
                  padding: '4px 8px',
                  width: '100%',
                  '&:hover': {
                    color: networkColor('testnetMigration')
                  }
                }}
              >
                <Typography
                  sx={{
                    fontSize: '12px',
                    lineHeight: '16px',
                    fontWeight: '400',
                    '&:hover': {
                      color: networkColor('testnetMigration')
                    }
                  }}
                >
                  Testnet Migration
                </Typography>
              </ListItemButton>
            }
          </ListItem>
        }

      </ListItemButton >
    </ListItem >
  );
};

export default NetworkList;
