import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';


/*
* News items
*/
 type NewsType = 'message' | 'image';

 type NewsPriority = 'urgent' | 'high' | 'medium' | 'low';

type NewsDisplayType =
  | 'once'    // show once
  | 'click'   // close it when user click on it
  | 'expiry'; // it will display until it expired

 interface NewsItemType {
  id: string;
  priority: NewsPriority;
  type: NewsType;
  title: string;
  body?: string;
  icon?: string;
  image?: string;
  url?: string;
  expiryTime: Date;
  displayType: NewsDisplayType;
}

interface NewsItemProps {
  item: NewsItemType;
  onDismiss: (id: string) => void;
}

export const NewsItem: React.FC<NewsItemProps> = ({ item, onDismiss }) => {
  const isRecommendation = false;

  return (
    <Box
      sx={{
        background: isRecommendation ? 'rgba(52, 168, 83, 0.1)' : 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '16px',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(item.id);
        }}
        sx={{
          position: 'absolute',
          right: '12px',
          top: '12px',
          color: 'text.secondary',
        }}
      >
        <CloseIcon />
      </IconButton>

      <Box sx={{ 
        display: 'flex', 
        gap: '12px', 
        alignItems: 'center',
        width: '100%',
        pr: 4
      }}>
        {item.icon && (
          <Box
            component="img"
            src={item.icon}
            alt=""
            sx={{ 
              width: 32, 
              height: 32,
              borderRadius: isRecommendation ? '50%' : '4px',
              flexShrink: 0
            }}
          />
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 500,
              mb: 0.5,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {item.title}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {item.body}
          </Typography>
          {item.url && isRecommendation && (
            <Box sx={{ 
              position: 'absolute',
              right: '12px',
              bottom: '12px'
            }}>
              <IconButton 
                size="small"
                sx={{ 
                  bgcolor: 'success.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'success.dark',
                  }
                }}
              >
                <ArrowForwardIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}; 