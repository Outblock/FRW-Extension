import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Stack,
  Box,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CardMedia,
} from '@mui/material';
import React from 'react';
import Highlight from 'react-highlight';

import IconWithPlaceholder from '../EthApprovalComponents/IconWithPlaceholder';

export const DefaultBlock = ({ title, host, data, logo }) => {
  const hexToString = (hex) => {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  };

  const processItem = (item) => {
    console.log('item ', item);
    if (Array.isArray(item)) {
      return `[\n${item.map((value) => `\t${value}`).join(',\n')}\n]`;
    } else if (typeof item === 'object' && item !== null) {
      return `{\n${Object.entries(item)
        .map(([key, value]) => `\t${key}: ${value}`)
        .join(',\n')}\n}`;
    } else {
      return hexToString(item);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Box sx={{ display: 'flex', gap: '18px', marginBottom: '0px' }}>
        <IconWithPlaceholder imageUrl={logo} />
        <Stack direction="column" spacing={1} sx={{ justifyContent: 'space-between' }}>
          <Typography>{title}</Typography>
          <Typography color="secondary.main" variant="overline">
            {host}
          </Typography>
        </Stack>
      </Box>
      <Divider />

      <Box sx={{ borderRadius: '12px', overflow: 'hidden', width: '100%', height: '100%' }}>
        <Accordion
          key="Cadence"
          disableGutters
          sx={{
            color: '#BABABA',
            background: '#282828',
            borderRadius: '12px !important',
            overflow: 'hidden',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: '#41CC5D', fontSize: 20 }} />}
            aria-controls="panel1a-content"
            sx={{ height: '40px !important' }}
          >
            <Typography sx={{ fontWeight: '500', fontSize: '12px', fontFamily: 'Inter' }}>
              {chrome.i18n.getMessage('SIGN__MESSAGE')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '0 10px' }}>
            {data.length > 0 && (
              <Box
                sx={{
                  background: '#333333',
                  borderRadius: '12px',
                  padding: '12px 8px',
                  mb: '12px',
                  overflow: 'hidden',
                }}
              >
                <Typography
                  component="pre"
                  sx={{ fontWeight: '400', fontSize: '10px', fontFamily: 'Inter' }}
                >
                  <Highlight className="swift">{`${processItem(data[0])}`}</Highlight>
                </Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};
