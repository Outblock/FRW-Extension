import React from 'react';
import { Presets } from 'react-component-transition';
import { Box, ThemeProvider } from '@mui/system';
import { Typography, CircularProgress } from '@mui/material';
import CancelIcon from '../../components/iconfont/IconClose';
import CheckCircleIcon from '../../components/iconfont/IconCheckmark';
import theme from '../style/LLTheme';

interface LLFormHelperTextProps {
  inputValue: any;
  isValid: boolean;
  isValidating: boolean;
  errorMsg?: string;
  successMsg?: string;
}

const genHelperText = (
  isValidating: boolean,
  isValid: boolean,
  errorMsg?: string,
  successMsg?: string
) => {
  if (isValidating && !isValid)
    return (
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <CircularProgress color="primary" size={22} style={{ fontSize: '22px', margin: '8px' }} />
        {chrome.i18n.getMessage('Checking')}
      </Typography>
    );

  return isValid ? (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <CheckCircleIcon size={24} color={'#41CC5D'} style={{ margin: '8px' }} />
      <Typography variant="body1" color="text.success">
        {successMsg || chrome.i18n.getMessage('Sounds_good')}
      </Typography>
    </Box>
  ) : (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <CancelIcon size={24} color={'#E54040'} style={{ margin: '8px' }} />
      <Typography variant="body1" color="text.error">
        {errorMsg}
      </Typography>
    </Box>
  );
};

export const LLFormHelperText = (props: LLFormHelperTextProps) => {
  const { inputValue, isValidating, isValid, errorMsg, successMsg } = props;

  const msgBgColor = () => {
    if (isValidating && !isValid) return 'neutral.light';
    return isValid ? 'success.light' : 'error.light';
  };

  return (
    <ThemeProvider theme={theme}>
      <Presets.TransitionSlideUp>
        {inputValue && (
          <Box
            sx={{
              width: '95%',
              backgroundColor: msgBgColor(),
              mx: 'auto',
              borderRadius: '0 0 12px 12px',
            }}
          >
            <Box sx={{ p: '4px' }}>
              {genHelperText(isValidating, isValid, errorMsg, successMsg)}
            </Box>
          </Box>
        )}
      </Presets.TransitionSlideUp>
    </ThemeProvider>
  );
};
