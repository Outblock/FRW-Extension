import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApproval, useWallet } from 'ui/utils';
// import { CHAINS_ENUM } from 'consts';
import { ThemeProvider } from '@mui/system';
import { Stack, Box, Typography, CardMedia } from '@mui/material';
import theme from 'ui/style/LLTheme';
import {
  LLPrimaryButton,
  LLSecondaryButton,
} from 'ui/FRWComponent';
import { LLConnectLoading, LLLinkingLoading } from '@/ui/FRWComponent';
import { UserInfoResponse } from 'background/service/networkModel';
import { isValidEthereumAddress } from 'ui/utils/address';
import { formatAddress } from 'ui/utils';
import * as fcl from '@onflow/fcl';

interface ConnectProps {
  params: any;
  // onChainChange(chain: CHAINS_ENUM): void;
  // defaultChain: CHAINS_ENUM;
}

const EthSignType = ({ params }: ConnectProps) => {
  const [, resolveApproval, rejectApproval, linkningConfirm] = useApproval();
  const { t } = useTranslation();
  const wallet = useWallet();
  const [signable, setSignable] = useState<Signable | null>(null);
  // const [payerSignable, setPayerSignable] = useState<Signable | null>(null);
  const [opener, setOpener] = useState<number | undefined>(undefined)
  const [host, setHost] = useState(null)
  const [cadenceArguments, setCadenceArguments] = useState<any[]>([]);
  const [linkingDone, setLinkingDone] = useState(false);
  const [accountLinking, setAccountLinking] = useState(false);
  const [accountArgs, setAccountArgs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lilicoEnabled, setLilicoEnabled] = useState(true);
  const [messages, setMessages] = useState<any>(null);
  const [image, setImage] = useState<string>('')
  const [accountTitle, setAccountTitle] = useState<string>('')
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null)

  // TODO: replace default logo
  const [logo, setLogo] = useState('')
  interface Roles {
    authorizer: boolean,
    payer: boolean,
    proposer: boolean,
  }
  interface Signable {
    cadence: string,
    message: string,
    addr: string,
    keyId: number,
    roles: Roles,
    voucher: Voucher
    f_type: string,
  }
  interface Voucher {
    refBlock: string
    payloadSigs: Signature
  }
  interface Signature {
    address: string,
    keyId: number,
    sig: string | null
  }


  const extractData = () => {
    console.log('obj ', params)
    let data = ''
    let address = ''

    if (
      isValidEthereumAddress(params.data.params[0])
    ) {
      data = params.data.params[1];
      address = params.data.params[0];
    } else {
      data = params.data.params[0];
      address = params.data.params[1];
    }
    const jsonObject = JSON.parse(data);
    setMessages(jsonObject)
    console.log('data, ', data)
  };

  const handleCancel = () => {
    rejectApproval('User rejected the request.');
  };

  const handleAllow = async () => {
    await checkCoa();
    resolveApproval({
      defaultChain: 646,
      signPermission: 'MAINNET_AND_TESTNET',
    });
  };


  const checkCoa = async () => {
    setLoading(true);
    const isEnabled = await wallet.checkCoaLink();
    if (!isEnabled) {
      const result = await wallet.coaLink();
      const res = await fcl.tx(result).onceSealed();
      const transactionExecutedEvent = res.events.find(event => event.type.includes("TransactionExecuted"));
      if (transactionExecutedEvent) {
        setLoading(false);
        return
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    if (params) {
      extractData();
    }
  }, []);


  const JsonRenderer = ({ data }) => {
    // Function to render the content inside the 'message' field
    const renderMessageContent = (messageObj) => {
      return Object.keys(messageObj).map((key) => {
        const value = messageObj[key];

        // Check if the value is an object, if not render the value directly
        if (typeof value === 'object' && value !== null) {
          return (
            <Box key={key} sx={{ marginBottom: '8px' }}>
              {/* Render the first layer key as a title */}
              <Box sx={{ backgroundColor: 'var(--Special-Color-Line, rgba(255, 255, 255, 0.12))', height: '1px', marginBottom: '8px' }}></Box>
              <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFFCC' }}>
                {key.charAt(0).toUpperCase() + key.slice(1)} {/* Capitalize key */}
              </Typography>

              {/* Render the inner fields of 'from' and 'to' */}
              {Object.keys(value).map((innerKey) => (
                <Box display="flex" justifyContent="space-between" key={innerKey} sx={{ padding: '0' }}>
                  <Typography sx={{ fontWeight: '400', color: '#FFFFFF66', fontSize: '14px' }}>
                    {innerKey.charAt(0).toUpperCase() + innerKey.slice(1)}:
                  </Typography>
                  <Typography sx={{ color: '#FFFFFFCC', fontSize: '14px' }}>
                    {formatAddress(value[innerKey])}
                  </Typography>
                </Box>
              ))}
            </Box>
          );
        } else {
          // If it's not an object, render the key and value directly
          return (
            <Box>

              <Box sx={{ backgroundColor: 'var(--Special-Color-Line, rgba(255, 255, 255, 0.12))', height: '1px', marginBottom: '8px' }}></Box>
              <Box display="flex" justifyContent="space-between" key={key} sx={{ padding: '0', marginBottom: 2 }}>
                <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFFCC' }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </Typography>
                <Typography sx={{ color: '#FFFFFFCC', fontSize: '14px' }}>
                  {value}
                </Typography>
              </Box>
            </Box>
          );
        }
      });
    };

    return (
      <Box sx={{ padding: '16px' }}>
        <Box display="flex" justifyContent="space-between" sx={{ paddingBottom: '8px' }}>
          <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFFCC' }}>Primary Type</Typography>
          <Typography sx={{ color: '#FFFFFFCC', fontSize: '14px' }}>
            {data.primaryType}
          </Typography>
        </Box>
        {renderMessageContent(data.message)}
      </Box>
    );
  };


  return (
    <ThemeProvider theme={theme}>
      {isLoading ?
        <Box>
          {accountLinking ?
            <LLLinkingLoading
              linkingDone={linkingDone}
              image={image}
              accountTitle={accountTitle}
              userInfo={userInfo}
            /> :
            <LLConnectLoading logo={logo} />
          }
          {/* <LLConnectLoading logo={logo} /> */}
        </Box> :
        <Box sx={{
          margin: '18px 18px',
          padding: '18px',
          height: '506px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(40, 40, 40, 0.00) 88.24%)'
        }}>

          {
            params.session &&

            <Box sx={{ marginBottom: '2px', display: 'flex' }}>
              <CardMedia image={params.session.icon} sx={{ width: '64px', height: '64px', marginRight: '16px' }}></CardMedia>
              <Box>
                <Typography sx={{ fontSize: '12px', color: '#737373' }}>Sign Type Message from</Typography>
                <Typography sx={{ fontSize: '18px', color: '#FFFFFF', fontWeight: '700' }}>{params.session.name}</Typography>
              </Box>
            </Box>
          }

          {messages &&
            <JsonRenderer data={messages} />
          }
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1} sx={{ paddingBottom: '32px' }}>
            <LLSecondaryButton
              label={chrome.i18n.getMessage('Cancel')}
              fullWidth
              onClick={handleCancel}
            />
            {!loading ?
              <LLPrimaryButton
                label={chrome.i18n.getMessage('Approve')}
                fullWidth
                type="submit"
                onClick={handleAllow}
              />
              :
              <LLSecondaryButton
                label={chrome.i18n.getMessage('Loading')}
                fullWidth
              />
            }

          </Stack>
        </Box>
      }
    </ThemeProvider >
  );
};

export default EthSignType;
