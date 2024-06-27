import React, { useState, useEffect } from 'react';
import { Core } from '@walletconnect/core'
import { Web3Wallet, Web3WalletTypes } from '@walletconnect/props.web3wallet'
import { formatJsonRpcResult } from '@walletconnect/jsonrpc-utils'
import { getSdkError } from '@walletconnect/utils'
import { DeviceInfo, DeviceInfoRequest, AccountKey } from 'background/service/networkModel';
import {
  LLPrimaryButton,
  LLSecondaryButton,
} from 'ui/FRWComponent';

import {
  Typography,
  Box,
  Drawer,
  Link,
  Button,
  InputBase,
  Input,
  InputAdornment,
  Stack,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import { FCLWalletConnectMethod } from '@/ui/utils/type';
import { useWallet } from 'ui/utils';
import { useForm, FieldValues } from 'react-hook-form';
import closeCircle from '../../../FRWAssets/image/closeCircle.png';
import { useHistory } from 'react-router-dom';

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

interface WalletConnectProps {
  isAddAddressOpen: boolean;
  handleCloseIconClicked: () => void;
  handleCancelBtnClicked: () => void;
  handleAddBtnClicked: () => void;
  web3wallet: Web3Wallet; 
  sessions: any[]; 
  setSession: (session: any) => void; 
}

const WalletConnect = (props: WalletConnectProps) => {

  const usewallet = useWallet();

  const history = useHistory();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields, isValid, isDirty, isSubmitting },
  } = useForm({
    mode: 'all',
  });
  const [syncing, setSyncing] = useState(false);
  const [showApprove, setShowApprove] = useState<boolean>(false);

  const [namespaceObject, setNamespace] = useState<any>();

  const [proposer, setProposer] = useState<any>();


  const [ID, setId] = useState<any>();



  async function onSessionProposal({ id, params }: Web3WalletTypes.SessionProposal) {
    console.log('params ', params)
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


      // ------- end namespaces builder util ------------ //
      setNamespace(namespaces);
    } catch (error) {
    }
    setProposer(params.proposer.metadata);
    setId(id);
    showApproveWindow();

  }

  async function onSessionRequest({ topic, params, id }: Web3WalletTypes.SessionRequest) {
    console.log('session request ', params)
  }

  const handleFilterAndSearch = async (e) => {
    try {
      const keyword = e.target.value;
      console.log('keyword', keyword);
      console.log('props.web3wallet ', props.web3wallet);

      if (props.web3wallet) {

        props.web3wallet.on('session_proposal', onSessionProposal)

        props.web3wallet.on('session_request', onSessionRequest)
        const res = await props.web3wallet.pair({ uri: keyword })

      } else {
        console.log('Web3Wallet is not initialized');
      }
    } catch (error) {

      console.log(error, 'wc connect error')
    }


  };

  const showApproveWindow = async () => {
    setShowApprove(true)

  };

  const approveProposal = async () => {
    console.log('ID ', ID)
    setSyncing(true);
    await props.web3wallet.approveSession({
      id: ID,
      namespaces: namespaceObject
    });
  };


  const cancelProposal = async () => {
    console.log('ID ', ID)
    await props.web3wallet.rejectSession({
      id: ID,
      reason: getSdkError('USER_REJECTED_METHODS')
    })
    props.handleCloseIconClicked();
  };


  const deleteTopic = async (data: string) => {
    await props.web3wallet.core.pairing.disconnect({ topic: data })
    const pairings = props.web3wallet.core.pairing.getPairings()
    console.log('walletParing ', pairings)
    props.setSession(pairings)
  }


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
        <Typography sx={{ fontWeight: '700', fontSize: '18px' }}>{chrome.i18n.getMessage('Link_Mobile_Device')}</Typography>
      </Box>

      <Box>
        {props.sessions.map((session, index) => (
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
            <Button onClick={() => deleteTopic(session.topic)}>Delete</Button>
          </Box>
        ))}
      </Box>
      <Box sx={{ marginTop: '24px', width: '339px', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.12)' }}></Box>

      <Box sx={{ marginTop: '24px' }}>
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
        {/* <QrScanner
          onDecode={(result) => {
            if (result) {
              const uri = (result as any).text;

              setUri(uri);
            }
          }}
          onError={(error) => console.log(error?.message)}
        /> */}

      </Box>
      <Typography color='error.main' sx={{ margin: '8px auto 60px', color: 'rgba(255, 255, 255, 0.40)', fontSize: '12px', fontWeight: 400, width: '250px' }}>
        {chrome.i18n.getMessage('Scan_QR_code_to_active')}
      </Typography>

    </Box>
  );





  const approveWindow = () => (
    <Box
      px="18px"
      sx={{
        width: 'auto',
        height: '100%',
        background: 'linear-gradient(0deg, #121212, #11271D)',
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
      >
        <Typography sx={{ fontWeight: '700', fontSize: '18px' }}>{chrome.i18n.getMessage('Wallet_Confirmation')}</Typography>
      </Box>

      {proposer &&



        <Box sx={{
          margin: '18px 18px 0px 18px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          height: '100%'
        }}>

          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', margin: '0 18px 18px', gap: '18px' }}>
            <Divider />
            <Typography sx={{ textAlign: 'center', fontWeight: '700', fontSize: '16px', color: '#E6E6E6' }} >{chrome.i18n.getMessage('Allow')} {proposer.name} {chrome.i18n.getMessage('to_connect')}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img style={{ height: '60px', width: '60px', borderRadius: '30px', backgroundColor: 'text.secondary', objectFit: 'cover' }} src={proposer.icons} />
              <Typography sx={{ textAlign: 'center', color: '#BABABA', fontSize: '14px' }}>{proposer.description}</Typography>
            </Box>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1} sx={{ paddingBottom: '32px' }}>
            <LLSecondaryButton
              label={chrome.i18n.getMessage('Cancel')}
              fullWidth
              onClick={() => cancelProposal()}
            />
            <LLPrimaryButton
              label={syncing ? 'Approving...' : `${chrome.i18n.getMessage('Approve')}`}
              fullWidth
              type="submit"
              onClick={() => approveProposal()}
            />
          </Stack>
        </Box>
      }


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
      {showApprove ? approveWindow() : renderContent()}

    </Drawer>
  );
};

export default WalletConnect;
