import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApproval, useWallet, formatAddress } from 'ui/utils';
// import { CHAINS_ENUM } from 'consts';
import { ThemeProvider } from '@mui/system';
import { Stack, Box, Typography, Divider, CardMedia } from '@mui/material';
import { authnServiceDefinition, serviceDefinition } from 'background/controller/serviceDefinition';
import theme from 'ui/style/LLTheme';
import {
  LLPrimaryButton,
  LLSecondaryButton,
  LLConnectLoading
} from 'ui/FRWComponent';
import { WalletUtils } from '@onflow/fcl'
import Link from 'ui/FRWAssets/svg/link.svg';
import testnetsvg from 'ui/FRWAssets/svg/testnet.svg';
import mainnetsvg from 'ui/FRWAssets/svg/mainnet.svg';
import linkGlobe from 'ui/FRWAssets/svg/linkGlobe.svg';
import flowgrey from 'ui/FRWAssets/svg/flow-grey.svg';

import { storage } from '@/background/webapi';

interface ConnectProps {
  params: any;
  // onChainChange(chain: CHAINS_ENUM): void;
  // defaultChain: CHAINS_ENUM;
}

const EthSwitch = ({ params: { origin, target } }: ConnectProps) => {
  const { state } = useLocation<{
    showChainsModal?: boolean;
  }>();
  const { showChainsModal = false } = state ?? {};
  const history = useHistory();
  const [, resolveApproval, rejectApproval] = useApproval();
  const { t } = useTranslation();
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const [appIdentifier, setAppIdentifier] = useState<string | undefined>(undefined);
  const [nonce, setNonce] = useState<string | undefined>(undefined)
  const [opener, setOpener] = useState<number | undefined>(undefined)
  const [windowId, setWindowId] = useState<number | undefined>(undefined)
  const [host, setHost] = useState('')
  const [title, setTitle] = useState('')
  const [msgNetwork, setMsgNetwork] = useState('testnet')
  const [showSwitch, setShowSwitch] = useState(false)
  const [currentNetwork, setCurrent] = useState('testnet')
  const [currentAddress, setCurrentAddress] = useState('')
  const [approval, setApproval] = useState(false)

  // TODO: replace default logo
  const [logo, setLogo] = useState('')

  const handleCancel = () => {
    setApproval(false);
    rejectApproval('User rejected the request.');
  };

  const handleSwitchNetwork = async () => {
    wallet.switchNetwork(target);

    if (currentNetwork !== target) {
      // TODO: replace it with better UX
      setCurrent(target);
      setMsgNetwork(target);
    }
    resolveApproval({
      defaultChain: 'FLOW',
      signPermission: 'MAINNET_AND_TESTNET',
    });
  }

  const checkNetwork = async () => {
    console.log('target ', target)

    const network = await wallet.getNetwork();
    setCurrent(network);
    if (target !== network && target) {
      setShowSwitch(true);
    } else {
      setShowSwitch(false);
    }
    const address = await wallet.getCurrentAddress();
    setCurrentAddress(address!);
  }


  useEffect(() => {
    checkNetwork();

  }, [currentNetwork])

  const networkColor = (network: string) => {
    switch (network) {
      case 'mainnet':
        return '#41CC5D';
      case 'testnet':
        return '#FF8A00';
      case 'crescendo':
        return '#CCAF21';
    }
  };


  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        margin: '18px 18px 0px 18px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        height: '100%',
        background: 'linear-gradient(0deg, #121212, #11271D)'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', margin: '18px', gap: '18px' }}>
          <Divider />
          <Typography sx={{ textAlign: 'center', fontSize: '20px', color: '#E6E6E6' }} >Allow this site to switch  <br />the network?</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', marginTop: '18px' }}>
            <Typography sx={{ textAlign: 'center', color: '#BABABA', fontSize: '14px' }}>This action will change your current network from <Typography sx={{ display: 'inline', color: '#E6E6E6' }}  > {currentNetwork}</Typography> to <Typography sx={{ display: 'inline', color: '#E6E6E6' }} > {currentNetwork}</Typography>.</Typography>
          </Stack>
        </Box>
        <Stack direction="column" spacing="18px" sx={{ justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', justifyContent: 'center', alignItems: 'stretch' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img style={{ height: '60px', width: '60px', padding:'18px', borderRadius: '30px', backgroundColor: networkColor(currentNetwork), objectFit: 'cover' }} src={testnetsvg} />
              <Typography sx={{ fontSize: '14px', color: '#E6E6E6', fontWeight: 'bold', width: '100%', pt: '4px', textAlign: 'center' }}>{currentNetwork}</Typography>
            </Box>
            <img style={{ width: '116px' }} src={Link} />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img style={{ height: '60px', width: '60px', padding:'18px', borderRadius: '30px', backgroundColor: networkColor(target), objectFit: 'cover' }} src={mainnetsvg} />
              <Typography sx={{ fontSize: '14px', color: '#E6E6E6', fontWeight: 'bold', width: '100%', pt: '4px', textAlign: 'center' }}>{target}</Typography>
            </Box>

          </Box>
        </Stack>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1} sx={{ paddingBottom: '32px' }}>
          <LLSecondaryButton
            label={chrome.i18n.getMessage('Cancel')}
            fullWidth
            onClick={handleCancel}
          />
          <LLPrimaryButton
            label={chrome.i18n.getMessage('Switch__Network')}
            fullWidth
            type="submit"
            onClick={handleSwitchNetwork}
          />
        </Stack>
      </Box>
    </ThemeProvider>
  );
};

export default EthSwitch;
