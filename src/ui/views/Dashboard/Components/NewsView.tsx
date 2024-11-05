import React from 'react';
import { useNews } from 'ui/utils/news';
import { Box, Typography, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const NewsView: React.FC = () => {
  const { news, dismissNews, markAllAsRead } = useNews();

  return (
    <Box sx={{ padding: '16px' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2.5,
        }}
      >
        <Typography variant="h2">News</Typography>
        <Button onClick={markAllAsRead}>Clean all</Button>
      </Box>

      {news.map((item) => (
        <Box
          key={item.id}
          sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            mb: 1.5,
            position: 'relative',
          }}
        >
          <IconButton
            onClick={() => dismissNews(item.id)}
            sx={{
              position: 'absolute',
              right: '12px',
              top: '12px',
              color: 'text.secondary',
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box sx={{ display: 'flex', gap: '12px' }}>
            {item.icon && (
              <Box
                component="img"
                src={item.icon}
                alt=""
                sx={{ width: 32, height: 32 }}
              />
            )}
            <Box>
              <Typography variant="h3">{item.title}</Typography>
              <Typography>{item.body}</Typography>
              {item.url && (
                <Button href={item.url} variant="text">
                  View More
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default NewsView;
