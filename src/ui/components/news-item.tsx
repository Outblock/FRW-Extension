import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { NewsItem } from 'background/service/networkModel';
import { useNews } from '../utils/news';

export const NewsItemCard = ({ item }: { item: NewsItem }) => {
  const { dismissNews, markAsRead, isRead } = useNews();

  // Use this to detect when the item is visible
  const cardRef = useRef<HTMLDivElement>(null);
  
  // See if this has been "read".
  const [itemIsRead, setItemIsRead] = useState(false);
  
  // Determine if the item has been "read".
  // We do this by seeing if it's visible for 2 seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Start timer when item becomes visible
          timeoutId = setTimeout(() => {
            markAsRead(item.id);
            setItemIsRead(true);
          }, 2000);
        } else {
          // Clear timer if item becomes hidden before 2 seconds
          clearTimeout(timeoutId);
        }
      });
    });

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [item.id, dismissNews, cardRef]);

  return (
    <Box
      sx={{
        background: itemIsRead
          ? 'rgba(52, 168, 83, 0.1)'
          : 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '16px',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {item.displayType === 'click' && (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            dismissNews(item.id);
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
      )}

      <Box
        sx={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          width: '100%',
          pr: 4,
        }}
      >
        {item.icon && (
          <Box
            component="img"
            src={item.icon}
            alt=""
            sx={{
              width: 32,
              height: 32,
              borderRadius: itemIsRead ? '50%' : '4px',
              flexShrink: 0,
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
              textOverflow: 'ellipsis',
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
              textOverflow: 'ellipsis',
            }}
          >
            {item.body}
          </Typography>
          {item.url && (
            <Box
              sx={{
                position: 'absolute',
                right: '12px',
                bottom: '12px',
              }}
            >
              <IconButton
                size="small"
                sx={{
                  bgcolor: 'success.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'success.dark',
                  },
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