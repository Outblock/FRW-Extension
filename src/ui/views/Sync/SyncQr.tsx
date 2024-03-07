import React, { useEffect, useCallback, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Box, ThemeProvider } from '@mui/system';
import {
  Button,
  Typography,
  FormControl,
  Input,
  InputAdornment,
  CssBaseline,
} from '@mui/material';
import { DeviceInfo, DeviceInfoRequest, AccountKey } from 'background/service/networkModel';
import theme from '../../style/LLTheme';
import EmailIcon from '../../assets/alternate-email.svg';
import { Presets } from 'react-component-transition';
import { useWallet } from 'ui/utils';
import { CircularProgress, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Core } from '@walletconnect/core';
import { FCLWalletConnectMethod } from '@/ui/utils/type';
import SignClient from '@walletconnect/sign-client';
import { PairingTypes, SessionTypes } from "@walletconnect/types";
import * as bip39 from 'bip39';
import HDWallet from 'ethereum-hdwallet';

import QRCode from "react-qr-code";


const useStyles = makeStyles((theme) => ({
  customInputLabel: {
    '& legend': {
      visibility: 'visible',
    },
  },
  inputBox: {
    height: '64px',
    padding: '16px',
    zIndex: '999',
    backgroundColor: '#282828',
    border: '2px solid #4C4C4C',
    borderRadius: '12px',
    boxSizing: 'border-box',
    '&.Mui-focused': {
      border: '2px solid #FAFAFA',
      boxShadow: '0px 8px 12px 4px rgba(76, 76, 76, 0.24)',
    },
  },
}));


const SyncQr = ({ handleClick, savedUsername, confirmMnemonic, setUsername }) => {
  const usewallet = useWallet();
  const classes = useStyles();
  const [Uri, setUri] = useState('');
  const [web3wallet, setWeb3Wallet] = useState<any>(null);
  const [loading, setShowLoading] = useState<boolean>(false);
  const [session, setSession] = useState<SessionTypes.Struct>();
  const [mnemonic, setMnemonic] = useState(bip39.generateMnemonic());
  const [copySuccess, setCopySuccess] = useState('');

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(Uri);
      setCopySuccess('Copied!');
    } catch (err) {
      setCopySuccess('Failed to copy!');
    }
  };

  useEffect(() => {
    const createWeb3Wallet = async () => {

      try {
        const wallet = await SignClient.init({
          core: new Core({
            projectId: process.env.WC_PROJECTID,
          }),
          metadata: {
            name: 'Flow Reference Walllet',
            description: 'Digital wallet created for everyone.',
            url: 'https://fcw-link.lilico.app',
            icons: ['https://fcw-link.lilico.app/logo.png']
          },
        });
        console.log('web3walletadress', wallet);
        await _subscribeToEvents(wallet);

        try {
          const { uri, approval } = await wallet.connect({
            // Provide the namespaces and chains (e.g. `eip155` for EVM-based chains) we want to use in this session.
            requiredNamespaces: {
              eip155: {
                methods: [
                  FCLWalletConnectMethod.accountInfo,
                  FCLWalletConnectMethod.addDeviceInfo
                ],
                chains: ['flow:testnet'],
                events: []
              }
            }
          })

          // Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
          if (uri) {
            console.log('uri ', uri)
            await setUri(uri);
            // Await session approval from the wallet.
            const session = await approval()
            await onSessionConnected(session);

            console.log('session ', session);
            sendRequest(wallet, session.topic);

            // onSessionConnect(session)
            // Close the QRCode modal in case it was open.
          }
        } catch (e) {
          console.error(e)
        }
        await setWeb3Wallet(wallet);
        console.log('web3wallet', web3wallet);
      } catch (e) {
        console.error(e);
      }
    };
    createWeb3Wallet();
  }, []);




  const onSessionConnected = useCallback(
    async (_session: SessionTypes.Struct) => {
      console.log('_session ', _session)
      setShowLoading(true);
      setSession(_session);

    },
    []
  );



  const _subscribeToEvents = useCallback(
    async (_client: SignClient) => {
      if (typeof _client === "undefined") {
        throw new Error("WalletConnect is not initialized");
      }

      _client.on("session_update", ({ topic, params }) => {
        console.log("EVENT", "session_update", { topic, params });
        const { namespaces } = params;
        const _session = _client.session.get(topic);
        const updatedSession = { ..._session, namespaces };
        onSessionConnected(updatedSession);
      });
      console.log("EVENT _client ", _client)

    },
    [onSessionConnected]
  );


  async function sendRequest(wallet: SignClient, topic: string) {
    console.log(wallet)
    wallet.request({
      topic: topic,
      chainId: 'flow:testnet',
      request: {
        method: FCLWalletConnectMethod.accountInfo,
        params: [],
      },
    }).then(async (result: any) => {
      const jsonObject = JSON.parse(result);
      console.log('jsonObject ', jsonObject);
      if (jsonObject.method === FCLWalletConnectMethod.accountInfo) {
        const accountKey: AccountKey = getAccountKey();
        const deviceInfo: DeviceInfoRequest = await getDeviceInfo();

        const requestParam = {
          data: {
            username: "",
            accountKey: accountKey,
            deviceInfo: deviceInfo
          }
        };
        wallet.request({
          topic: topic,
          chainId: 'flow:testnet',
          request: {
            method: FCLWalletConnectMethod.addDeviceInfo,
            params: requestParam,
          },
        })
          .then(async (sent) => {
            console.log('sent ', sent);
            const resultt = await usewallet.signInV3(mnemonic, accountKey, deviceInfo);
            confirmMnemonic(mnemonic);
            console.log('result ->', resultt)
            const userInfo = await usewallet.getUserInfo(true);
            setUsername(userInfo.username);
            handleClick();
          })
          .catch((error) => {
            console.error('Error in second wallet request:', error);
          });
      }
    }).catch((error) => {
      console.error('Error in first wallet request:', error);
    });


  }




  const getAccountKey = () => {
    const hdwallet = HDWallet.fromMnemonic(mnemonic);
    const publicKey = hdwallet
      .derive("m/44'/539'/0'/0/0")
      .getPublicKey()
      .toString('hex');
    const key: AccountKey = {
      hash_algo: 1,
      sign_algo: 2,
      weight: 1000,
      public_key: publicKey,
    };
    return key;
  };

  const getDeviceInfo = async (): Promise<DeviceInfoRequest> => {
    const result = await usewallet.openapi.getLocation();
    const installationId = await usewallet.openapi.getInstallationId();
    // console.log('location ', userlocation);
    const userlocation = result.data
    const deviceInfo: DeviceInfoRequest = {

      'city': userlocation.city,
      'continent': userlocation.country,
      'continentCode': userlocation.countryCode,
      'country': userlocation.country,
      'countryCode': userlocation.countryCode,
      'currency': userlocation.countryCode,
      device_id: installationId,
      'district': '',
      'ip': userlocation.query,
      'isp': userlocation.as,
      'lat': userlocation.lat,
      'lon': userlocation.lon,
      'name': 'FRW Chrome Extension',
      'org': userlocation.org,
      'regionName': userlocation.regionName,
      'type': '1',
      'user_agent': 'Chrome',
      'zip': userlocation.zip,

    };
    return deviceInfo;
  }







  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          px: '60px',
          backgroundColor: '#222',
          height: '380px',
          width: '620px',
          position: 'relative',
          borderRadius: '24px'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: '-95px',
            top: '40px',
            display: 'flex',
            justifyContent: 'space-between',
            width: '700px'

          }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '20px',
              width: '353px',
            }}
          >

            <Typography
              variant="h4"
              sx={{
                fontWeight: '700',
                fontSize: '40px',
                WebkitBackgroundClip: 'text',
                color: '#fff',
                lineHeight: '56px'
              }}
            >
              Sync <span style={{ display: 'inline-block', width: '353px' }}>
                Flow Reference</span>
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: 'primary.light', pt: '16px', fontSize: '16px', margin: '24px 0 32px' }}
            >
              {/* {chrome.i18n.getMessage('appDescription')} {' '} */}
              Open your Flow Reference on Mobile app and Scan the QR Code to Sync your Wallet.
            </Typography>


            <Typography
              variant="body1"
              sx={{ color: '#8C9BAB', pt: '12px', fontSize: '12px' }}
            >
              {/* {chrome.i18n.getMessage('appDescription')} {' '} */}
              Note: Your recovery phrase will go through Flow Reference's server. It is end-to-end encrypted and we can never read it.
            </Typography>
          </Box>

          <Box
            sx={{
              padding: '0 60px 0 70px',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              width: '347px'
            }}
          >
            {/* <Box>
              <Typography sx={{
                width: '347px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}>{Uri}</Typography>
              <button onClick={copyToClipboard}>Copy Uri</button>
              {copySuccess && <Box>{copySuccess}</Box>}
            </Box> */}
            {Uri &&
              <Box>
                <Box sx={{ position: 'relative' }}>
                  <QRCode
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%", borderRadius: '24px' }}
                    value={Uri}
                    viewBox={`0 0 256 256`}
                  />
                  {loading &&
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '217px',
                        height: '217px',
                        position: 'absolute',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        top: '0'
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          width: '150px',
                          color: '#41CC5D',
                          lineHeight: '24px',
                          fontWeight: '700',
                          pt: '14px', fontSize: '14px',
                          textAlign: 'center'
                        }}
                      >
                        Scan Successfully
                        Sync in Process...
                      </Typography>

                    </Box>
                  }
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    color: ' rgba(255, 255, 255, 0.80))'
                    , pt: '14px', fontSize: '14px', textAlign: 'center'
                  }}
                >
                  {/* {chrome.i18n.getMessage('appDescription')} {' '} */}
                  Scan QR Code with Mobile App
                </Typography>
              </Box>
            }
          </Box>
        </Box>
      </Box>


      {/* <Box sx={{ flexGrow: 1 }} /> */}

    </ThemeProvider>
  );
};

export default SyncQr;
