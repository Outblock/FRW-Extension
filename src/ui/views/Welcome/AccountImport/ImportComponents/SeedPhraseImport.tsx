import { Box, Button, Typography, TextareaAutosize } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';

import { useWallet } from '@/ui/utils/WalletContext';
import { LLSpinner } from 'ui/FRWComponent';

import KeyPathInput from '../../../../FRWComponent/KeyPathInputs';
import { KEY_TYPE } from '../../../../utils/modules/constants';

const useStyles = makeStyles(() => ({
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  textarea: {
    width: '100%',
    borderRadius: '16px',
    backgroundColor: '#2C2C2C',
    padding: '20px',
    color: '#fff',
    marginBottom: '16px',
    resize: 'none',
    fontSize: '16px',
    fontFamily: 'Inter',
  },
  button: {
    width: '100%',
    fontWeight: 'bold',
  },
}));

const SeedPhraseImport = ({ onOpen, onImport, setmnemonic, isSignLoading }) => {
  const classes = useStyles();
  const usewallet = useWallet();
  const [isLoading, setLoading] = useState(false);

  const handleImport = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();
      const seed = e.target[0].value.trim().split(/\s+/g).join(' ');
      setmnemonic(seed);
      const flowAddressRegex = /^(0x)?[0-9a-fA-F]{16}$/;
      const inputValue = e.target[2].value;
      const address = flowAddressRegex.test(inputValue) ? inputValue : null;

      const result = await usewallet.findAddressWithSeedPhrase(seed, address, true);
      if (!result) {
        onOpen();
        return;
      }
      const accounts = result.map((a) => ({ ...a, type: KEY_TYPE.SEED_PHRASE, mnemonic: seed }));
      onImport(accounts);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: '0' }}>
      <form id="seed" onSubmit={handleImport} className={classes.form}>
        <TextareaAutosize
          minRows={6}
          placeholder={chrome.i18n.getMessage('Import_12_or_24_words')}
          className={classes.textarea}
          required
        />
        <TextareaAutosize
          placeholder={chrome.i18n.getMessage('Enter_your_flow_address')}
          className={classes.textarea}
          defaultValue={''}
        />
        <KeyPathInput />
        <Button
          className="registerButton"
          variant="contained"
          color="secondary"
          form="seed"
          size="large"
          type="submit"
          sx={{
            height: '56px',
            width: '640px',
            borderRadius: '12px',
            textTransform: 'capitalize',
            gap: '12px',
            display: 'flex',
            marginTop: '40px',
          }}
          disabled={isLoading || isSignLoading}
        >
          {(isLoading || isSignLoading) && <LLSpinner size={28} />}
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="background.paper">
            {chrome.i18n.getMessage('Import')}
          </Typography>
        </Button>
      </form>
    </Box>
  );
};

export default SeedPhraseImport;
