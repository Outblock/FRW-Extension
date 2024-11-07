import React from 'react';
import {
  Typography,
  Box,
  Card,
  CardActionArea,
  CardMedia,
  IconButton,
  CircularProgress,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import DoneIcon from '@mui/icons-material/Done';
import IconFlow from '../../../../components/iconfont/IconFlow';
import { CollectionItem } from './AddList';

const CollectionCard = ({
  item,
  setAlertOpen,
  isLoading,
  onClick,
}: {
  item: CollectionItem;
  setAlertOpen: any;
  isLoading: boolean;
  onClick: any;
}) => {
  const {
    name,
    description,
    official_website: officialWebsite,
    logo,
    added,
  } = item || {};
  const getDescriptionWordWrapped = (desc) => {
    if (desc.length < 60) return desc;
    const res = desc.split(' ').reduce((prev, curr) => {
      if (prev.length + curr.length + 1 > 60) return prev;
      return prev + ' ' + curr;
    }, '');
    return res.trim() + '...';
  };
  return (
    <Card
      // onClick={() => officialWebsite && window.open(officialWebsite, '_blank')}
      sx={{
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        width: '100%',
        height: '88px',
        boxShadow: 'none',
        marginTop: '8px',
        position: 'relative',
      }}
    >
      {logo && (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'end',
          }}
        >
          <CardMedia
            component="img"
            sx={{
              width: '200px',
              height: '200px',
              margin: '-56px 0',
              borderRadius: '12px',
              justifyContent: 'center',
            }}
            image={logo}
          />
        </Box>
      )}
      <CardActionArea
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          padding: '12px 18px',
          background:
            'linear-gradient(270deg, rgba(40, 40, 40, 0.32) 0%, rgba(40, 40, 40, 0.88) 30.56%, #282828 42.04%)',
          backdropFilter: 'blur(6px)',
          '&:hover': {
            backdropFilter: 'blur(4px)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            height: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              height: '100%',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Typography
                component="div"
                color="#fff"
                sx={{ fontWeight: 600, fontSize: '16px', lineHeight: '26px' }}
                onClick={() =>
                  officialWebsite && window.open(officialWebsite, '_blank')
                }
              >
                {name}
              </Typography>
              <Box sx={{ marginLeft: '6px' }}>
                <IconFlow size={14} />
              </Box>
              <ArrowForwardIcon
                sx={{ color: '#FFFFFF', fontSize: '12px', marginLeft: '5px' }}
              />
            </Box>
            {description && (
              <Box sx={{ alignItems: 'center', height: '36px' }}>
                <Typography
                  color="#5E5E5E"
                  component="div"
                  sx={{
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '18px',
                    width: '200px',
                  }}
                >
                  {getDescriptionWordWrapped(description)}
                </Typography>
              </Box>
            )}
          </Box>

          <IconButton
            onClick={() => {
              if (!added && !isLoading) onClick(item);
            }}
          >
            <Box
              sx={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: added ? '#69C93C' : 'black',
                padding: '2px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {isLoading ? (
                <CircularProgress color="primary" size={24} />
              ) : added ? (
                <DoneIcon sx={{ color: 'black', fontSize: '20px' }} />
              ) : (
                <AddIcon
                  color="primary"
                  sx={{ fontSize: '20px' }}
                  onClick={() => {
                    if (!added && !isLoading) {
                      setAlertOpen(true);
                    }
                  }}
                />
              )}
            </Box>
          </IconButton>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default CollectionCard;
