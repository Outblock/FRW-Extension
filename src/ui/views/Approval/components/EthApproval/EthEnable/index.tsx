import { Stack, Box, Typography, Divider, CardMedia, Card } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useHistory } from 'react-router-dom';

import enableBg from 'ui/FRWAssets/image/enableBg.png';
import flowgrey from 'ui/FRWAssets/svg/flow-grey.svg';
import linkGlobe from 'ui/FRWAssets/svg/linkGlobe.svg';
import { LLPrimaryButton, LLSecondaryButton, LLSpinner, LLConnectLoading } from 'ui/FRWComponent';
import { useApproval, useWallet, formatAddress } from 'ui/utils';
import { isValidEthereumAddress } from 'ui/utils/address';
// import { CHAINS_ENUM } from 'consts';

interface ConnectProps {
  params: any;
}

const EthEnable = ({ params: { icon, name, origin } }: ConnectProps) => {
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
  const [nonce, setNonce] = useState<string | undefined>(undefined);
  const [opener, setOpener] = useState<number | undefined>(undefined);
  const [defaultChain, setDefaultChain] = useState(747);
  const [host, setHost] = useState('');
  const [title, setTitle] = useState('');
  const [msgNetwork, setMsgNetwork] = useState('testnet');
  const [isEvm, setIsEvm] = useState(false);
  const [currentNetwork, setCurrent] = useState('testnet');

  const [approval, setApproval] = useState(false);

  // TODO: replace default logo
  const [logo, setLogo] = useState('');
  const [evmAddress, setEvmAddress] = useState('');
  const init = useCallback(async () => {
    setLogo(icon);
    const site = await wallet.getSite(origin);
    const collectList: { name: string; logo_url: string }[] = [];
    const network = await wallet.getNetwork();
    const defaultChain = network === 'testnet' ? 545 : 747;
    const isShowTestnet = false;

    setDefaultChain(defaultChain);

    setIsLoading(false);
  }, [wallet, origin, icon]);

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
  }, [init]);

  const renderContent = () => (
    <Box sx={{ padingTop: '18px' }}>
      {isLoading ? (
        <LLConnectLoading logo={logo} />
      ) : (
        <Box
          sx={{
            margin: ' 18px ',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '12px',
            height: '100%',
            background: 'linear-gradient(0deg, #121212, #11271D)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              margin: '18px',
              gap: '8px',
            }}
          >
            <Typography
              sx={{ textTransform: 'uppercase', fontSize: '18px' }}
              variant="body1"
              color="text.secondary"
            >
              EVM is not enabled
            </Typography>
            <CardMedia component="img" sx={{ width: '196px', height: '196px' }} image={enableBg} />
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 'bold',
                color: '#FFFFFF',
                textAlign: 'Montserrat',
                fontFamily: 'Inter',
                fontSize: '12px',
              }}
              color="error"
            >
              EVM not enabled, please go back to extension and enable it first.
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1} sx={{ paddingBottom: '32px' }}>
            <LLSecondaryButton
              label={chrome.i18n.getMessage('Cancel')}
              fullWidth
              onClick={handleCancel}
            />
          </Stack>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <Box>{renderContent()}</Box>
    </>
  );
};

export default EthEnable;
