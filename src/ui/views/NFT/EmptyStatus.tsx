import { Typography, Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';

import EmptyStatusSvg from '../../FRWAssets/image/empty_status.svg';

const useStyles = makeStyles(() => ({
  emptyBox: {
    margin: '48px auto 84px auto',
    width: '262px',
    height: '249px',
    justifyContent: 'center',
    alignContent: 'center',
    textAlign: 'center',
  },
  emptyImg: {
    margin: '0 auto auto auto',
  },
}));

function EmptyStatus() {
  const classes = useStyles();

  return (
    <>
      <Box className={classes.emptyBox}>
        <EmptyStatusSvg className={classes.emptyImg} height="167px" />
        <Typography component="div" variant="subtitle1">
          {chrome.i18n.getMessage('We__did__not__find__anything__here')}
        </Typography>
        <Typography component="div" variant="body2" color="text.nonselect">
          {chrome.i18n.getMessage('Looking__forward__to__your__new__discovery')}
        </Typography>
      </Box>
    </>
  );
}

export default EmptyStatus;
