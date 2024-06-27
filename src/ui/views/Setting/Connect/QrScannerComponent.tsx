import React, { useEffect, useCallback, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Box, ThemeProvider } from '@mui/system';
import {
  Button,
  Typography,
  FormControl,
  Input,
  Drawer,
  CssBaseline,
} from '@mui/material';
import theme from '../../../style/LLTheme';
import { useWallet } from 'ui/utils';
import { Core } from '@walletconnect/core';
import { FCLWalletConnectMethod } from '@/ui/utils/type';
import SignClient from '@walletconnect/sign-client';
import { PairingTypes, SessionTypes } from '@walletconnect/types';
import * as bip39 from 'bip39';
import closeCircle from '../../../FRWAssets/image/closeCircle.png';
import { Web3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'



interface WalletConnectProps {
  isAddAddressOpen: boolean;
  handleCloseIconClicked: () => void;
  handleCancelBtnClicked: () => void;
  handleAddBtnClicked: () => void;
}


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


const QrScannerComponent = (props: WalletConnectProps) => {
  const usewallet = useWallet();
  const classes = useStyles();
  const [Uri, setUri] = useState('');
  const [web3wallet, setWeb3Wallet] = useState<any>(null);
  const [loading, setShowLoading] = useState<boolean>(false);
  const [session, setSession] = useState<SessionTypes.Struct>();
  const [sessions, setSessions] = useState<any>([]);
  const [mnemonic, setMnemonic] = useState(bip39.generateMnemonic());
  const [currentNetwork, setNetwork] = useState(process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet');

  const loadNetwork = async () => {
    const currentNetwork = await usewallet.getNetwork();
    setNetwork(currentNetwork)
  }

  useEffect(() => {
    loadNetwork()
  }, [])

  useEffect(() => {
    const createWeb3Wallet = async () => {

      try {
        const wallet = await SignClient.init({
          core: new Core({
            projectId: process.env.WC_PROJECTID,
          }),
          metadata: {
            name: 'Flow Walllet',
            description: 'Digital wallet created for everyone.',
            url: 'https://fcw-link.lilico.app',
            icons: ['https://fcw-link.lilico.app/logo.png']
          },
        });
        await _subscribeToEvents(wallet);

        await setWeb3Wallet(wallet);
        const pairings = wallet.session.getAll()
        console.log('walletParing ', pairings)
        setSessions(pairings)
        console.log('web3wallet', web3wallet);

        try {
          const { uri, approval } = await wallet.connect({
            requiredNamespaces: {
              flow: {
                methods: [
                  FCLWalletConnectMethod.accountInfo,
                  FCLWalletConnectMethod.addDeviceInfo
                ],
                chains: [`flow:${currentNetwork}`],
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
      if (typeof _client === 'undefined') {
        throw new Error('WalletConnect is not initialized');
      }

      _client.on('session_update', ({ topic, params }) => {
        console.log('EVENT', 'session_update', { topic, params });
        const { namespaces } = params;
        const _session = _client.session.get(topic);
        const updatedSession = { ..._session, namespaces };
        onSessionConnected(updatedSession);
      });
      console.log('EVENT _client ', _client)

    },
    [onSessionConnected]
  );


  async function sendRequest(web3wallet: SignClient, topic: string) {
    console.log(web3wallet)
    web3wallet.request({
      topic: topic,
      chainId: `flow:${currentNetwork}`,
      request: {
        method: FCLWalletConnectMethod.accountInfo,
        params: ['123123'],
      },
    }).then(async (result: any) => {
      console.log('result ', result);
      const jsonObject = JSON.parse(result);
      console.log('jsonObject ', jsonObject);
    }).catch((error) => {
      console.error('Error in first props.web3wallet request:', error);
    });


  }




  const pingTopic = async (data: string) => {
    await web3wallet.core.pairing.ping({ topic: data })
    const pairings = web3wallet.session.getAll()
    console.log('walletParing ', pairings)
    setSessions(pairings)
  }


  async function sendTopic(topic: string) {
    console.log(web3wallet)
    web3wallet.request({
      topic: 'c3139eaf4d0701df43cb2edf7679aadc645cbac98e6888c847f104c46c4b7eac',
      chainId: `flow:${currentNetwork}`,
      request: {
        method: FCLWalletConnectMethod.accountInfo,
        params: [],
      },
    }).then(async (result: any) => {
      console.log('result ', result);
      const jsonObject = JSON.parse(result);
      console.log('jsonObject ', jsonObject);
    }).catch((error) => {
      console.error('Error in first props.web3wallet request:', error);
    });


  }





  const renderContent = () => (
    <Box
      sx={{
        width: 'auto',
        height: 'auto',
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative'
      }}
    >
      <Box
        sx={{ position: 'absolute', right: '18px', top: '18px' }}
        onClick={props.handleCloseIconClicked}
      >
        <img src={closeCircle} style={{ width: '20px', height: '20px', }} />
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'column',
        }}>

        {Uri &&
          <Box>
            <Typography
              variant="body1"
              sx={{
                color: ' rgba(255, 255, 255, 0.80))'
                , pt: '14px', fontSize: '14px', textAlign: 'center'
              }}
            >
              {Uri}
            </Typography>
          </Box>
        }

        <Box>
          {sessions.map((session, index) => (
            <Box key={index} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px' }}>
              <Typography>{session.peerMetadata ? session.peerMetadata.name : 'Unknown Session'}</Typography>
              <Typography>Topic: {session.topic}</Typography>
              <Typography>Protocol: {session.relay.protocol}</Typography>
              <Typography>Expiry: {new Date(session.expiry * 1000).toLocaleString()}</Typography>
              <Typography>Active: {session.active ? 'Yes' : 'No'}</Typography>
              {session.peerMetadata && (
                <>
                  <Typography>Description: {session.peerMetadata.description}</Typography>
                  <Typography>URL: {session.peerMetadata.url}</Typography>
                  {session.peerMetadata.icons && session.peerMetadata.icons.length > 0 && (
                    <img src={session.peerMetadata.icons[0]} alt={session.peerMetadata.name} style={{ width: '50px', height: '50px' }} />
                  )}
                </>
              )}
              {web3wallet && <Button onClick={() => pingTopic(session.topic)}>Ping</Button>}
              {web3wallet &&
                <Button onClick={() => sendTopic(session.topic)}>Sen</Button>}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );



  return (
    <Drawer
      anchor="bottom"
      open={props.isAddAddressOpen}
      transitionDuration={300}
      PaperProps={{
        sx: {
          width: '100%', height: 'auto',
        },
      }}
    >
      {renderContent()}

    </Drawer>
  );
};

export default QrScannerComponent;
