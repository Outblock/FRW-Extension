import CloseIcon from '@mui/icons-material/Close';
import { Typography, Box, Drawer, Grid, Stack, InputBase, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';
import { useForm, type FieldValues } from 'react-hook-form';

import type { Contact } from 'background/service/networkModel';
import { useWallet } from 'ui/utils';

import { LLPrimaryButton, LLSecondaryButton, LLFormHelperText } from '../../../FRWComponent';
import { withPrefix } from '../../../utils/address';

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

interface AddOrEditAddressProps {
  isAddAddressOpen: boolean;
  handleCloseIconClicked: () => void;
  handleCancelBtnClicked: () => void;
  handleAddBtnClicked: () => void;
  editableContact?: Contact;
  isEdit?: boolean;
}

export interface AddressBookValues {
  name: string;
  address: string;
}

const AddOrEditAddress = (props: AddOrEditAddressProps) => {
  const wallet = useWallet();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields, isValid, isDirty, isSubmitting },
  } = useForm({
    mode: 'all',
  });

  const [isValidatingAddress, setIsValidatingAddress] = useState<boolean>(false);

  const checkAddress = async (address: string) => {
    //wallet controller api
    setIsValidatingAddress(true);
    const validatedResult = await wallet.checkAddress(address);
    setIsValidatingAddress(false);
    return validatedResult ? true : false;
  };

  const onSubmit = async (data: FieldValues) => {
    const { name, address } = data;
    const formattedAddress = withPrefix(address);

    let response;

    if (props.editableContact && props.isEdit) {
      response = await wallet.openapi.editAddressBook(
        props.editableContact.id,
        name,
        formattedAddress!
      );
    } else {
      response = await wallet.openapi.addExternalAddressBook(name, formattedAddress!);
    }

    if (response.status === 200) {
      reset();
      wallet.refreshAddressBook();
      props.handleAddBtnClicked();
    }
  };

  const onCancelBtnClicked = () => {
    reset();
    props.handleCancelBtnClicked();
  };

  useEffect(() => {
    if (props.editableContact && props.isEdit) {
      reset(
        {
          name: props.editableContact.contact_name,
          address: props.editableContact.address,
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
  }, [props?.editableContact, props?.isEdit, reset]);

  const renderContent = () => (
    <Box
      px="18px"
      sx={{
        width: 'auto',
        height: '415px',
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
            {props.isEdit
              ? chrome.i18n.getMessage('Edit__Address')
              : chrome.i18n.getMessage('Add__Address')}
          </Typography>
        </Grid>
        <Grid item xs={1}>
          <CloseIcon
            fontSize="medium"
            sx={{ color: 'icon.navi', cursor: 'pointer', align: 'center' }}
            onClick={props.handleCloseIconClicked}
          />
        </Grid>
      </Grid>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={0} sx={{ height: '280px' }}>
          <StyledInput
            autoComplete="off"
            placeholder={chrome.i18n.getMessage('Name')}
            sx={{ height: '56px' }}
            {...register('name', {
              setValueAs: (v) => v.trim(),
              required: 'Name is required',
            })}
          />
          <LLFormHelperText
            inputValue={dirtyFields.name}
            isValid={!errors.name}
            isValidating={false}
            errorMsg={`${errors.name?.message}`}
          />
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
            successMsg={chrome.i18n.getMessage('Validated__address')}
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
              ) : props.isEdit ? (
                chrome.i18n.getMessage('Update')
              ) : (
                chrome.i18n.getMessage('Add')
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
    <Drawer
      anchor="bottom"
      open={props.isAddAddressOpen}
      transitionDuration={300}
      PaperProps={{
        sx: {
          width: '100%',
          height: '415px',
          bgcolor: 'background.paper',
          borderRadius: '18px 18px 0px 0px',
        },
      }}
    >
      {renderContent()}
    </Drawer>
  );
};

export default AddOrEditAddress;
