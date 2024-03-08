import React, { useState, useEffect } from 'react';
import { Box, ListItemButton, Typography, Drawer, IconButton, ListItem, ListItemIcon, ListItemText, Avatar, CardMedia } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useWallet } from 'ui/utils';
import { useHistory } from 'react-router-dom';
import popLock from 'ui/FRWAssets/svg/popLock.svg';
import popAdd from 'ui/FRWAssets/svg/popAdd.svg';
import popImport from 'ui/FRWAssets/svg/popImport.svg';




import { UserInfoResponse } from 'background/service/networkModel';

interface TransferConfirmationProps {
  isConfirmationOpen: boolean;
  data: any;
  handleCloseIconClicked: () => void;
  handleCancelBtnClicked: () => void;
  handleAddBtnClicked: () => void;
  userInfo: UserInfoResponse;
  current: any;
}


const Popup = (props: TransferConfirmationProps) => {


  const usewallet = useWallet();
  const history = useHistory();
  // const [validated, setValidated] = useState<any>(null);


  return (
    <Drawer
      anchor="bottom"
      sx={{ zIndex: '1500 !important' }}
      open={props.isConfirmationOpen}
      transitionDuration={300}
      PaperProps={{
        sx: { width: '100%', height: 'auto', background: '#222', borderRadius: '18px 18px 0px 0px', },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', px: '20px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '24px', margin: '20px 0', alignItems: 'center', }}>
          <Box sx={{ width: '40px' }}></Box>
          <Typography
            variant="body1"
            component="div"
            display="inline"
            color='text'
            sx={{ fontSize: '18px', textAlign: 'center', lineHeight: '24px', fontWeight: '700' }}
          >
            Accounts
          </Typography>
          <Box onClick={props.handleCancelBtnClicked}>
            <IconButton>
              <CloseIcon
                fontSize="medium"
                sx={{ color: 'icon.navi', cursor: 'pointer' }}
              />
            </IconButton>
          </Box>
        </Box>
        <Box component="nav" key={props.userInfo.username}>
          <ListItem
            disablePadding
            key={props.userInfo.username}
          >
            <ListItemIcon>
              <Avatar
                component="span"
                src={props.userInfo.avatar}
                sx={{ width: '32px', height: '32px', }}
                alt="avatar"
              />
            </ListItemIcon>
            <ListItemText>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Typography
                  variant="body1"
                  component="div"
                  display="inline"
                  color='text'
                >
                  {props.userInfo.username}
                </Typography>
                <Typography
                  variant="body1"
                  component="div"
                  display="inline"
                  color='text'
                >
                  {props.current['address']}
                </Typography>
              </Box>
            </ListItemText>
          </ListItem>
        </Box>
        <Box sx={{ height: '1px', width: '100%', margin: '16px 0', backgroundColor: 'rgba(255, 255, 255, 0.12)' }}></Box>

        <Box
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'column',
            display: 'flex'
          }}
        >
          <ListItem disablePadding onClick={async () => {
            await usewallet.lockAdd();
            // history.push('/add');
          }}>
            <ListItemButton sx={{ padding: '0', margin: '0' }}>
              <ListItemIcon
                sx={{
                  width: '24px',
                  minWidth: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                <CardMedia component="img" sx={{ width: '24px', height: '24px' }} image={popAdd} />
              </ListItemIcon>
              <Typography
                variant="body1"
                component="div"
                display="inline"
                color='text'
                sx={{ fontSize: '12px' }}
              >
                {'Create New Account'}
              </Typography>
            </ListItemButton>
          </ListItem>
          <ListItem sx={{ marginTop: '16px' }} disablePadding onClick={async () => {
            await usewallet.lockImport();
            // history.push('/add');
          }}>
            <ListItemButton sx={{ padding: '0', margin: '0' }}>
              <ListItemIcon
                sx={{
                  width: '24px',
                  minWidth: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                <CardMedia component="img" sx={{ width: '24px', height: '24px' }} image={popImport} />
              </ListItemIcon>
              <Typography
                variant="body1"
                component="div"
                display="inline"
                color='text'
                sx={{ fontSize: '12px' }}
              >
                {'Import Existing Account'}
              </Typography>
            </ListItemButton>
          </ListItem>
          
          <ListItem sx={{ marginTop: '16px' }} disablePadding onClick={async () => {
            await usewallet.lockWallet();
            history.push('/unlock');
          }}>
            <ListItemButton sx={{ padding: '0', margin: '0' }}>
              <ListItemIcon
                sx={{
                  width: '24px',
                  minWidth: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                <CardMedia component="img" sx={{ width: '24px', height: '24px' }} image={popLock} />
              </ListItemIcon>
              <Typography
                variant="body1"
                component="div"
                display="inline"
                color='text'
                sx={{ fontSize: '12px' }}
              >
                {chrome.i18n.getMessage('Lock__Wallet')}
              </Typography>
            </ListItemButton>
          </ListItem>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', mx: '18px', mb: '35px', mt: '10px' }}>
      </Box>


    </Drawer>
  );
}


export default Popup;