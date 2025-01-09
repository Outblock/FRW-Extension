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
import React, { useState, useEffect } from 'react';

import { useWallet } from '@/ui/utils';

import { createTestGroups } from './test-groups';

interface TestResult {
  functionName: string;
  functionParams: any; // Parameters passed to the OpenAPI function
  functionResponse: any; // Final response from the OpenAPI function
  fetchDetails: {
    url: string;
    params: any; // Parameters sent to fetch
    requestInit: RequestInit;
    responseData: any; // Raw response from fetch
  };
  timestamp: number;
  error?: string;
}

interface CommonParams {
  address: string;
  network: string;
  username: string;
  token: string;
  deviceInfo: {
    device_id: string;
    district: string;
    name: string;
    type: string;
    user_agent: string;
  };
}

const ApiTestPage: React.FC = () => {
  const wallet = useWallet();
  const [commonParams, setCommonParams] = useState<CommonParams>({
    address: '',
    network: 'mainnet',
    username: '',
    token: '',
    deviceInfo: {
      device_id: 'test-device',
      district: '',
      name: 'Test Device',
      type: '2',
      user_agent: 'Test',
    },
  });

  const [results, setResults] = useState<Record<string, TestResult[]>>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const initializeParams = async () => {
      try {
        const address = await wallet.getCurrentAddress();
        const network = await wallet.getNetwork();
        if (address) {
          setCommonParams((prev) => ({
            ...prev,
            address,
            network,
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

          const result: TestResult = {
            functionName: urlParts[urlParts.length - 1],
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

  const executeTest = async (functionName: string, group: string, params: any = {}) => {
    setLoading(true);
    try {
      const result: TestResult = {
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
        const response = await wallet.openapi[functionName](...Object.values(params));
        result.functionResponse = response;
      } catch (error) {
        result.error = error.message;
      }

      // Update results (note: actual API call details will come through the message listener)
      setResults((prev) => ({
        ...prev,
        [group]: [...(prev[group] || []), result],
      }));
    } catch (error) {
      console.error('Test execution error:', error);
    }
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
              label="Username"
              value={commonParams.username}
              onChange={(e) => handleParamChange('username', e.target.value)}
            />
            <TextField
              label="Token"
              value={commonParams.token}
              onChange={(e) => handleParamChange('token', e.target.value)}
            />
          </Box>
        </Paper>

        {Object.entries(testGroups).map(([group, functions]) => (
          <Accordion key={group}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                {group} Functions ({functions.length})
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
                      onClick={() => executeTest(func.name, group, func.params)}
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

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={downloadResults}
            disabled={Object.keys(results).length === 0}
          >
            Download All Results
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ApiTestPage;
