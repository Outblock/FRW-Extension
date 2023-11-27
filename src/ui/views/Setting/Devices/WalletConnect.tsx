import React, { useState, useEffect } from 'react';
import { Core } from '@walletconnect/core'
import { Web3Wallet } from '@walletconnect/web3wallet'
import { W3mQrCode } from '@web3modal/react'

import {
  Typography,
  Box,
  Drawer,
  Grid,
  Stack,
  InputBase,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  LLPrimaryButton,
} from '../../../FRWComponent';
import { useWallet } from 'ui/utils';
import { useForm, FieldValues } from 'react-hook-form';
import micone from '../../../FRWAssets/image/micone.png';
import licon from '../../../FRWAssets/image/licon.png';
import dicon from '../../../FRWAssets/image/dicon.png';
import closeCircle from '../../../FRWAssets/image/closeCircle.png';
import { useHistory } from 'react-router-dom';
import QRCode from "react-qr-code";

const StyledInput = styled(InputBase)(({ theme }) => ({
  zIndex: 1,
  color: (theme.palette as any).text,
  backgroundColor: (theme.palette as any).background.default,
  borderRadius: theme.spacing(2),
  marginTop: theme.spacing(2),
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(2),
    width: '100%',
  },
}));

interface RevokePageProps {
  isAddAddressOpen: boolean;
  handleCloseIconClicked: () => void;
  handleCancelBtnClicked: () => void;
  handleAddBtnClicked: () => void;
}

const core = new Core({
  projectId: '29b38ec12be4bd19bf03d7ccef29aaa6'
})



const WalletConnect = (props: RevokePageProps) => {

  const wallet = useWallet();

  const history = useHistory();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields, isValid, isDirty, isSubmitting },
  } = useForm({
    mode: 'all',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [Uri, setUri] = useState('');

  const initWallet = async () => {
    const web3wallet = await Web3Wallet.init({
      core, // <- pass the shared `core` instance
      metadata: {
        name: 'Flow Reference Walllet',
        description: 'Digital wallet created for everyone.',
        url: 'https://fcw-link.lilico.app',
        icons: ['https://fcw-link.lilico.app/logo.png']
      }
    })


    const { topic, uri } = await web3wallet.core.pairing.create()
    console.log('uri ', uri)
    setUri(uri);
  };

  const onCancelBtnClicked = () => {
    props.handleCancelBtnClicked();
  };

  useEffect(() => {
    initWallet();
  }, []);

  const renderContent = () => (
    <Box
      px="18px"
      sx={{
        width: 'auto',
        height: '469px',
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
        sx={{ margin: '20px 0' }}
        onClick={props.handleCloseIconClicked}
      >
        <Typography sx={{ fontWeight: '700', fontSize: '18px' }}>Link Mobile Device</Typography>
      </Box>
      <Box sx={{ display: 'flex', gridTemplateColumns: '1fr 1fr 1fr', justifyContent: 'center', alignItems: 'stretch' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img style={{ height: '40px', width: '40px', borderRadius: '30px', backgroundColor: 'text.secondary', objectFit: 'cover' }} src={dicon} />
          <Typography sx={{ fontSize: '14px', color: '#579AF2', fontWeight: '400', width: '100%', pt: '4px', textAlign: 'center' }}>Desktop Device</Typography>
        </Box>
        <img style={{ width: '108px',height:'8px',marginTop:'20px' }} src={licon} />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img style={{ height: '40px', width: '40px', borderRadius: '30px', backgroundColor: 'text.secondary', objectFit: 'cover' }} src={micone} />
          <Typography sx={{ fontSize: '14px', color: '#579AF2', fontWeight: '400', width: '100%', pt: '4px', textAlign: 'center' }}>Mobile Device</Typography>
        </Box>

      </Box>
      <Box sx={{ marginTop: '24px', width: '339px', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.12)' }}></Box>
      <Box sx={{ marginTop: '40px', display: 'block', width: '144px', height: '144px' }}>

        {Uri &&
          <QRCode
            size={144}
            style={{ height: "auto", maxWidth: "100%", width: "100%", borderRadius: '24px' }}
            value={Uri}
            viewBox={`0 0 144 144`}
          />
        }

      </Box>
      <Typography sx={{ margin: '16px auto 0', fontSize: '14px', fontWeight: 400, color: 'rgba(255, 255, 255, 0.80)', width: '267px' }}>
        Scan with Flow Reference
      </Typography>
      <Typography color='error.main' sx={{ margin: '8px auto 60px', color: 'rgba(255, 255, 255, 0.40)', fontSize: '12px', fontWeight: 400, width: '250px' }}>
        Scan QR code to active your mobile device
      </Typography>

    </Box>
  );

  return (
    <Drawer
      anchor="bottom"
      open={props.isAddAddressOpen}
      transitionDuration={300}
      PaperProps={{
        sx: {
          width: '100%', height: '469px',
          borderRadius: '18px 18px 0px 0px',
        },
      }}
    >
      {renderContent()}
    </Drawer>
  );
};

export default WalletConnect;
