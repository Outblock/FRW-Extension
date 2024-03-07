import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Drawer, IconButton, ListItem, ListItemIcon, ListItemText, Avatar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useWallet } from 'ui/utils';
import { withPrefix } from 'ui/utils/address';
import {
  LLSpinner,
} from 'ui/FRWComponent';
import {
  keyringService,
} from 'background/service';
import { storage } from 'background/webapi';



import { UserInfoResponse } from 'background/service/networkModel';

interface TransferConfirmationProps {
  isConfirmationOpen: boolean;
  data: any;
  handleCloseIconClicked: () => void;
  handleCancelBtnClicked: () => void;
  handleAddBtnClicked: () => void;
  userInfo: UserInfoResponse;
  current: {};
}


const Popup = (props: TransferConfirmationProps) => {


  const usewallet = useWallet();

  const getKeyring = async () => {
    const keyringState = await storage.get('keyringState');
    const keyring = await  keyringService.loadStore(keyringState);
    console.log('keyring', keyring)
    console.log('keyringState', keyringState)
  }

  useEffect(() => {
    getKeyring();
  }, [])
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', px: '16px' }}>
        <Box component="nav" key={props.userInfo.username}>
          <ListItem
            disablePadding
            key={props.userInfo.username}
          >
            <ListItemIcon>
              <Avatar
                component="span"
                src={props.userInfo.avatar}
                sx={{ width: '24px', height: '24px', ml: '4px' }}
                alt="avatar"
              />
            </ListItemIcon>
            <ListItemText>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Typography
                  variant="body1"
                  component="div"
                  display="inline"
                  color='text'
                >
                  {'@' + props.userInfo.username}
                  {props.current['address']}
                </Typography>
              </Box>
            </ListItemText>
          </ListItem>
        </Box>
        <Box
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
            display: 'flex'
          }}
        >
          <Box></Box>
          <Box>
            Popup Token
          </Box>
          <Box onClick={props.handleCancelBtnClicked}>
            <IconButton>
              <CloseIcon
                fontSize="medium"
                sx={{ color: 'icon.navi', cursor: 'pointer' }}
              />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', mx: '18px', mb: '35px', mt: '10px' }}>
      </Box>


    </Drawer>
  );
}


export default Popup;