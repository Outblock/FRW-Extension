import React, { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import { Box, Drawer, Grid, Typography, Stack, InputBase } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { LLPrimaryButton, LLSecondaryButton, LLSpinner } from '../../../FRWComponent';
import { useWallet } from 'ui/utils';
import { useForm, FieldValues } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import UnlinkSVG from 'ui/FRWAssets/svg/unlink.svg';

const useStyles = makeStyles(() => ({
  IconCheck: {
    display: 'inline',
    backgroundColor: '#00E075',
    borderRadius: '20px',
    width: '14px',
    height: '14px',
    padding: '3px',
  },
  normalLine: {
    width: '104px',
    height: '4px',
    marginTop: '24px',
    backgroundImage: 'linear-gradient(to left, #5F5F5F, #5A5A5A, #5F5F5F)',
    backgroundSize: '100% 100%',
  },
  pulseLine: {
    width: '104px',
    height: '4px',
    marginTop: '24px',
    backgroundImage: 'linear-gradient(to left, #2ae245, #000, #2ae245)',
    backgroundSize: '200% 100%',
    animation: '$gradient 5s ease infinite',
  },
  '@keyframes gradient': {
    '0%': {
      backgroundPosition: '100% 0%',
    },
    '50%': {
      backgroundPosition: '0% 0%',
    },
    '100%': {
      backgroundPosition: '100% 0%',
    },
  },
}));

interface UnlinkAccountProps {
  isAddAddressOpen: boolean;
  handleCloseIconClicked: () => void;
  handleCancelBtnClicked: () => void;
  handleAddBtnClicked: () => void;
  childAccount?: any;
  address?: string;
  userInfo?: any;
}

export interface AddressBookValues {
  name: string;
  address: string;
}

const UnlinkAccount = (props: UnlinkAccountProps) => {
  const history = useHistory();
  const classes = useStyles();

  const wallet = useWallet();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields, isValid, isDirty, isSubmitting },
  } = useForm({
    mode: 'all',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (data: FieldValues) => {
    setIsLoading(true);
    console.log('submit');
    wallet
      .unlinkChildAccountV2(props.address!)
      .then(async (resp) => {
        setIsLoading(false);
        props.handleCancelBtnClicked();
        wallet.listenTransaction(
          resp,
          true,
          `${props.address} unlinked`,
          `You have unlinked the child account ${props.address} from your account. \nClick to view this transaction.`
        );
        await wallet.setDashIndex(0);
        history.push('/dashboard?activity=1');
      })
      .catch(() => {
        setIsLoading(false);
        console.log('failed ');
      });
  };

  const onCancelBtnClicked = () => {
    props.handleCancelBtnClicked();
  };

  useEffect(() => {
    console.log('submit');
  }, []);

  const renderContent = () => (
    <Box
      px="18px"
      sx={{
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.5)',
        flexDirection: 'column',
        display: 'flex',
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
          <Typography variant="h1" align="center" py="14px" fontSize="18px">
            {chrome.i18n.getMessage('Unlink_Confirmation')}
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
      <Box sx={{ display: 'flex', gap: '18px', marginBottom: '0px' }}>
        <Stack
          direction="column"
          spacing="12px"
          sx={{ justifyContent: 'space-between', width: '80%', margin: '0 auto' }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '83px',
                alignItems: 'center',
              }}
            >
              {props.childAccount && (
                <img
                  style={{
                    height: '60px',
                    width: '60px',
                    borderRadius: '30px',
                    backgroundColor: 'text.secondary',
                    objectFit: 'cover',
                  }}
                  src={props.childAccount.thumbnail.url}
                />
              )}
              {props.childAccount && (
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: '#5E5E5E',
                    width: '100%',
                    textAlign: 'center',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {props.childAccount.name}
                </Typography>
              )}
            </Box>
            {/* {isLoading ? (
              <Box className={classes.pulseLine}></Box>
            ) : (
              <Box className={classes.normalLine}></Box>
            )} */}

            <img src={UnlinkSVG} />

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '83px',
                alignItems: 'center',
              }}
            >
              {props.userInfo && (
                <img
                  style={{
                    height: '60px',
                    width: '60px',
                    borderRadius: '30px',
                    backgroundColor: 'text.secondary',
                    objectFit: 'cover',
                  }}
                  src={props.userInfo.avatar}
                />
              )}
              {props.userInfo && (
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: '#5E5E5E',
                    width: '100%',
                    textAlign: 'center',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {props.userInfo?.nickname}
                </Typography>
              )}
            </Box>
          </Box>
        </Stack>
      </Box>
      <Box
        sx={{
          overflow: 'hidden',
          marginTop: '24px',
          marginBottom: '40px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          padding: '16px 20px',
          justifyContent: 'space-between',
          backgroundColor: '#292929',
        }}
      >
        <Typography
          sx={{
            fontSize: '14px',
            textTransform: 'uppercase',
            color: '#5E5E5E',
          }}
        >
          {chrome.i18n.getMessage('Things_you_should_know')}
        </Typography>
        <Typography sx={{ fontSize: '14px' }} color="text.secondary">
          {chrome.i18n.getMessage('Unlink_Message')}
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1 }}></Box>
      <Stack direction="row" spacing={1} sx={{ paddingBottom: '32px' }}>
        <LLSecondaryButton
          label={chrome.i18n.getMessage('Cancel')}
          fullWidth
          onClick={onCancelBtnClicked}
        />
        <LLPrimaryButton
          label={isLoading ? <LLSpinner size={28} /> : 'Confirm'}
          fullWidth
          type="submit"
          onClick={onSubmit}
        />
      </Stack>
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
          height: '410px',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          borderRadius: '18px 18px 0px 0px',
        },
      }}
    >
      {renderContent()}
    </Drawer>
  );
};

export default UnlinkAccount;
