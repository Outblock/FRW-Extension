'use client';

import { Box, Card, LinearProgress, Typography } from '@mui/material';
import React from 'react';

import type { StorageInfo } from '../../background/service/storage-evaluator';

interface StorageUsageCardProps {
  storageInfo: StorageInfo;
}

export const StorageUsageCard: React.FC<StorageUsageCardProps> = ({ storageInfo }) => {
  const usagePercentage = (storageInfo.storageUsed / storageInfo.storageCapacity) * 100;
  const isLowStorage = storageInfo.storageCapacity - storageInfo.storageUsed < 10000;

  return (
    <Card sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6">Storage Usage</Typography>
      <Box sx={{ mt: 2 }}>
        <LinearProgress
          variant="determinate"
          value={usagePercentage}
          color={isLowStorage ? 'error' : 'primary'}
        />
        <Typography variant="body2" sx={{ mt: 1 }}>
          {`${storageInfo.storageUsed.toLocaleString()} / ${storageInfo.storageCapacity.toLocaleString()} bytes used`}
        </Typography>
        {isLowStorage && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            Storage space is running low. Please increase your storage capacity.
          </Typography>
        )}
      </Box>
    </Card>
  );
};
