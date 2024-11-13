'use client';

import { Box, Typography, LinearProgress } from '@mui/material';
import React from 'react';

import { useStorageCheck } from '../utils/useStorageCheck';

const determineUnit = (used: number) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = used;
  let unitIndex = 0;

  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return { value, unit: units[unitIndex] };
};

export const StorageUsageCard: React.FC = () => {
  const { storageInfo } = useStorageCheck();

  if (!storageInfo) return null;

  const usagePercentage = (storageInfo.used / storageInfo.capacity) * 100;
  const { value: used, unit: usedUnit } = determineUnit(storageInfo.used);
  const { value: capacity, unit: capacityUnit } = determineUnit(storageInfo.capacity);

  return (
    <Box
      sx={{
        backgroundColor: 'neutral.main',
        borderRadius: '12px',
        p: 2,
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography>Storage Fee</Typography>
        <Typography>0.01 FLOW</Typography>
      </Box>

      <Box sx={{ mb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 0.5,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {usagePercentage.toFixed(2)}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {`${used.toFixed(1)} ${usedUnit} / ${capacity.toFixed(1)} ${capacityUnit}`}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={usagePercentage}
          sx={{
            backgroundColor: 'background.paper',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#4CAF50',
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default StorageUsageCard;
