import { Box, Grid, IconButton, Typography } from '@mui/material';
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useRouteMatch } from 'react-router-dom';

import { storage } from '@/background/webapi';
import { LLHeader } from '@/ui/FRWComponent';
import { getStoragedAccount } from 'background/utils/getStoragedAccount';
import { useWallet } from 'ui/utils';

import IconCopy from '../../../../components/iconfont/IconCopy';
interface State {
  password: string;
}

const Keydetail = () => {
  const location = useLocation<State>();
  const usewallet = useWallet();
  const [privatekey, setKey] = useState('');
  const [publickey, setPublicKey] = useState('');
  const [hashAlgorithm, setHash] = useState('');
  const [signAlgorithm, setSign] = useState('');

  const verify = useCallback(async () => {
    try {
      const pwd = location.state.password;
      const result = await usewallet.getKey(pwd);
      setKey(result);

      const pubKey = await storage.get('pubKey');
      const account = await getStoragedAccount();
      const { hashAlgo, signAlgo } = account;

      setPublicKey(pubKey);
      setHash(hashAlgo);
      setSign(signAlgo);
    } catch (error) {
      console.error('Error during verification:', error);
    }
  }, [location.state.password, usewallet, setKey, setPublicKey, setHash, setSign]);

  const setTab = useCallback(async () => {
    try {
      await usewallet.setDashIndex(3); // Set the dashboard index in the wallet
    } catch (error) {
      console.error('Error setting tab:', error);
    }
  }, [usewallet]);

  useEffect(() => {
    setTab();
    verify();
  }, [verify, setTab]);

  const CredentialBox = ({ data }) => {
    return (
      <>
        <Box
          sx={{
            // border: '2px solid #5E5E5E',
            borderRadius: '12px',
            position: 'relative',
            width: '364px',
            marginLeft: '17px',
            padding: '5px 16px',
            lineBreak: 'anywhere',
            marginTop: '0px',
            backgroundColor: '#333333',
          }}
        >
          <Typography
            variant="body1"
            display="inline"
            color="text.secondary"
            sx={{
              alignSelf: 'center',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: '400',
              lineHeight: '24px',
              // color: '#E6E6E6',
              padding: '16px 0',
            }}
          >
            {data}
          </Typography>
          <Grid container direction="row" justifyContent="end" alignItems="end">
            <IconButton
              edge="end"
              onClick={() => {
                navigator.clipboard.writeText(data);
              }}
              // sx={{ marginLeft:'380px'}}
            >
              <IconCopy
                style={{
                  height: '20px',
                  width: '20px',
                }}
              />
            </IconButton>
          </Grid>
        </Box>
      </>
    );
  };

  return (
    <Box className="page">
      <LLHeader title={chrome.i18n.getMessage('Private__Key')} help={false} />
      <Typography variant="body1" align="left" py="14px" px="20px" fontSize="17px">
        {chrome.i18n.getMessage('Private__Key')}
      </Typography>
      <CredentialBox data={privatekey} />
      <br />
      <Typography variant="body1" align="left" py="14px" px="20px" fontSize="17px">
        {chrome.i18n.getMessage('Public__Key')}
      </Typography>
      <CredentialBox data={publickey} />
      <br />

      <Box
        sx={{
          display: 'flex',
          px: '20px',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingY: '30px',
        }}
      >
        <Box
          sx={{
            borderLeft: 1,
            px: '15px',
            borderColor: '#333333',
          }}
        >
          <Typography variant="body1" color="text.secondary" align="left" fontSize="14px">
            {chrome.i18n.getMessage('Hash__Algorithm')} <br />
            {hashAlgorithm}
          </Typography>
        </Box>
        <Box
          sx={{
            borderLeft: 1,
            borderColor: '#333333',
            px: '15px',
          }}
        >
          <Typography variant="body1" color="text.secondary" align="left" fontSize="14px">
            {chrome.i18n.getMessage('Sign__Algorithm')} <br />
            {signAlgorithm}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Keydetail;
