import React, { useState, useEffect } from 'react';
import { Typography, Box, Drawer, Grid, Stack, InputBase, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { LLPrimaryButton, LLSecondaryButton, LLFormHelperText } from '../../FRWComponent';
import { useWallet } from 'ui/utils';
import { useForm, FieldValues } from 'react-hook-form';
import { storage } from '@/background/webapi';

const StyledInput = styled(InputBase)(({ theme }) => ({
  zIndex: 1,
  color: (theme.palette as any).neutral2.main,
  backgroundColor: (theme.palette as any).background.default,
  borderRadius: theme.spacing(2),
  marginTop: theme.spacing(2),
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(2),
    width: '100%',
  },
}));

interface EditNFTAddressProps {
  isAddAddressOpen: boolean;
  handleCloseIconClicked: () => void;
  handleCancelBtnClicked: () => void;
  handleAddBtnClicked: () => void;
  setAddress: any;
  isEdit?: boolean;
  address: string;
}

export interface NFTAddressValue {
  address: string;
}

const EditNFTAddress = (props: EditNFTAddressProps) => {
  const wallet = useWallet();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields, isValid, isDirty, isSubmitting },
  } = useForm({
    mode: 'all',
  });

  const [network, setNetwork] = useState('mainnet');

  const [isValidatingAddress, setIsValidatingAddress] = useState<boolean>(false);

  const checkAddress = async (address: string) => {
    //wallet controller api
    setIsValidatingAddress(true);
    const validatedResult = await wallet.checkAddress(address);
    setIsValidatingAddress(false);
    return validatedResult;
  };

  const onSubmit = async (data: FieldValues) => {
    const { address } = data;
    props.handleAddBtnClicked();
    reset();
    storage.set('ExampleNFTAddreess', address);
    props.setAddress(address);
  };

  const onCancelBtnClicked = () => {
    reset();
    props.handleCancelBtnClicked();
  };

  useEffect(() => {
    if (props.address && props.isEdit) {
      reset(
        {
          address: props.address,
        },
        {
          keepErrors: true,
          keepDirty: true,
          keepIsSubmitted: true,
          keepTouched: true,
          keepIsValid: false,
          keepSubmitCount: true,
        }
      );
    }
  }, [props.address]);

  const fetchNetworks = async () => {
    const currentNetwork = await wallet.getNetwork();
    setNetwork(currentNetwork);
  };

  useEffect(() => {
    fetchNetworks();
  }, []);

  const renderContent = () => (
    <Box
      px="18px"
      sx={{
        width: 'calc(100%-36px)',
        height: '300px',
        background: 'rgba(0, 0, 0, 0.5)',
        flexDirection: 'column',
      }}
    >
      <Grid
        container
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Grid item xs={1}></Grid>
        <Grid item xs={10}>
          <Typography variant="h1" align="center" py="14px" fontWeight="bold" fontSize="20px">
            {chrome.i18n.getMessage('Change__Address')}
          </Typography>
        </Grid>
        <Grid item xs={1}>
          <CloseIcon
            fontSize="medium"
            sx={{ color: 'icon.navi', cursor: 'pointer' }}
            onClick={props.handleCloseIconClicked}
          />
        </Grid>
      </Grid>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={0} sx={{ height: '180px' }}>
          <StyledInput
            autoComplete="off"
            placeholder={chrome.i18n.getMessage('Address')}
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
            isValid={!errors.address}
            isValidating={isValidatingAddress}
            errorMsg={`${errors.address?.message}`}
            successMsg={`Validated address in ${network}`}
          />
        </Stack>

        <Stack direction="row" spacing={1}>
          <LLSecondaryButton
            label={chrome.i18n.getMessage('Cancel')}
            fullWidth
            onClick={onCancelBtnClicked}
          />
          <LLPrimaryButton
            label={
              isSubmitting ? (
                <CircularProgress
                  color="primary"
                  size={22}
                  style={{ fontSize: '22px', margin: '8px' }}
                />
              ) : (
                chrome.i18n.getMessage('Change')
              )
            }
            fullWidth
            type="submit"
            disabled={!isDirty || !isValid}
          />
        </Stack>
      </form>
    </Box>
  );

  return (
    <Drawer anchor="bottom" open={props.isAddAddressOpen} transitionDuration={300}>
      {renderContent()}
    </Drawer>
  );
};

export default EditNFTAddress;
