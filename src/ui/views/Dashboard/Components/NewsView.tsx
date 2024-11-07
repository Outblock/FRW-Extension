import React from 'react';
import { useNews } from 'ui/utils/news';
import { Box, Typography, Button } from '@mui/material';
import { NewsItemCard } from 'ui/components/news-item';

export const NewsView: React.FC = () => {
  const { news, resetNews, markAllAsRead } = useNews();

  // Handler for background click
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      resetNews();
    }
  };

  return (
    <Box 
      onClick={handleBackgroundClick}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        // Leave space for bottom nav (56px) plus some padding
        pb: '72px'
      }}
    >
      <Box sx={{ padding: '16px' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2.5,
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 500,
              color: 'text.primary'
            }}
          >
            Notification
          </Typography>
          <Button 
            onClick={markAllAsRead}
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline',
              }
            }}
          >
            Clear all
          </Button>
        </Box>

        <Box 
          sx={{
            maxHeight: 'calc(100vh - 200px)', // Leave space for header and bottom nav
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              display: 'none' // Hide scrollbar for cleaner look
            },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {news?.map((item) => (
            <Box 
              key={item.id}
              sx={{
                height: '76px', // Fixed heights
                mb: 1.5
              }}
            >
              <NewsItemCard
                item={item}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default NewsView;
