import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { styled } from '@mui/system';
import { Web3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { Core } from '@walletconnect/core'
import { makeStyles } from '@mui/styles';
import {
  Box,
  Typography,
  Checkbox,
  CardActionArea,
  Divider,
  FormControlLabel,
  Alert,
  Snackbar
} from '@mui/material';
import { useWallet } from 'ui/utils';
import { LLHeader, LLPrimaryButton } from '@/ui/FRWComponent';
import QR from '../../../FRWAssets/image/QR2.png';
import WalletConnect from './WalletConnect';
import QrScannerComponent from './QrScannerComponent'


const Connect = () => {
  const usewallet = useWallet();
  const history = useHistory();

  const [showError, setShowError] = useState(false);

  const wallet = useWallet();
  const [qrCode, setShowQr] = useState<boolean>(false)
  const [showconnect, setShowConnect] = useState<boolean>(false)

  const [sessions, setSession] = useState<any>([]);

  const [ID, setId] = useState<any>();

  const [web3wallet, setWeb3Wallet] = useState<any>(null);

  const setTab = async () => {
    await wallet.setDashIndex(3);
  };

  const toggleQr = async () => {
    setShowQr(!qrCode);
  };

  const toggleConnect = async () => {
    setShowConnect(!showconnect);
  };


  useEffect(() => {
    const createWeb3Wallet = async () => {
      try {
        const wallet = await Web3Wallet.init({
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
        setWeb3Wallet(wallet);
        const pairings = wallet.core.pairing.getPairings()
        console.log('walletParing ', pairings)
        setSession(pairings)
        wallet.core.pairing.events.on('pairing_ping', ({ id, topic }) => {
          console.log('paringed ', id, topic)
        })

        wallet.on("session_request", (payload: Web3WalletTypes.SessionRequest) => {
          console.log('session_request ', payload)
        });
      } catch (e) {
        console.error(e);
      }
    };
    createWeb3Wallet();
  }, []);

  useEffect(() => {
    setTab();
  }, []);


  return (
    <div className="page">
      <LLHeader title={chrome.i18n.getMessage('Connect')} help={false} />
      <Typography
        sx={{
          color: 'var(--basic-foreground-white-8-text, rgba(255, 255, 255, 0.80))',
          textAlign: 'center',
          width: '320px',
          margin: '0 auto',
          /* Body2 */
          fontFamily: 'Inter',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: '400',
          lineHeight: '24px', /* 171.429% */
          letterSpacing: '-0.084px',
        }}
      >
        {chrome.i18n.getMessage('Link_Flow_Reference_Wallet_Mobile_by_Scanning')}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          width: '324px',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: '0',
          backgroundColor: '#579AF2',
          padding: '8px 24px',
          borderRadius: '12px',
          margin: '24px auto'
        }}
        onClick={(() => toggleQr())}><Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#000', marginLeft: '8px' }}>Show Qr</Typography></Box>
      <Box
        sx={{
          display: 'flex',
          width: '324px',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: '0',
          backgroundColor: '#579AF2',
          padding: '8px 24px',
          borderRadius: '12px',
          margin: '24px auto'
        }}
        onClick={(() => toggleConnect())}><img src={QR} style={{ width: '24px', height: '24px' }} /><Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#000', marginLeft: '8px' }}>{chrome.i18n.getMessage('Sync_Mobile_Device')}</Typography></Box>

      {showconnect &&
        <WalletConnect
          isAddAddressOpen={showconnect}
          handleCloseIconClicked={() => setShowConnect(false)}
          handleCancelBtnClicked={() => setShowConnect(false)}
          handleAddBtnClicked={() => {
            setShowConnect(false);
          }}
          web3wallet={web3wallet}
          sessions={sessions}
          setSession={setSession}
        />
      }
      {qrCode &&


        <QrScannerComponent
          isAddAddressOpen={qrCode}
          handleCloseIconClicked={() => setShowQr(false)}
          handleCancelBtnClicked={() => setShowQr(false)}
          handleAddBtnClicked={() => {
            setShowQr(false);
          }}
        />
      }


    </div >
  )
}

export default Connect;