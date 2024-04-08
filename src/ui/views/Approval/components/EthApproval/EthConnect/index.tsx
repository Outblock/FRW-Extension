import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApproval, useWallet } from 'ui/utils';
// import { CHAINS_ENUM } from 'consts';
import { ThemeProvider } from '@mui/system';
import { Stack, Box, Typography, Divider } from '@mui/material';
import { authnServiceDefinition, serviceDefinition } from 'background/controller/serviceDefinition';
import CheckCircleIcon from '../../../../../../components/iconfont/IconCheckmark';
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

import { storage } from '@/background/webapi';

interface ConnectProps {
  params: any;
  // onChainChange(chain: CHAINS_ENUM): void;
  // defaultChain: CHAINS_ENUM;
}

const EthConnect = ({ params: { icon, origin, tabId } }: ConnectProps) => {
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
  const [defaultChain, setDefaultChain] = useState('FLOW');
  const [host, setHost] = useState('')
  const [title, setTitle] = useState('')
  const [msgNetwork, setMsgNetwork] = useState('testnet')
  const [showSwitch, setShowSwitch] = useState(false)
  const [currentNetwork, setCurrent] = useState('testnet')

  const [approval, setApproval] = useState(false)

  // TODO: replace default logo
  const [logo, setLogo] = useState('')
  const init = async () => {
    console.log('origin ', origin);
    console.log('icon ', icon)
    setLogo(icon);
    const account = await wallet.getCurrentAccount();
    const site = await wallet.getSite(origin);
    let collectList: { name: string; logo_url: string }[] = [];
    let defaultChain = 'FLOW';
    let isShowTestnet = false;

    setDefaultChain(defaultChain);

    setIsLoading(false);
  };

  const handleCancel = () => {
    rejectApproval('User rejected the request.');
  };

  const handleAllow = async () => {
    resolveApproval({
      defaultChain,
      signPermission: 'MAINNET_AND_TESTNET',
    });
  };

  useEffect(() => {
    init();
  }, []);

  const renderContent = () => (
    <Box>
      {isLoading ? <LLConnectLoading logo={logo} /> :
        (<Box sx={{
          margin: '18px 18px 0px 18px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          height: '506px',
          background: 'linear-gradient(0deg, #121212, #11271D)'
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', margin: '18px', gap: '18px' }}>
            <Box sx={{ display: 'flex', gap: '18px', marginBottom: '0px' }}>
              <img style={{ height: '60px', width: '60px', borderRadius: '12px', backgroundColor: 'text.secondary' }} src={logo} />
              <Stack direction="column" spacing={1} sx={{ justifyContent: 'space-between' }}>
                <Typography>{title}</Typography>
                <Typography color="secondary.main" variant="overline">{host}</Typography>
              </Stack>
            </Box>
            <Divider />
            <Typography sx={{ textTransform: 'uppercase' }} variant="body1" color="text.secondary">{chrome.i18n.getMessage('Connect__Title')}:</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', marginTop: '5px' }}>
              <CheckCircleIcon size={20} color='#38B000' style={{ flexShrink: '0', marginTop: '5px' }} />
              <Typography>{chrome.i18n.getMessage('Connect__Body1')}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', marginTop: '5px' }}>
              <CheckCircleIcon size={20} color='#38B000' style={{ flexShrink: '0', marginTop: '5px' }} />
              <Typography>{chrome.i18n.getMessage('Connect__Body2')}</Typography>
            </Stack>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1} sx={{ paddingBottom: '32px' }}>
            <LLSecondaryButton
              label={chrome.i18n.getMessage('Cancel')}
              fullWidth
              onClick={handleCancel}
            />
            <LLPrimaryButton
              label={chrome.i18n.getMessage('Connect')}
              fullWidth
              type="submit"
              onClick={handleAllow}
            />
          </Stack>
        </Box>)}
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      123123123123131331
      <Box>
        {renderContent()}
      </Box>
    </ThemeProvider>
  );
};

export default EthConnect;
