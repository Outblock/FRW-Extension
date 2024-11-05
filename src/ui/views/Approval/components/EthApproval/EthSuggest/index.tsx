import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApproval, useWallet } from 'ui/utils';
import { withPrefix } from 'ui/utils/address';
import { ThemeProvider } from '@mui/system';
import { Stack, Box, Typography, Divider, CardMedia } from '@mui/material';
import theme from 'ui/style/LLTheme';
// import EthMove from '../EthMove';
import {
  LLPrimaryButton,
  LLSecondaryButton,
  LLConnectLoading
} from 'ui/FRWComponent';
import { Contract, ethers } from 'ethers';
import { storage } from '@/background/webapi';


const EthSuggest = (data) => {
  const { state } = useLocation<{
    showChainsModal?: boolean;
  }>();
  const [, resolveApproval, rejectApproval] = useApproval();
  const { t } = useTranslation();
  const usewallet = useWallet();
  const [isLoading, setLoading] = useState(false);
  const [defaultChain, setDefaultChain] = useState('FLOW');
  const [isEvm, setIsEvm] = useState(false)

  // TODO: replace default logo
  const [logo, setLogo] = useState('')
  const [evmAddress, setEvmAddress] = useState('')
  const [isValidatingAddress, setIsValidatingAddress] =
    useState<boolean>(false);
  const [coinInfo, setCoinInfo] = useState<any>({});
  const init = async () => {

    console.log('suggest data ', data)
    const contractAddress = data.params.data.params.options.address;
    addCustom(contractAddress);
  };


  const addCustom = async (address) => {
    setLoading(true)
    const contractAddress = withPrefix(address)!.toLowerCase();
    const provider = new ethers.JsonRpcProvider("https://mainnet.evm.nodes.onflow.org/");
    const evmAddress = await usewallet.getEvmAddress();
    const ftContract = new Contract(
      contractAddress!,
      [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function totalSupply() view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function balanceOf(address) view returns (uint)"
      ],
      provider
    );

    // Helper function to handle contract calls
    async function getContractData(contract, method, ...args) {
      try {
        const result = await contract[method](...args);
        if (!result || result === '0x') {
          console.error(`No data returned for method: ${method}`);
          return null;
        }
        return result;
      } catch (error) {
        console.error(`Error calling ${method}:`, error);
        return null;
      }
    }

    const decimals = await getContractData(ftContract, 'decimals');
    const name = await getContractData(ftContract, 'name');
    const symbol = await getContractData(ftContract, 'symbol');
    const balance = await ftContract.balanceOf(evmAddress)
    console.log('balance ', evmAddress, balance)

    if (decimals !== null && name !== null && symbol !== null) {
      const info = {
        coin: name,
        unit: symbol,
        icon: "",
        price: 0,
        change24h: 0,
        total: Number(balance) / Math.pow(10, Number(decimals)),
        address: contractAddress?.toLowerCase(),
        decimals: Number(decimals),
      };

      const flowId = await usewallet.getAssociatedFlowIdentifier(contractAddress);
      info['flowIdentifier'] = flowId;
      setCoinInfo(info);
      setLoading(false);
    } else {
      console.error("Failed to retrieve all required data for the token.");
      setLoading(false);
    }

  };


  const importCustom = async () => {
    setLoading(true);
    const contractAddress = withPrefix(data.params.data.params.options.address)?.toLowerCase;
    let evmCustomToken = await storage.get('evmCustomToken') || [];
    const network = await usewallet.getNetwork();
    // Filter out any empty objects from evmCustomToken
    evmCustomToken = evmCustomToken.filter(token => Object.keys(token).length > 0);

    // Find the index of the existing token
    const existingIndex = evmCustomToken.findIndex((token) => token.address === contractAddress);

    if (existingIndex !== -1) {
      evmCustomToken[existingIndex] = coinInfo;
      console.log("Token already exists in evmCustomToken, replacing with new info");
    } else {
      evmCustomToken.push(coinInfo);
      console.log("New token added to evmCustomToken");
    }

    await storage.set('evmCustomToken', evmCustomToken);
    await usewallet.openapi.refreshEvmGitToken(network);
    setLoading(false);
  };

  const handleCancel = () => {
    rejectApproval(false);
  };

  const handleAllow = async () => {
    await importCustom();
    resolveApproval(true);
  };

  useEffect(() => {
    init();
  }, []);

  const renderContent = () => (
    <Box sx={{ padingTop: '18px', height: '100vh' }}>
      {isLoading ?
        <LLConnectLoading logo={logo} />
        :
        <Box sx={{
          margin: '18px 18px 0px 18px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          height: '100%',
          background: 'linear-gradient(0deg, #121212, #11271D)'
        }}>
          {coinInfo.address &&
            <Box sx={{ display: 'flex', flexDirection: 'column', margin: '18px', gap: '18px' }}>
              <Box sx={{ display: 'flex', gap: '16px', marginBottom: '0px', flexDirection: 'column', justifyContent: 'center',alignItems:'center' }}>
                <Typography sx={{
                  color: 'var(--text-night-text-1, var(--Basic-foreground-White, #FFF))',
                  fontFamily: 'Inter',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: 700,
                  letterSpacing: '-0.252px',
                }}>Add Suggested Token
                </Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: '400',color:'#FFFFFFCC' }}>Would you like to import this token?</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '16px', backgroundColor: '#28282A' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CardMedia
                    component="img"
                    image={data.params.data.params.options.image ?? 'https://lilico.app/placeholder-2.0.png'}
                    sx={{
                      height: '40px',
                      width: '40px',
                      marginRight: '12px',
                      backgroundColor: '#282828',
                      borderRadius: '24px',
                      objectFit: 'cover',
                    }}
                  />
                  <Typography sx={{
                    color: 'var(--text-night-text-1, var(--Basic-foreground-White, #FFF))',
                    fontFamily: 'Inter',
                    fontSize: '16px',
                    fontStyle: 'normal',
                    fontWeight: 700,
                    letterSpacing: '-0.16px',
                  }}
                  >{coinInfo.coin}</Typography>

                </Box>
                <Typography sx={{ fontSize: '16px', fontWeight: '400', color: '#FFFFFF' }}>{coinInfo.total} {coinInfo.unit}</Typography>
              </Box>
            </Box>
          }


          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1}
            sx={{
              position: 'sticky',
              bottom: '32px',
              padding: '16px 0',
            }}>
            <LLSecondaryButton
              label={chrome.i18n.getMessage('Cancel')}
              fullWidth
              onClick={handleCancel}
            />
            <LLPrimaryButton
              label={chrome.i18n.getMessage('Import')}
              fullWidth
              type="submit"
              onClick={handleAllow}
            />
          </Stack>
        </Box>
      }
    </Box >
  );

  return (
    <ThemeProvider theme={theme}>
      <Box>
        {renderContent()}
      </Box>
    </ThemeProvider>
  );
};

export default EthSuggest;
