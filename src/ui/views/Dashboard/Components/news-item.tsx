import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { NewsItem } from 'background/service/networkModel';
import { useNews } from '@/ui/utils/NewsContext';

export const NewsItemCard = ({ item }: { item: NewsItem }) => {
  const { dismissNews, markAsRead } = useNews();
  const cardRef = useRef<HTMLDivElement>(null);
  const [, setItemIsRead] = useState(false);
  const [, setIsDismissed] = useState(false);

  // Check if item is expired
  const isExpired = item.expiryTime && new Date(item.expiryTime) < new Date();
  
  // Don't render if expired
  if (isExpired) return null;

  // Handle auto-dismiss for 'once' display type, and mark as read for other display type
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    // Check if the item is visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          timeoutId = setTimeout(() => {
            setItemIsRead(true);
            if (item.displayType === 'once') {
              dismissNews(item.id);
              setIsDismissed(true);
            } else {
              markAsRead(item.id);
            }
          }, 2000);
        } else {
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
  }, [item.id, dismissNews, markAsRead, item.displayType]);

  // Render image-type news item
  if (item.type === 'image') {
    return (
      <Box
        ref={cardRef}
        sx={{
          borderRadius: '12px',
          overflow: 'hidden',
          height: '100%',
        }}
      >
        <Box
          component="img"
          src={item.image}
          alt={item.title || ''}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>
    );
  }

  // Render message-type news item
  return (
    <Box
      ref={cardRef}
      sx={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '16px',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
      }}
    >
      {item.displayType === 'click' && (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            dismissNews(item.id);
            setIsDismissed(true);
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
          alignItems: 'flex-start',
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
              borderRadius: '50%',
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
            {item.url ? (
              <Box
                component="span"
                onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                sx={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  '&:hover': {
                    color: 'success.dark',
                  },
                }}
              >
                View More
              </Box>
            ) : (
              item.body
            )}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}; 