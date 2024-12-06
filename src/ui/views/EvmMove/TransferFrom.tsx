import React, { useEffect, useState } from 'react';
import { Box, Typography, CardMedia } from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import { useWallet } from 'ui/utils';

const tempEmoji = {
  emoji: '🥥',
  name: 'Coconut',
  bgcolor: '#FFE4C4',
};

const TransferFrom = ({ wallet, userInfo, isChild = false }) => {
  const usewallet = useWallet();
  const [emoji, setEmoji] = useState(tempEmoji);

  const getEmoji = async () => {
    const currentWallet = await usewallet.getCurrentWallet();
    const emojiObject = tempEmoji;
    emojiObject.emoji = currentWallet.icon;
    emojiObject.name = currentWallet.name;
    emojiObject.bgcolor = currentWallet.color;
    emojiObject['type'] = 'parent';
    setEmoji(emojiObject);
  };

  useEffect(() => {
    getEmoji();
    console.log('userInfo ', wallet, userInfo);
  }, [userInfo]);

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
