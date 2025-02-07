import {
  ListItemText,
  ListItem,
  Avatar,
  ListItemAvatar,
  IconButton,
  CircularProgress,
  ListItemButton,
} from '@mui/material';
import React from 'react';

import IconCheckmark from '../../../components/iconfont/IconCheckmark';
import IconPlus from '../../../components/iconfont/IconPlus';

const TokenItem = ({ token, isLoading, enabled, onClick }) => {
  const handleClick = () => {
    onClick(token, enabled);
  };

  return (
    <ListItemButton
      sx={{ mx: '18px', py: '4px', my: '8px', backgroundColor: '#1f1f1f', borderRadius: '16px' }}
    >
      <ListItem
        disablePadding
        onClick={handleClick}
        secondaryAction={
          <IconButton edge="end" aria-label="delete" onClick={handleClick}>
            {isLoading ? (
              <CircularProgress color="primary" size={20} />
            ) : enabled ? (
              <IconCheckmark color="#41CC5D" size={24} />
            ) : (
              <IconPlus size={20} />
            )}
          </IconButton>
        }
      >
        <ListItemAvatar>
          <Avatar src={token.logoURI} />
        </ListItemAvatar>
        <ListItemText primary={token.name} secondary={token.symbol.toUpperCase()} />
      </ListItem>
    </ListItemButton>
  );
};

export default TokenItem;
