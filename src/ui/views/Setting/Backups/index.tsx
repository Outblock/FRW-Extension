import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import {
  Box,
  Typography,
  IconButton,
  Button
} from '@mui/material';
import { useWallet } from 'ui/utils';
import { LLHeader, LLSpinner } from '@/ui/FRWComponent';
import IconGoogleDrive from '../../../../components/iconfont/IconGoogleDrive';
import CheckCircleIcon from '../../../../components/iconfont/IconCheckmark';
import { LLDeleteBackupPopup } from '@/ui/FRWComponent/LLDeleteBackupPopup';

const useStyles = makeStyles(() => ({
  arrowback: {
    borderRadius: '100%',
    margin: '8px',
  },
  iconbox: {
    position: 'sticky',
    top: 0,
    // width: '100%',
    backgroundColor: '#121212',
    margin: 0,
    padding: 0
  },
  developerTitle: {
    zIndex: 20,
    textAlign: 'center',
    top: 0,
    position: 'sticky',
  },
  developerBox: {
    width: 'auto',
    height: 'auto',
    margin: '20px 20px',
    backgroundColor: '#282828',
    padding: '20px 20px',
    display: 'flex',
    flexDirection: 'row',
    borderRadius: '16px',
    alignContent: 'space-between',
    alignItems: 'center',
    gap:'8px'
  },
  radioBox: {
    width: '90%',
    borderRadius: '16px',
    backgroundColor: '#282828',
    margin: '20px auto',
    // padding: '10px 24px',
  },
  checkboxRow: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'space-between',
    justifyContent: 'space-between',
    padding: '20px 24px',
  }
}));

const orange = {
  500: '#41CC5D',
};
  
const grey = {
  400: '#BABABA',
  500: '#787878',
  600: '#5E5E5E',
};

const ManageBackups = () => {
  const wallet = useWallet();
  const classes = useStyles();
  const history = useHistory();
  const [hasPermission, setHasPermission] = useState(false);
  const [hasBackup, setHasBackup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteBackupPop, setDeleteBackupPop] = useState(false);
  const [deleteAllBackupPop, setDeleteAllBackupPop] = useState(false);

  const checkPresmissions = async() => {
    const permissions = await wallet.hasGooglePremission()
    setHasPermission(permissions)
    if (permissions) {
      checkBackup()
    }
  }

  const checkBackup = async () => {
    try {
      setLoading(true)
      const hasBackup = await wallet.hasCurrentUserBackup()
      setHasBackup(hasBackup)
      setLoading(false)
    } catch (e) {
      setLoading(false)
    }
  }

  const syncBackup = async () => {
    try {
      setLoading(true)
      const hasBackup = await wallet.syncBackup();
      await checkBackup()
      setLoading(false)
    } catch (e) {
      setLoading(false)
    }
  }

  const deleteBackup = async () => {
    try {
      setLoading(true)
      await wallet.deleteCurrentUserBackup();
      await checkBackup()
      setLoading(false)
    } catch (e) {
      setLoading(false)
    }
  }

  const deleteAllBackup = async () => {
    try {
      setLoading(true)
      await wallet.deleteBackups();
      await checkBackup()
      setLoading(false)
    } catch (e) {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkPresmissions()
  }, []);

  return (
    <div className='page' style={{display: 'flex', flexDirection: 'column'}}>
      <LLHeader title={chrome.i18n.getMessage('Manage__Backups')} help={false} />
      <Box className={classes.developerBox}>
        <IconGoogleDrive size={20}/>
        <Typography variant='body1' color='neutral.contrastText' style={{weight: 600}}>{chrome.i18n.getMessage('Google__Drive')}</Typography>
        <Box sx={{flexGrow: 1}}/>
        {hasPermission ? 
          (loading ? <LLSpinner size={20}/> :
            (
              hasBackup ? 
                <IconButton><CheckCircleIcon size={20} color={'#41CC5D'} /></IconButton> 
                : 
                <Button variant="text" onClick={syncBackup}>{chrome.i18n.getMessage('Sync')}</Button>
            )
          ) : 
          <Button variant="text">{chrome.i18n.getMessage('Link')}</Button>
        }
      </Box>

      <Box sx={{flexGrow: 1}}/>

      {hasBackup &&
      <>
        <Button
          onClick={()=>setDeleteBackupPop(true)}
          variant='contained'
          disabled={loading}
          disableElevation
          color='error'
          sx={{
            width: '90%',
            height: '48px',
            borderRadius: '12px',
            // margin: '80px auto 20px 20px',
            marginBottom: '12px',
            textTransform: 'none',
            alignSelf: 'center'
          }}
        >
          <Typography color='text'>{loading ? chrome.i18n.getMessage('Deleting') : chrome.i18n.getMessage('Delete__backup')}</Typography>
        </Button>

        {/* <Button
          onClick={()=>setDeleteAllBackupPop(true)}
          variant='contained'
          disabled={loading}
          disableElevation
          color='error'
          sx={{
            width: '90%',
            height: '48px',
            borderRadius: '12px',
            // margin: '80px auto 20px 20px',
            marginBottom: '24px',
            textTransform: 'none',
            alignSelf: 'center'
          }}
        >
          <Typography color='text'>{loading ? 'Deleting' : 'DELETE ALL BACKUPS'}</Typography>
        </Button> */}

        <LLDeleteBackupPopup
          deleteBackupPop={deleteBackupPop}
          handleCloseIconClicked={() => setDeleteBackupPop(false)}
          handleCancelBtnClicked={() => setDeleteBackupPop(false)}
          handleNextBtnClicked={() => {
            deleteBackup();
            setDeleteBackupPop(false);
          }}
        />

        <LLDeleteBackupPopup
          deleteBackupPop={deleteAllBackupPop}
          handleCloseIconClicked={() => setDeleteBackupPop(false)}
          handleCancelBtnClicked={() => setDeleteBackupPop(false)}
          handleNextBtnClicked={() => {
            deleteAllBackup();
            setDeleteBackupPop(false);
          }}
        />
      </>
      }
    </div>
  )
}

export default ManageBackups;