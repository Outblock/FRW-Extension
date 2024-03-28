import React from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, FormControl, Select, Typography } from '@mui/material';

const stepBox = () => {

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center',alignItems: 'center',marginBottom:'40px'  }}>
      <Box sx={{display:'flex', flexDirection:'column', background:'rgba(255, 255, 255, 0.12)',borderRadius:'16px',padding:'24px',minWidth:'152px',height:'152px',}}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 'bold', color:'#41CC5D' }}
        >
          Step 1
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 'bold',color:'#FFFFFFCC' }}
        >
          Reset Wallet
        </Typography>

      </Box>
      <Box sx={{width:'40px',height:'1px',background:' rgba(255, 255, 255, 0.12)'}}></Box>
      <Box sx={{display:'flex', flexDirection:'column', background:'rgba(255, 255, 255, 0.12)',borderRadius:'16px',padding:'24px',height:'152px',minWidth:'152px'}}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 'bold', color:'#41CC5D' }}
        >
          Step 2
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 'bold',color:'#FFFFFFCC' }}
        >
          Import Recovery Phrase or Private Key
        </Typography>

      </Box>
      <Box sx={{width:'40px',height:'1px',background:' rgba(255, 255, 255, 0.12)'}}></Box>
      <Box sx={{display:'flex', flexDirection:'column', background:'rgba(255, 255, 255, 0.12)',borderRadius:'16px',padding:'24px',minWidth:'152px',height:'152px',}}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 'bold', color:'#41CC5D' }}
        >
          Step 3
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 'bold',color:'#FFFFFFCC' }}
        >
          Regain Access to
          Your Wallet
        </Typography>

      </Box>
    </Box>
  );
};


export default stepBox;
