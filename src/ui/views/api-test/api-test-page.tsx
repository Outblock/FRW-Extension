import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@mui/material';
import * as bip39 from 'bip39';
import React, { useState, useEffect } from 'react';

import { useWallet } from '@/ui/utils';

import { type ApiTestFunction, type CommonParams, createTestGroups } from './test-groups';

interface ApiTestResult {
  functionName: string;
  functionParams: any;
  functionResponse: any;
  fetchDetails: {
    url: string;
    params: any;
    requestInit: RequestInit;
    responseData: any;
  };
  timestamp: number;
  error?: string;
}

const ApiTestPage: React.FC = () => {
  const wallet = useWallet();
  const [commonParams, setCommonParams] = useState<CommonParams>({
    address: '',
    network: 'testnet',
    username: 'coolpanda',
    password: process.env.DEV_PASSWORD || '',
    token: 'flow',
    mnemonicExisting: '',
    mnemonicGenerated: '',
    publicKey: {
      P256: { pubK: '', pk: '' },
      SECP256K1: { pubK: '', pk: '' },
    },
    deviceInfo: {
      device_id: 'test-device',
      district: '',
      name: 'Test Device',
      type: '2',
      user_agent: 'Test',
    },
  });

  const [results, setResults] = useState<Record<string, ApiTestResult[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [runningAllTests, setRunningAllTests] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ completed: number; total: number }>({
    completed: 0,
    total: 0,
  });

  useEffect(() => {
    const initializeParams = async () => {
      try {
        const address = await wallet.getCurrentAddress();
        const network = await wallet.getNetwork();
        const publicKey = await wallet.getPubKey();
        if (address) {
          setCommonParams((prev) => ({
            ...prev,
            address,
            network,
            publicKey,
          }));
        }
      } catch (error) {
        console.error('Error initializing params:', error);
      }
    };
    initializeParams();

    // Set up message listener for API calls
    const messageListener = (message: any) => {
      if (message.type === 'API_CALL_RECORDED') {
        const { data } = message;
        setResults((prev) => {
          // Try to determine the function group from the URL
          const urlParts = data.url.split('/');
          let group = 'misc';

          // Simple mapping of URL patterns to groups
          if (data.url.includes('/user/')) group = 'authentication';
          else if (data.url.includes('/token/')) group = 'tokens';
          else if (data.url.includes('/nft/')) group = 'nft';
          else if (data.url.includes('/addressbook/')) group = 'addressBook';
          else if (data.url.includes('/transaction')) group = 'transactions';

          const result: ApiTestResult = {
            functionName: data.url,
            functionParams: data.functionParams || {}, // Parameters passed to the OpenAPI function
            functionResponse: data.functionResponse || null, // Final response from the OpenAPI function
            fetchDetails: {
              url: data.url,
              params: data.params || {}, // Parameters sent to fetch
              requestInit: data.requestInit,
              responseData: data.responseData, // Raw response from fetch
            },
            timestamp: data.timestamp,
          };

          return {
            ...prev,
            [group]: [...(prev[group] || []), result],
          };
        });
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [wallet]);

  const handleParamChange = (param: keyof CommonParams, value: any) => {
    setCommonParams((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  const executeTest = async (
    functionName: string,
    group: string,
    params: any = {},
    callWallet: boolean = false
  ) => {
    try {
      const result: ApiTestResult = {
        functionName,
        functionParams: params,
        functionResponse: null,
        fetchDetails: {
          url: '',
          params: {},
          requestInit: {} as RequestInit,
          responseData: null,
        },
        timestamp: Date.now(),
      };

      // Execute the API call
      try {
        if (callWallet) {
          result.functionResponse = await wallet[functionName](...Object.values(params));
        } else {
          result.functionResponse = await wallet.openapi[functionName](...Object.values(params));
        }
      } catch (error) {
        result.error = error.message;
      }

      // Update results (note: actual API call details will come through the message listener)
      setResults((prev) => ({
        ...prev,
        [group]: [...(prev[group] || []), result],
      }));

      if (runningAllTests) {
        setProgress((prev) => ({ ...prev, completed: prev.completed + 1 }));
      }
    } catch (error) {
      console.error('Test execution error:', error);
    }
  };

  const executeTestFunc = async (group: string, func: ApiTestFunction) => {
    if (func.controlledBy) {
      // Call it through the controller
      for (const controller of func.controlledBy) {
        await executeTest(controller.name, group, controller.params, true);
      }
    } else {
      await executeTest(func.name, group, func.params, false);
    }
  };

  const executeAllTests = async () => {
    setRunningAllTests(true);
    setLoading(true);
    setResults({});

    const testGroups = createTestGroups(commonParams);
    const totalTests = Object.values(testGroups).reduce((sum, group) => sum + group.length, 0);
    setProgress({ completed: 0, total: totalTests });

    // Execute tests sequentially to avoid overwhelming the API
    for (const [group, functions] of Object.entries(testGroups)) {
      for (const func of functions) {
        await executeTestFunc(group, func);
        // Add a small delay between tests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setRunningAllTests(false);
    setLoading(false);
  };

  const downloadResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'api-test-results.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const testGroups = createTestGroups(commonParams);

  const generateNewMnemonic = () => {
    const newMnemonic = bip39.generateMnemonic();
    setCommonParams((prev) => ({
      ...prev,
      mnemonicGenerated: newMnemonic,
    }));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          API Test Page
        </Typography>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Common Parameters
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Username"
              value={commonParams.username}
              onChange={(e) => handleParamChange('username', e.target.value)}
            />
            <TextField
              label="Password"
              value={commonParams.password}
              type="password"
              onChange={(e) => handleParamChange('password', e.target.value)}
            />
            <TextField
              label="Address"
              value={commonParams.address}
              onChange={(e) => handleParamChange('address', e.target.value)}
            />
            <TextField
              label="Network"
              value={commonParams.network}
              onChange={(e) => handleParamChange('network', e.target.value)}
            />

            <TextField
              label="Token"
              value={commonParams.token}
              onChange={(e) => handleParamChange('token', e.target.value)}
            />
            <TextField
              label="Mnemonic Existing"
              value={commonParams.mnemonicExisting}
              onChange={(e) => handleParamChange('mnemonicExisting', e.target.value)}
              multiline
              rows={4}
            />
            <TextField
              label="New Mnemonic"
              value={commonParams.mnemonicGenerated}
              onChange={(e) => handleParamChange('mnemonicGenerated', e.target.value)}
              multiline
              rows={4}
            />
            <Button variant="contained" onClick={generateNewMnemonic}>
              Generate Mnemonic
            </Button>
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant="contained" onClick={executeAllTests} disabled={loading} color="primary">
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={24} />
                {runningAllTests && (
                  <Typography variant="body2">
                    {progress.completed} / {progress.total}
                  </Typography>
                )}
              </Box>
            ) : (
              'Run All Tests'
            )}
          </Button>
          <Button
            variant="contained"
            onClick={downloadResults}
            disabled={Object.keys(results).length === 0}
            color="secondary"
          >
            Download Results
          </Button>
        </Box>

        {Object.entries(testGroups).map(([group, functions]) => (
          <Accordion key={group}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                {group} Functions ({functions.length})
                {results[group] && ` - ${results[group].length} tested`}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {functions.map((func) => (
                  <Box
                    key={func.name}
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography>{func.name}</Typography>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setLoading(true);
                        executeTestFunc(group, func).finally(() => setLoading(false));
                      }}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Test'}
                    </Button>
                  </Box>
                ))}
                {results[group] && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Results:</Typography>
                    <pre style={{ maxHeight: '200px', overflow: 'auto' }}>
                      {JSON.stringify(results[group], null, 2)}
                    </pre>
                  </Box>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
};

export default ApiTestPage;
