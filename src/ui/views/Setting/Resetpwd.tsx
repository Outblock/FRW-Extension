import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  FormGroup,
  LinearProgress,
  IconButton,
  Input,
  InputAdornment,
  Typography,
  Button,
} from '@mui/material';
import Box from '@mui/material/Box';
import { makeStyles } from '@mui/styles';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import zxcvbn from 'zxcvbn';

import SlideRelative from '@/ui/FRWComponent/SlideRelative';
import { useWallet } from 'ui/utils';

import CheckCircleIcon from '../../../components/iconfont/IconCheckmark';
import CancelIcon from '../../../components/iconfont/IconClose';

const useStyles = makeStyles(() => ({
  customInputLabel: {
    '& legend': {
      visibility: 'visible',
    },
  },
  inputBox: {
    width: '355px',
    height: '48px',
    padding: '18px',
    marginLeft: '18px',
    marginRight: '18px',
    zIndex: '999',
    border: '1px solid #4C4C4C',
    borderRadius: '8px',
    boxSizing: 'border-box',
    '&.Mui-focused': {
      border: '1px solid #FAFAFA',
      boxShadow: '0px 8px 12px 4px rgba(76, 76, 76, 0.24)',
    },
  },
  inputBox2: {
    width: '355px',
    height: '48px',
    padding: '18px',
    marginLeft: '18px',
    marginRight: '18px',
    zIndex: '999',
    border: '1px solid #4C4C4C',
    borderRadius: '8px',
    boxSizing: 'border-box',
    '&.Mui-focused': {
      border: '1px solid #FAFAFA',
      boxShadow: '0px 8px 12px 4px rgba(76, 76, 76, 0.24)',
    },
  },
  inputBox3: {
    width: '355px',
    height: '48px',
    padding: '18px',
    marginLeft: '18px',
    marginRight: '18px',
    zIndex: '999',
    border: '1px solid #4C4C4C',
    borderRadius: '8px',
    boxSizing: 'border-box',
    '&.Mui-focused': {
      border: '1px solid #FAFAFA',
      boxShadow: '0px 8px 12px 4px rgba(76, 76, 76, 0.24)',
    },
  },
}));

const PasswordIndicator = (props) => {
  const score = zxcvbn(props.value).score;
  const precentage = ((score + 1) / 5) * 100;

  const level = (score) => {
    switch (score) {
      case 0:
      case 1:
        return { text: 'Weak', color: 'primary' };
      case 2:
        return { text: 'Good', color: 'testnet' };
      case 3:
        return { text: 'Great', color: 'success' };
      case 4:
        return { text: 'Strong', color: 'success' };
      default:
        return { text: 'Unknow', color: 'error' };
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '72px', mr: 1 }}>
        <LinearProgress
          variant="determinate"
          // @ts-expect-error level function returned expected value
          color={level(score).color}
          sx={{ height: '12px', width: '72px', borderRadius: '12px' }}
          value={precentage}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">
          {level(score).text}
        </Typography>
      </Box>
    </Box>
  );
};

const Resetpassword = () => {
  const classes = useStyles();
  const wallet = useWallet();
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCharacters, setCharacters] = useState(false);
  const [isMatch, setMatch] = useState(false);
  const [confirmcurrentPassword, setConfirmcurrentPassword] = useState('');
  const [isSame, setSame] = useState(false);
  const history = useHistory();

  const verify = useCallback(async () => {
    await wallet.getCurrentPassword(confirmcurrentPassword);
    setSame(true);
  }, [confirmcurrentPassword, wallet]);

  useEffect(() => {
    verify();
  }, [confirmcurrentPassword, verify]);

  const successInfo = (message) => {
    return (
      <Box
        sx={{
          width: '95%',
          backgroundColor: '#38B00014',
          mx: 'auto',
          borderRadius: '0 0 12px 12px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <CheckCircleIcon size={12} color={'#41CC5D'} style={{ margin: '8px' }} />
        <Typography
          sx={{
            fontSize: '10px',
            fontStyle: 'normal',
            fontWeight: '400',
          }}
          color="text.secondary"
        >
          {message}
        </Typography>
      </Box>
    );
  };

  const errorInfo = (message) => {
    return (
      <Box
        sx={{
          width: '95%',
          backgroundColor: 'error.light',
          mx: 'auto',
          borderRadius: '0 0 12px 12px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <CancelIcon size={12} color={'#E54040'} style={{ margin: '8px' }} />
        <Typography
          sx={{
            fontSize: '10px',
            fontStyle: 'normal',
            fontWeight: '400',
          }}
          color="error.main"
        >
          {message}
        </Typography>
      </Box>
    );
  };

  const [helperText, setHelperText] = useState(<div />);
  const [helperMatch, setHelperMatch] = useState(<div />);

  const reset = () => {
    wallet.update(confirmPassword);
  };
  useEffect(() => {
    if (password.length > 7) {
      setHelperText(successInfo('At least 8 characters'));
      setCharacters(true);
    } else {
      setHelperText(errorInfo('At least 8 characters'));
      setCharacters(false);
    }
  }, [password]);

  useEffect(() => {
    if (confirmPassword === password) {
      setHelperMatch(successInfo('Passwords match'));
      setMatch(true);
    } else {
      setMatch(false);
      setHelperMatch(errorInfo('Your passwords do not match. Please check again.'));
    }
  }, [confirmPassword, password]);

  return (
    <div className="page">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            height: '64px',
            px: '16px',
          }}
        >
          <ArrowBackIcon
            fontSize="medium"
            sx={{ color: 'icon.navi', cursor: 'pointer' }}
            onClick={() => history.push('/dashboard/nested/security')}
          />
          <Typography
            sx={{
              py: '14px',
              alignSelf: 'center',
              fontSize: '20px',
              paddingLeft: '80px',
              fontFamily: 'Inter',
              fontStyle: 'normal',
              fontWeight: '600',
              color: '#BABABA',
            }}
          >
            {chrome.i18n.getMessage('Change__111e__Password')}
          </Typography>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            width: '355px',
            maxWidth: '100%',
            my: '8px',
            display: 'flex',
          }}
        >
          <FormGroup sx={{ width: '100%' }}>
            <Input
              sx={{ fontSize: '12px', fontFamily: 'Inter', fontStyle: 'normal' }}
              id="pass"
              name="password"
              placeholder={chrome.i18n.getMessage('Current__Password')}
              value={confirmcurrentPassword}
              className={classes.inputBox}
              fullWidth
              autoFocus
              disableUnderline
              autoComplete="new-password"
              onChange={(event) => {
                setConfirmcurrentPassword(event.target.value);
              }}
              endAdornment={
                <InputAdornment position="end">
                  {isSame ? (
                    <CheckCircleIcon size={14} color={'#41CC5D'} style={{ margin: '8px' }} />
                  ) : (
                    <CancelIcon size={14} color={'#E54040'} style={{ margin: '8px' }} />
                  )}
                </InputAdornment>
              }
            />

            <Input
              sx={{
                pb: '15px',
                marginTop: password ? '0px' : '8px',
                fontSize: '12px',
                fontFamily: 'Inter',
                fontStyle: 'normal',
              }}
              id="pass1"
              type={isPasswordVisible ? 'text' : 'password'}
              name="password1"
              placeholder={chrome.i18n.getMessage('New__Password')}
              value={password}
              className={classes.inputBox2}
              fullWidth
              autoFocus
              disableUnderline
              autoComplete="new-password"
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              endAdornment={
                <InputAdornment position="end">
                  {password && <PasswordIndicator value={password} />}
                  <IconButton onClick={() => setPasswordVisible(!isPasswordVisible)}>
                    {isPasswordVisible ? (
                      <VisibilityOffIcon sx={{ fontSize: 14, padding: 0 }} />
                    ) : (
                      <VisibilityIcon sx={{ fontSize: 14, padding: 0 }} />
                    )}
                  </IconButton>
                </InputAdornment>
              }
            />
            <SlideRelative direction="down" show={!!password}>
              {helperText}
            </SlideRelative>
            <Input
              sx={{
                pb: '15px',
                marginTop: password ? '0px' : '8px',
                fontSize: '12px',
                fontFamily: 'Inter',
                fontStyle: 'normal',
              }}
              id="pass2"
              type={isConfirmPasswordVisible ? 'text' : 'password'}
              name="password2"
              placeholder={chrome.i18n.getMessage('Confirm__Password')}
              value={confirmPassword}
              className={classes.inputBox3}
              autoComplete="new-password"
              fullWidth
              disableUnderline
              onChange={(event) => {
                setConfirmPassword(event.target.value);
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                    {isConfirmPasswordVisible ? (
                      <VisibilityOffIcon sx={{ fontSize: 14, margin: 0 }} />
                    ) : (
                      <VisibilityIcon sx={{ fontSize: 14, margin: 0 }} />
                    )}
                  </IconButton>
                </InputAdornment>
              }
            />
            <SlideRelative direction="down" show={!!confirmPassword}>
              {helperMatch}
            </SlideRelative>
          </FormGroup>
        </Box>
        <Box
          sx={{
            display: 'flex',
            px: '18px',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '60px',
          }}
        >
          <Button
            variant="contained"
            component={Link}
            to="/dashboard/nested/security"
            size="large"
            sx={{
              backgroundColor: '#333333',
              display: 'flex',
              flexGrow: 1,
              height: '48px',
              width: '158px',
              borderRadius: '8px',
              textTransform: 'capitalize',
            }}
          >
            <Typography
              sx={{
                fontWeight: '600',
                fontSize: '14px',
                fontFamily: 'Inter',
                fontColor: '#E6E6E6',
              }}
            >
              {chrome.i18n.getMessage('Cancel')}
            </Typography>
          </Button>

          <Button
            variant="contained"
            color="primary"
            component={Button}
            onClick={reset}
            size="large"
            sx={{
              display: 'flex',
              flexGrow: 1,
              height: '48px',
              borderRadius: '8px',
              textTransform: 'capitalize',
              width: '158px',
            }}
            disabled={!(isSame && isMatch && isCharacters)}
          >
            <Typography
              sx={{ fontWeight: '600', fontSize: '14px', fontFamily: 'Inter' }}
              color="text.primary"
            >
              {chrome.i18n.getMessage('Next')}
            </Typography>
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default Resetpassword;
