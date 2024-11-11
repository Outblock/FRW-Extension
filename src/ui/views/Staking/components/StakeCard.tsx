import React from 'react';
import { Typography, Box } from '@mui/material';
import { useHistory } from 'react-router-dom';

const StakeCard = ({ name, img, short, amount, node }) => {

  const history = useHistory();

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: '#1F1F1F',
        display: 'flex',
        borderRadius: '12px',
        overflow: 'hidden',
        justifyContent: 'flex-satrt',
        alignItems: 'center',
        marginBottom: '4px',
        px: '18px',
        gap: '12px',
        '&:hover': {
          backgroundColor: 'neutral.main',
        },
      }}
      onClick={() =>
        history.push({
          pathname: `/dashboard/staking/page/${node}/null`,
        })
      }
    >
      <Box sx={{py:'12px',display:'flex'}}>
        <img
          src={img || 'https://lilico.app/placeholder-2.0.png'}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '34px',
            marginRight:'12px',
            backgroundColor: '#282828',
          }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body1" sx={{ fontSize: '14px' }}>
            {name}{' '}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: '12px' }}
          >
            {short}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1, py:'12px' }} />
      {name == 'Lilico' && (
        <Box
          sx={{
            padding: '10px 26px 10px 12px',
            marginTop: '-12px',
            marginBottom: '-12px',
            marginRight: '-18px',
            display: 'flex',
            alignItems: 'baseline',
            height: '100%',
            flexDirection: 'column',
            background:
              'radial-gradient(139% 151.92% at 100% 0%, rgba(252, 128, 73, 0.5) 0%, rgba(18, 18, 18, 0.5) 100%)',
          }}
        >
          <Typography
            variant="body1"
            color="#41CC5D"
            sx={{ fontWeight: 'medium', fontSize: '14px' }}
          >
            APR
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '14px' }}>
            {amount}%{' '}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default StakeCard;
