import React, { useState, useEffect } from 'react';
import { Core } from '@walletconnect/core'
import { Web3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'
import SignClient from '@walletconnect/sign-client'


import {
  Typography,
  Box,
  Drawer,
  Grid,
  Stack,
  InputBase,
  Input,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import { FCLWalletConnectMethod } from '@/ui/utils/type';
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
  const [isScan, setScan] = useState(false);
  const [Uri, setUri] = useState('');

  const [web3wallet, setWeb3Wallet] = useState<any>(null);



  useEffect(() => {
    const createWeb3Wallet = async () => {
      try {
        const wallet = await Web3Wallet.init({
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
        const { topic, uri } = await wallet.core.pairing.create();
        console.log('uri', uri);
        setWeb3Wallet(wallet);
        setUri(uri);
      } catch (e) {
        console.error(e);
      }
    };
    createWeb3Wallet();
  }, []);

  async function onSessionProposal({ id, params }: Web3WalletTypes.SessionProposal) {
    try {
      // ------- namespaces builder util ------------ //

      const namespaces = Object.entries(params.requiredNamespaces).map(([key, namespace]) => {
        const caip2Namespace = key;
        const proposalNamespace = namespace;
        const accounts = proposalNamespace.chains?.map(chain => `${chain}:0x7e5d2312899dcf9f`) || [];

        return {
          [caip2Namespace]: {
            chains: proposalNamespace.chains,
            accounts: accounts,
            methods: proposalNamespace.methods,
            events: proposalNamespace.events
          }
        };
      })
        .reduce((acc, current) => ({ ...acc, ...current }), {});

      console.log('approveSession:', namespaces);

      // ------- end namespaces builder util ------------ //

      const session = await web3wallet.approveSession({
        id,
        namespaces: namespaces
      })

      console.log('session ', session)
    } catch (error) {
      console.log('error ', error)
    }
  }

  const handleFilterAndSearch = async (e) => {
    const keyword = e.target.value;
    console.log('keyword', keyword);

    if (web3wallet) {
      const pairResponse = await web3wallet.core.pairing.pair({ uri: keyword });
      console.log('pairResponse', pairResponse);
      await web3wallet.core.pairing.ping({ topic: pairResponse.topic })
      web3wallet.on('session_proposal', onSessionProposal)

      await web3wallet.core.pairing.ping({ topic: pairResponse.topic })
      const pairings = web3wallet.core.pairing.getPairings();
      console.log('pairings', pairings);
    } else {
      console.log('Web3Wallet is not initialized');
    }



  };


  web3wallet.on(FCLWalletConnectMethod.addDeviceInfo, async event => {
    const { topic, params, id } = event;
    const requestParamsMessage = params.request.params[0];

    // Assuming the structure of requestParamsMessage is similar to what's expected in Swift code
    // You might need to adjust this part based on the actual structure of requestParamsMessage
    let status = requestParamsMessage.status;
    let jsonData = requestParamsMessage.data;

    try {
      if (status === "3") {
        // Respond with an empty message
        const response = { id, result: '', jsonrpc: '2.0' };
        await web3wallet.respondSessionRequest({ topic, response });
        return;
      }

      const register = JSON.parse(jsonData);

      // Respond with an empty message
      const response = { id, result: '', jsonrpc: '2.0' };
      await web3wallet.respondSessionRequest({ topic, response });


      // Router.route(to: RouteMap.RestoreLogin.syncDevice(register));
    } catch (error) {
      console.error("[WALLET] Respond Error: [addDeviceInfo]", error);

    }
  });



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
        <img style={{ width: '108px', height: '8px', marginTop: '20px' }} src={licon} />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img style={{ height: '40px', width: '40px', borderRadius: '30px', backgroundColor: 'text.secondary', objectFit: 'cover' }} src={micone} />
          <Typography sx={{ fontSize: '14px', color: '#579AF2', fontWeight: '400', width: '100%', pt: '4px', textAlign: 'center' }}>Mobile Device</Typography>
        </Box>

      </Box>
      <Box sx={{ marginTop: '24px', width: '339px', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.12)' }}></Box>
      <Box
        onClick={() => setScan(false)}>Qr</Box>
      <Box
        onClick={() => setScan(true)}>Scan</Box>

      {!isScan &&
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

      }


      {isScan &&
        <Box>
          <Input
            type="search"
            placeholder={'Pair wc uri'}
            autoFocus
            disableUnderline
            endAdornment={
              <InputAdornment position="end">
                <SearchIcon
                  color="primary"
                  sx={{ ml: '10px', my: '5px', fontSize: '24px' }}
                />
              </InputAdornment>
            }
            onChange={handleFilterAndSearch}
          />
        </Box>
      }
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
