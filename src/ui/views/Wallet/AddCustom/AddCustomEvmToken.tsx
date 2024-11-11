import React, { useState } from 'react';
import {
  Typography,
  Box,
  IconButton,
  Stack,
  InputBase,
  CircularProgress,
  FormControl
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useHistory } from 'react-router-dom';
import {
  LLPrimaryButton,
  LLFormHelperText,
} from '../../../FRWComponent';
import { useWallet } from 'ui/utils';
import { useForm } from 'react-hook-form';
import { withPrefix, isValidEthereumAddress } from '../../../utils/address';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Contract, ethers } from 'ethers'
import { storage } from '@/background/webapi';
import AddCustomEvmForm from './CustomEvmForm';
import { EVM_ENDPOINT } from 'consts';

const StyledInput = styled(InputBase)(({ theme }) => ({
  zIndex: 1,
  color: (theme.palette as any).text,
  backgroundColor: (theme.palette as any).background.default,
  borderRadius: theme.spacing(2),
  marginTop: '8px',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(2),
    width: '100%',
  },
}));




const AddCustomEvmToken = () => {

  const usewallet = useWallet();
  const history = useHistory();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, dirtyFields, isValid, isDirty, isSubmitting },
  } = useForm({
    mode: 'all',
  });
  const address = watch('address');
  const [isValidatingAddress, setIsValidatingAddress] =
    useState<boolean>(false);
  const [isLoading, setLoading] =
    useState<boolean>(false);
  const [coinInfo, setCoinInfo] = useState<any>({});
  const [validationError, setValidationError] = useState<boolean>(false);


  const checkAddress = async (address: string) => {
    //usewallet controller api
    setIsValidatingAddress(true);
    const validatedResult = await isValidEthereumAddress(address);
    setIsValidatingAddress(false);
    return validatedResult;
  };

  const addCustom = async (address) => {
    setLoading(true)
    const contractAddress = withPrefix(address)!.toLowerCase();
    const network = await usewallet.getNetwork();
    const provider = new ethers.JsonRpcProvider(EVM_ENDPOINT[network]);

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

    if (decimals !== null && name !== null && symbol !== null) {
      const info = {
        coin: name,
        unit: symbol,
        icon: "",
        price: 0,
        change24h: 0,
        total: 0,
        address: contractAddress?.toLowerCase(),
        decimals: Number(decimals),
      };

      const flowId = await usewallet.getAssociatedFlowIdentifier(contractAddress);
      info['flowIdentifier'] = flowId;
      setCoinInfo(info);
      setLoading(false);
    } else {
      console.error("Failed to retrieve all required data for the token.");
      setIsValidatingAddress(false);
      setValidationError(true);
      setLoading(false);
    }

  };

  const importCustom = async (address) => {
    setLoading(true);
    const contractAddress = withPrefix(address)!.toLowerCase();
    const network = await usewallet.getNetwork();

    let evmCustomToken = await storage.get(`${network}evmCustomToken`) || [];
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

    await storage.set(`${network}evmCustomToken`, evmCustomToken);
    await usewallet.openapi.refreshEvmGitToken(network);
    setLoading(false);
    history.replace({ pathname: history.location.pathname, state: { refreshed: true } });
    history.goBack();

  };



  const Header = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <IconButton onClick={history.goBack} sx={{ height: '40px' }}>
          <ArrowBackIcon sx={{ color: 'icon.navi' }} />
        </IconButton>
        <Typography
          variant="h1"
          sx={{
            py: '14px',
            alignSelf: 'center',
            fontSize: '20px',
          }}
        >
          Add Custom Token
        </Typography>
        <Box></Box>
      </Box>
    );
  };

  const renderContent = () => (
    <Box
      px="18px"
      sx={{
        width: 'auto',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.5)',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <Header />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: '100px' }}>
          <Stack spacing={2} sx={{ flexGrow: 1 }}>

            {/* Contract Address Input */}
            <FormControl sx={{ width: '100%' }}>
              <Typography
                sx={{
                  color: 'var(--Basic-foreground-White, var(--Basic-foreground-White, #FFF))',
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: 700,
                  lineHeight: '24px',
                  letterSpacing: '-0.084px'
                }}
              >
                Token contract address
              </Typography>
              <StyledInput
                autoComplete="off"
                placeholder='Contract Address'
                sx={{ height: '64px' }}
                {...register('address', {
                  required: 'Address is required',
                  validate: {
                    check: async (v) => await checkAddress(v!),
                  },
                })}
              />
              <LLFormHelperText
                inputValue={dirtyFields.address}
                isValid={!errors.address && !validationError}
                isValidating={isValidatingAddress}
                errorMsg={`Invalid ERC20 address`}
                successMsg={chrome.i18n.getMessage('Validated__address')}
              />
            </FormControl>

          </Stack>
          {coinInfo.address && !isLoading &&
            <AddCustomEvmForm coinInfo={coinInfo} />
          }
        </Box>

        {/* Button Container */}
        {coinInfo.address ? (
          <Box
            sx={{
              position: 'sticky',
              bottom: '0px',
              padding: '16px 0 48px',
              backgroundColor: 'rgba(0, 0, 0, 1)', // Optional for a clearer UI
            }}
          >
            <LLPrimaryButton
              label={
                isLoading ? (
                  <CircularProgress
                    color="primary"
                    size={22}
                    style={{ fontSize: '14px', margin: '8px' }}
                  />
                ) : chrome.i18n.getMessage('Import')
              }
              fullWidth
              onClick={() => importCustom(address)}
              disabled={isLoading || !isValid}
            />
          </Box>
        ) : (
          <Box
            sx={{
              position: 'sticky',
              bottom: '0px',
              padding: '16px 0 48px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional for a clearer UI
            }}
          >
            <LLPrimaryButton
              label={
                isLoading ? (
                  <CircularProgress
                    color="primary"
                    size={22}
                    style={{ fontSize: '14px', margin: '8px' }}
                  />
                ) : chrome.i18n.getMessage('Add')
              }
              fullWidth
              onClick={() => addCustom(address)}
              disabled={isLoading || !isValid}
            />
          </Box>
        )}
      </Box>
    </Box>

  );

  return (
    <Box>
      {renderContent()}
    </Box>
  );
};

export default AddCustomEvmToken;
