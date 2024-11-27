import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApproval, useWallet } from 'ui/utils';
// import { CHAINS_ENUM } from 'consts';
import { ThemeProvider } from '@mui/system';
import { Stack, Box, Typography, CardMedia } from '@mui/material';
import theme from 'ui/style/LLTheme';
import { LLPrimaryButton, LLSecondaryButton } from 'ui/FRWComponent';
import { LLConnectLoading, LLLinkingLoading } from '@/ui/FRWComponent';
import { UserInfoResponse } from 'background/service/networkModel';
import { isValidEthereumAddress } from 'ui/utils/address';
import { formatAddress } from 'ui/utils';
import * as fcl from '@onflow/fcl';

interface ConnectProps {
  params: any;
}

const EthSignV1 = ({ params }: ConnectProps) => {
  const [, resolveApproval, rejectApproval, linkningConfirm] = useApproval();
  const { t } = useTranslation();
  const wallet = useWallet();
  const [signable, setSignable] = useState<Signable | null>(null);
  // const [payerSignable, setPayerSignable] = useState<Signable | null>(null);
  const [opener, setOpener] = useState<number | undefined>(undefined);
  const [host, setHost] = useState(null);
  const [cadenceArguments, setCadenceArguments] = useState<any[]>([]);
  const [linkingDone, setLinkingDone] = useState(false);
  const [accountLinking, setAccountLinking] = useState(false);
  const [accountArgs, setAccountArgs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lilicoEnabled, setLilicoEnabled] = useState(true);
  const [messages, setMessages] = useState<any>(null);
  const [image, setImage] = useState<string>('');
  const [accountTitle, setAccountTitle] = useState<string>('');
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);

  // TODO: replace default logo
  const [logo, setLogo] = useState('');
  interface Roles {
    authorizer: boolean;
    payer: boolean;
    proposer: boolean;
  }
  interface Signable {
    cadence: string;
    message: string;
    addr: string;
    keyId: number;
    roles: Roles;
    voucher: Voucher;
    f_type: string;
  }
  interface Voucher {
    refBlock: string;
    payloadSigs: Signature;
  }
  interface Signature {
    address: string;
    keyId: number;
    sig: string | null;
  }

  const extractData = () => {
    console.log('obj ', params);
    let data = '';
    let address = '';

    if (isValidEthereumAddress(params.data.params[0])) {
      data = params.data.params[1];
      address = params.data.params[0];
    } else {
      data = params.data.params[0];
      address = params.data.params[1];
    }
    setMessages(data);
    console.log('data, ', data);
  };

  const handleCancel = () => {
    rejectApproval('User rejected the request.');
  };

  const handleAllow = async () => {
    await checkCoa();
    const network = await wallet.getNetwork();
    resolveApproval({
      defaultChain: network === 'testnet' ? 545 : 747,
      signPermission: 'MAINNET_AND_TESTNET',
    });
  };

  const checkCoa = async () => {
    setLoading(true);
    const isEnabled = await wallet.checkCoaLink();
    if (!isEnabled) {
      const result = await wallet.coaLink();
      const res = await fcl.tx(result).onceSealed();
      const transactionExecutedEvent = res.events.find((event) =>
        event.type.includes('TransactionExecuted')
      );
      if (transactionExecutedEvent) {
        setLoading(false);
        return;
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (params) {
      extractData();
    }
  }, []);

  const JsonRenderer = ({ data }) => {
    return (
      <Box sx={{ padding: '16px', backgroundColor: '#1C1C1C', borderRadius: '8px' }}>
        {data.map((item, index) => (
          <Box key={index} sx={{ marginBottom: '12px' }}>
            <Typography
              sx={{
                fontWeight: '600',
                fontSize: '14px',
                color: '#FFFFFFCC',
                marginBottom: '4px',
              }}
            >
              {item.name} ({item.type})
            </Typography>
            <Typography
              sx={{
                fontWeight: '400',
                fontSize: '14px',
                color: '#FFFFFF99',
                wordBreak: 'break-all', // Handle long values
              }}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      {isLoading ? (
        <Box>
          {accountLinking ? (
            <LLLinkingLoading
              linkingDone={linkingDone}
              image={image}
              accountTitle={accountTitle}
              userInfo={userInfo}
            />
          ) : (
            <LLConnectLoading logo={logo} />
          )}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <Box
            sx={{
              margin: '18px 18px',
              padding: '18px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '12px',
              background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(40, 40, 40, 0.00) 88.24%)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {params.session && (
              <Box sx={{ marginBottom: '2px', display: 'flex' }}>
                <CardMedia
                  image={params.session.icon}
                  sx={{ width: '64px', height: '64px', marginRight: '16px' }}
                />
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#737373' }}>
                    Sign Type Message from
                  </Typography>
                  <Typography sx={{ fontSize: '18px', color: '#FFFFFF', fontWeight: '700' }}>
                    {params.session.name}
                  </Typography>
                </Box>
              </Box>
            )}

            {messages && <JsonRenderer data={messages} />}
            <Box sx={{ flexGrow: 1 }} />
          </Box>
          <Box
            sx={{
              position: 'sticky',
              bottom: 0,
              padding: '18px',
            }}
          >
            <Stack direction="row" spacing={1}>
              <LLSecondaryButton
                label={chrome.i18n.getMessage('Cancel')}
                fullWidth
                onClick={handleCancel}
              />
              {!loading ? (
                <LLPrimaryButton
                  label={chrome.i18n.getMessage('Approve')}
                  fullWidth
                  type="submit"
                  onClick={handleAllow}
                />
              ) : (
                <LLSecondaryButton label={chrome.i18n.getMessage('Loading')} fullWidth />
              )}
            </Stack>
          </Box>
        </Box>
      )}
    </ThemeProvider>
  );
};

export default EthSignV1;
