import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { styled } from '@mui/system';
import SwitchUnstyled, { switchUnstyledClasses } from '@mui/core/SwitchUnstyled';
import { makeStyles } from '@mui/styles';
import {
  Box,
  Typography,
  Checkbox,
  CardActionArea,
  Divider,
  FormControlLabel,
  Alert,
  Snackbar
} from '@mui/material';
import { useWallet } from 'ui/utils';
import { LLHeader, LLPrimaryButton } from '@/ui/FRWComponent';
import Pc from '../../../FRWAssets/image/pc.png';
import Mobile from '../../../FRWAssets/image/mobile.png';
import circlecheck from '../../../FRWAssets/image/circlecheck.png';
import goto from '../../../FRWAssets/image/goto.png';


const Devices = () => {
  const usewallet = useWallet();
  const history = useHistory();

  const [showError, setShowError] = useState(false);

  const wallet = useWallet();
  const [privatekey, setKey] = useState('');
  const [publickey, setPublicKey] = useState('')
  const [showKey, setShowkey] = useState(null)
  const [devices, setDevices] = useState<any[]>([])
  const [currentId, setCurrentId] = useState<string>('')


  const getDevice = async () => {
    const installationId = await usewallet.openapi.getInstallationId();
    console.log(' installationId ', installationId)
    setCurrentId(installationId);
    const devices = await usewallet.openapi.deviceList();
    if (devices.data) {
      setDevices(devices.data)
    }
  }

  const setTab = async () => {
    await wallet.setDashIndex(3);
  };

  const toggleKey = async (index) => {
    if (showKey === index) {
      setShowkey(null)
    } else {
      setShowkey(index)
    }
  };

  useEffect(() => {
    setTab();
    getDevice();
  }, []);

  const handleErrorClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowError(false);
  };

  return (
    <div className="page">
      <LLHeader title={'Devices'} help={false} />
      {devices
        .sort((a, b) => (a.id === currentId ? -1 : 1))
        .map((item, index) => (
          <Box key={item.id} sx={{ width: '100%', margin: '8px 0' }} onClick={() => {
            if (item.id !== currentId) {
              history.push({
                pathname: '/dashboard/setting/deviceinfo',
                state: { deviceItem: item }
              });
            }
          }}>
            {item.id === currentId && (
              <Typography
                sx={{
                  color: '#FFFFFF66',
                  fontSize: '14px',
                  margin: '0 26px 8px',
                }}
              >
                Current Sessions
              </Typography>
            )}
            {index == 1 && (
              <Typography
                sx={{
                  color: '#FFFFFF66',
                  fontSize: '14px',
                  margin: '0 26px 8px',
                }}
              >
                Active Sessions
              </Typography>
            )}
            <Box
              sx={{
                display: 'flex',
                height: 'auto',
                position: 'relative',
                zIndex: '5',
                overflow: 'hidden',
                justifyContent: 'space-between',
                padding: '16px',
                margin: '0 26px 8px',
                backgroundColor: '#2C2C2C',
                borderRadius: '16px',
              }}
            >
              <Box sx={{ marginRight: '8px' }}>
                <img src={item.device_type == '1' ? Pc : Mobile} style={{ width: '24px', height: '24px' }} />
              </Box>
              <Box sx={{
                display: 'flex',
                height: 'auto',
                position: 'relative',
                zIndex: '5',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease-in-out',
                flexDirection: 'column',
              }}>

                <Typography
                  sx={{
                    color: '#FFF',
                    fontSize: '14px',
                    fontWeight: 400,
                  }}>
                  {item.device_name}
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.40)',
                    fontSize: '10px',
                  }}>
                  {item.user_agent}
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.40)',
                    fontSize: '10px',
                  }}>
                  {item.city}, {item.countryCode} Online
                </Typography>
              </Box>
              {item.id === currentId ?
                <Box sx={{display:'flex',alignItems:'center',justifyContent:'right',width:'16px'}}>
                  <img src={circlecheck} style={{ width: '16px', height: '16px' }} />
                </Box>
                :
                <Box sx={{display:'flex',alignItems:'center',justifyContent:'right',width:'16px'}}>
                  <img src={goto} style={{ width: '4px', height: '8px' }} />
                </Box>
              }
            </Box>
            {item.id === currentId && (
              <Box sx={{ padding: '24px 10px' }}>
                <Box sx={{ width: '100%', height: '1px', backgroundColor: '#FFFFFF1F' }}></Box>
              </Box>
            )}
          </Box>
        ))
      }
    </div >
  )
}

export default Devices;