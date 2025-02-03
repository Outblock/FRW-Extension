import { Box, Typography, CardMedia } from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import React, { useEffect, useState, useCallback } from 'react';

import { useProfileStore } from '@/ui/stores/useProfileStore';

const tempEmoji = {
  emoji: '🥥',
  name: 'Coconut',
  bgcolor: '#FFE4C4',
};

const TransferFrom = ({ wallet, userInfo, isChild = false }) => {
  const { currentWallet } = useProfileStore();
  const [emoji, setEmoji] = useState(tempEmoji);

  const getEmoji = useCallback(async () => {
    const emojiObject = {
      ...tempEmoji,
      emoji: currentWallet.icon,
      name: currentWallet.name,
      bgcolor: currentWallet.color,
      type: 'parent',
    };
    setEmoji(emojiObject);
  }, [currentWallet.icon, currentWallet.name, currentWallet.color, setEmoji]);

  useEffect(() => {
    getEmoji();
  }, [getEmoji]);

  return (
    <StyledEngineProvider injectFirst>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          zIndex: '10',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            px: '4px',
            backgroundColor: 'neutral.main',
            zIndex: 1000,
          }}
        >
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', padding: '8px' }}>
            <Box
              sx={{
                display: 'flex',
                height: '40px',
                width: '40px',
                borderRadius: '32px',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: emoji['bgcolor'],
                marginRight: '12px',
              }}
            >
              {isChild ? (
                <CardMedia
                  sx={{ height: '28px', width: '28px', borderRadius: '28px' }}
                  image={userInfo.avatar}
                />
              ) : (
                <Typography sx={{ fontSize: '28px', fontWeight: '600' }}>{emoji.emoji}</Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', padding: '16px 0' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                {isChild ? userInfo.contact_name : emoji.name}
              </Typography>
              <Typography sx={{ fontSize: '12px', fontWeight: '400', color: '#FFFFFFCC' }}>
                {userInfo.address}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </StyledEngineProvider>
  );
};

export default TransferFrom;
