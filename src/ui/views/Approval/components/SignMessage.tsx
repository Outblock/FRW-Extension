import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Stack,
  Box,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import * as fcl from '@onflow/fcl';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { storage } from '@/background/webapi';
import { LLPrimaryButton, LLSecondaryButton } from 'ui/FRWComponent';
import { useApproval, useWallet } from 'ui/utils';

import './github-dark-dimmed.css';

interface ConnectProps {
  params: any;
  // onChainChange(chain: CHAINS_ENUM): void;
  // defaultChain: CHAINS_ENUM;
}

const SignMessage = ({ params: { icon, origin, tabId, type } }: ConnectProps) => {
  const [, resolveApproval, rejectApproval] = useApproval();
  const { t } = useTranslation();
  const wallet = useWallet();
  const [message, setMessage] = useState<string | null>(null);
  const [opener, setOpener] = useState<number | undefined>(undefined);
  const [host, setHost] = useState(null);
  const [approval, setApproval] = useState(false);
  const [windowId, setWindowId] = useState<number | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [expanded, setExpanded] = useState(true);
  const [logo, setLogo] = useState('');

  const rightPaddedHexBuffer = (value: string, pad: number) =>
    Buffer.from(value.padEnd(pad * 2, '0'), 'hex');

  const USER_DOMAIN_TAG = rightPaddedHexBuffer(
    Buffer.from('FLOW-V0.0-user').toString('hex'),
    32
  ).toString('hex');

  const prependUserDomainTag = (msg: string) => USER_DOMAIN_TAG + msg;

  const handleCancel = () => {
    if (opener) {
      if (windowId) {
        chrome.windows.update(windowId, { focused: true });
        chrome.tabs.update(opener, { active: true });
      }
      chrome.tabs.sendMessage(opener, { type: 'FCL:VIEW:CLOSE' });
      setApproval(false);
      rejectApproval('User rejected the request.');
    }
  };

  const sendAuthzToFCL = async () => {
    if (!message) {
      return;
    }

    setApproval(true);
    const address = await wallet.getCurrentAddress();

    const ki = await storage.get('keyIndex');
    const keyIndex = Number(ki);

    const decode = Buffer.from(message, 'hex').toString('utf8');
    const finalMessage = prependUserDomainTag(message);
    const signedMessage = await wallet.signMessage(finalMessage);

    if (opener) {
      sendSignature(address, keyIndex, signedMessage);
    }
    chrome.runtime?.onMessage.removeListener(extMessageHandler);
    setApproval(true);
    resolveApproval();
  };

  const sendSignature = (address, keyIndex, signedMessage) => {
    if (opener) {
      chrome.tabs.sendMessage(opener, {
        f_type: 'PollingResponse',
        f_vsn: '1.0.0',
        status: 'APPROVED',
        reason: null,
        data: new fcl.WalletUtils.CompositeSignature(
          address,
          //FIX ME: Dynamic KeyIndex
          keyIndex,
          signedMessage
        ),
      });
    }
  };

  const extMessageHandler = (msg, sender, sendResponse) => {
    if (msg.type === 'FCL:VIEW:READY:RESPONSE') {
      if (msg.host) {
        setHost(msg.host);
      }
      if (msg.config.app.title) {
        setTitle(msg.config.app.title);
      }
      if (msg.config.app.icon) {
        setLogo(msg.config.app.icon);
      }

      setMessage(msg.body?.message);
    }

    sendResponse({ status: 'ok' });
    return true;
  };

  useEffect(() => {
    if (chrome.tabs) {
      chrome.tabs
        .query({
          active: true,
          currentWindow: false,
        })
        .then((tabs) => {
          const targetTab = tabs.filter((item) => item.id === tabId);

          let host = '';
          if (targetTab[0].url) {
            host = new URL(targetTab[0].url).host;
          }
          setWindowId(targetTab[0].windowId);
          //  setTabId(tabs[0].index)
          setLogo(targetTab[0].favIconUrl || '');
          setTitle(targetTab[0].title || '');
          setOpener(targetTab[0].id);
          chrome.tabs.sendMessage(targetTab[0].id || 0, { type: 'FCL:VIEW:READY' });
        });
    }

    chrome.runtime?.onMessage.addListener(extMessageHandler);

    return () => {
      chrome.runtime?.onMessage.removeListener(() => {
        console.log('removeListener');
      });
    };
  }, [tabId]);

  window.onbeforeunload = () => {
    if (!approval) {
      handleCancel();
    }
  };

  //   const argumentString = (): string => {
  //     if (cadenceArguments) {
  //       return `Arguments:

  // -------------------------------------------
  // Cadence:
  // `
  //     }
  //     return ''
  //   }

  return (
    <>
      <Box
        sx={{
          margin: '18px 18px 0px 18px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          height: '100%',
          background: 'linear-gradient(0deg, #121212, #11271D)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', margin: '18px', gap: '18px' }}>
          <Box sx={{ display: 'flex', gap: '18px', marginBottom: '14px' }}>
            <img
              style={{
                height: '90px',
                width: '90px',
                borderRadius: '12px',
                backgroundColor: 'text.secondary',
              }}
              src={logo}
            />
            <Stack direction="column" spacing={1} sx={{ justifyContent: 'space-between' }}>
              <Typography>{title}</Typography>
              <Typography>{host}</Typography>
            </Stack>
          </Box>
          <Divider />

          <Box sx={{ borderRadius: '12px', overflow: 'hidden', width: '100%', height: '100%' }}>
            <Accordion
              expanded={expanded}
              onChange={() => setExpanded(!expanded)}
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
                <Box
                  sx={{
                    background: '#333333',
                    borderRadius: '12px',
                    height: '100%',
                    padding: '12px 8px',
                    mb: '12px',
                    overflow: 'scroll',
                  }}
                >
                  <Typography
                    component="p"
                    sx={{ fontWeight: '400', fontSize: '14px', fontFamily: 'Inter' }}
                  >
                    {message && Buffer.from(message, 'hex').toString('utf8')}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1} sx={{ paddingBottom: '32px' }}>
          <LLSecondaryButton
            label={chrome.i18n.getMessage('Cancel')}
            fullWidth
            onClick={handleCancel}
          />
          <LLPrimaryButton
            label={chrome.i18n.getMessage('Approve')}
            fullWidth
            type="submit"
            onClick={sendAuthzToFCL}
          />
        </Stack>
      </Box>
    </>
  );
};

export default SignMessage;
