import React, { useState, useEffect } from 'react';
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
import CloseIcon from '@mui/icons-material/Close';
import {
  LLPrimaryButton,
  LLSecondaryButton,
  LLFormHelperText,
} from '../../../FRWComponent';
import { useWallet } from 'ui/utils';
import { useForm, FieldValues } from 'react-hook-form';
import { withPrefix } from '../../../utils/address';
import { Contact } from 'background/service/networkModel';

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

interface EditAccountProps {
  isEdit: boolean;
  handleCloseIconClicked: () => void;
  handleCancelBtnClicked: () => void;
  handleAddBtnClicked: () => void;
  nickname: string;
  setNickname: (nickname: string) => void;
  avatar: string;
}


const EditAccount = (props: EditAccountProps) => {
  
  const wallet = useWallet();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields, isValid, isDirty, isSubmitting },
  } = useForm({
    mode: 'all',
  });

  const onSubmit = async (data: FieldValues) => {
    console.log(data)
    const { nickname, avatar } = data;
    await props.setNickname(nickname);

    const response = await wallet.openapi.updateProfile(
      nickname,
      avatar,
    );

    if (response.status === 200) {
      reset();
      props.handleAddBtnClicked();
    }
  };

  const onCancelBtnClicked = () => {
    reset();
    props.handleCancelBtnClicked();
  };

  useEffect(() => {
    reset(
      {
        nickname: props.nickname,
        avatar: props.avatar,
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
  }, [props.avatar, props.nickname]);

  const renderContent = () => (
    <Box
      px="18px"
      sx={{
        width: '100%',
        height: '400px',
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
          <Typography
            variant="h1"
            align="center"
            py="14px"
            fontWeight="bold"
            fontSize="20px"
          >
            Edit Account
          </Typography>
        </Grid>
        <Grid item xs={1}>
          <CloseIcon
            fontSize="medium"
            sx={{ color: 'icon.navi', cursor: 'pointer', align: 'center'}}
            onClick={props.handleCloseIconClicked}
          />
        </Grid>
      </Grid>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={0} sx={{ display:'none', opacity: '0%', height:'0px', margin:'0px', padding:'0px' }}>
          <StyledInput
            autoComplete="off"
            placeholder={chrome.i18n.getMessage('Avatar')}
            sx={{ height: '56px' }}
            {...register('avatar', {
              setValueAs: (v) => v.trim(),
            })}
          />
          <LLFormHelperText
            inputValue={dirtyFields.avatar}
            isValid={!errors.avatar}
            isValidating={false}
            errorMsg={`${errors.avatar?.message}`}
          />
        </Stack>
        <Stack spacing={0} sx={{ height: '260px' }}>
          <StyledInput
            autoComplete="off"
            placeholder={chrome.i18n.getMessage('Nickname')}
            sx={{ height: '56px' }}
            {...register('nickname', {
              setValueAs: (v) => v.trim(),
              required: 'Nickname is required',
            })}
          />
          <LLFormHelperText
            inputValue={dirtyFields.nickname}
            isValid={!errors.nickname}
            isValidating={false}
            errorMsg={`${errors.nickname?.message}`}
          />
        </Stack>


        <Stack direction="row" spacing={1} sx={{paddingBottom:'5px',}}>
          <LLSecondaryButton
            label="Cancel"
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
              ) : 'Update'
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
      open={props.isEdit}
      transitionDuration={300}
      PaperProps={{
        sx: { width: '100%', height: '65%', bgcolor: 'background.paper', borderRadius: '18px 18px 0px 0px' },
      }}
    >
      {renderContent()}
    </Drawer>
  );
};

export default EditAccount;
