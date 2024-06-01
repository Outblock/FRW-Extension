import React from 'react';
import { Stack, Box, Typography, Divider, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GppGoodRoundedIcon from '@mui/icons-material/GppGoodRounded';
import { useHistory } from 'react-router-dom';
import { Presets } from 'react-component-transition';
import IconFlow from '../../../../../../components/iconfont/IconFlow';
import Highlight from 'react-highlight';

export const DefaultBlock = ({ title, host, auditor, expanded, data, method, logo, setExpanded, dedent }) => {
  const history = useHistory();

  const hexToAscii = (hex) => {
    let str = '';
    for (let i = 2; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  };

  const decodeHexData = (data) => {
    const isText = /^0x[0-7F]*$/.test(data);
    return isText ? hexToAscii(data) : BigInt(data).toString();
  };

  const processItem = (item) => {
    if (Array.isArray(item)) {
      return `[\n${item.map(value => `\t${value}`).join(',\n')}\n]`;
    } else if (typeof item === 'object' && item !== null) {
      return `{\n${Object.entries(item).map(([key, value]) => `\t${key}: ${value}`).join(',\n')}\n}`;
    } else {
      return item;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', margin: '18px', gap: '12px' }}>
      <Box sx={{ display: 'flex', gap: '18px', marginBottom: '0px' }}>
        <img style={{ height: '60px', width: '60px', borderRadius: '12px', backgroundColor: 'text.secondary' }} src={logo} />
        <Stack direction="column" spacing={1} sx={{ justifyContent: 'space-between' }}>
          <Typography>{title}</Typography>
          <Typography color="secondary.main" variant="overline">{host}</Typography>
        </Stack>
      </Box>
      <Divider />

      <Box sx={{ borderRadius: '12px', overflow: 'hidden', width: '100%', display: 'table' }}>
        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)} disableGutters sx={{ color: '#BABABA', background: '#282828', borderRadius: '12px !important', overflow: 'hidden' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: '#41CC5D', fontSize: 20 }} />}
            aria-controls="panel1a-content"
            sx={{ height: '40px !important' }}
          >
            <Typography sx={{ fontWeight: '500', fontSize: '12px', fontFamily: 'Inter' }}>Method</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '0 10px' }}>
            <Box sx={{ background: '#282828', borderRadius: '12px', height: '100%', padding: '2px 8px', mb: '6px', overflow: 'hidden' }} >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconFlow size={16} />
                  <Typography sx={{ fontWeight: '600', fontSize: '25px', fontFamily: 'Inter', ml: '8px' }}>
                    {method}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>

      <Box sx={{ borderRadius: '12px', overflow: 'hidden', width: '100%', height: '100%' }}>
        <Accordion key="Cadence" disableGutters sx={{ color: '#BABABA', background: '#282828', borderRadius: '12px !important', overflow: 'hidden' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: '#41CC5D', fontSize: 20 }} />}
            aria-controls="panel1a-content"
            sx={{ height: '40px !important' }}
          >
            <Typography sx={{ fontWeight: '500', fontSize: '12px', fontFamily: 'Inter' }}>Data</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '0 10px' }}>
            {data.length > 0 && (<Box sx={{ background: '#333333', borderRadius: '12px', padding: '12px 8px', mb: '12px', overflow: 'hidden' }} >
              <Typography component='pre' sx={{ fontWeight: '400', fontSize: '10px', fontFamily: 'Inter' }}>
                <Highlight className='swift'>
                  {`[\n${data.map(item => `\t${processItem(item)}`).join(',\n')}\n]`}
                </Highlight>
              </Typography>
            </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>

    </Box>
  );
};
