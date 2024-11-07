import React, { useEffect, useState } from 'react';
import { Box, ThemeProvider } from '@mui/system';
import { useHistory } from 'react-router-dom';
import theme from '../../style/LLTheme';
import { useWallet } from 'ui/utils';
import {
  Typography,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemIcon,
  Skeleton,
  ListItemButton,
  List,
  CardMedia
} from '@mui/material';
import activity from 'ui/FRWAssets/svg/activity.svg';
import {
  LLPrimaryButton,
  LLSpinner
} from 'ui/FRWComponent';
import { setDefaultWordlist } from 'bip39';
import { reject } from 'lodash';
import { TokenModel } from 'background/service/networkModel';

const Token = ({ data }) => {
  const wallet = useWallet();
  const [isLoading, setLoading] = useState(true);
  const history = useHistory();
  const [inbox, setInbox] = useState({});
  const [claiming, setClaiming] = useState(false);
  const [ids, setIds] = useState(null);
  const [failed, setFailed] = useState(false);
  const [notEmpty, setEmpty] = useState(false);
  const [tokens, setTokens] = useState<any[]>([]);

  const claim = async (amount, symbol) => {
    setClaiming(true);
    setIds(symbol);
    const userDomain = await wallet.fetchUserDomain();
    wallet.claimFTFromInbox(userDomain, amount, symbol).then(async (resp) => {
      setFailed(false);
      wallet.listenTransaction(resp['txId'], true, `${amount} ${symbol} Claimed`, `You have claimed ${amount} ${symbol} to ${userDomain}. \nClick to view this transaction.`);
      await wallet.setDashIndex(0);
      history.push('/dashboard?activity=1');
    }).catch(()=>{
      setFailed(true);
    })
  }

  const checkEmpty = async (data) => {
    Object.keys(data['vaultBalances']).map((i: any, v: any) => {
      if (parseFloat(data['vaultBalances'][i]) > 0) {
        setEmpty(true);
      }
    });
  };

  const getToken = () => {
    wallet.openapi.getAllToken().then((res) => {
      setTokens(res);
    });
  };

  useEffect(() => {
    setLoading(data === null);
    getToken();
    if (data) {
      setInbox(data);
      checkEmpty(data);
      setLoading(false);
    }
  }, [data]);

  return (
    <ThemeProvider theme={theme}>
      <List sx={{ padding:'0 17px', marginTop:'19px',background: '#000000', }}>
        {!isLoading
        
          ? 
          <Box>
            {notEmpty ?
              <>
                {
                  (Object.keys(inbox['vaultBalances']) || []).map((ibx: any, v: any) => {
                    const contractName = ibx.split('.')[2];
                    const token = tokens.find(item => item.contract_name.toLowerCase() == contractName.toLowerCase())
                    let tokenIcon = 'https://lilico.app/placeholder-2.0.png';
                    if (token) {
                      tokenIcon = token['icon']
                    }
                    
                    return (
                      <>
                        {(parseFloat(inbox['vaultBalances'][ibx]) > 0) &&
                        <ListItem
                          sx={{
                            background: '#282828',
                            borderRadius: '12px',
                            width:'100%',
                            height:'96px',
                            marginBottom:'8px',
                            display:'flex',
                            flexDirection:'column',
                            justifyContent:'spaceBetween',
                            padding:'14px 20px'
                          }}
                          key={ibx}
                        >
                          <Box sx={{paddingRight:'0px',color:'#fff',width:'100%', display:'flex', justifyContent:'space-between'}}>
                            {!isLoading ? (
                              <img src={tokenIcon} style={{height: '24px', width: '24px', backgroundColor: '#282828', borderRadius: '24px'}}/>
                            ) : ( 
                              <Skeleton variant="circular" width={24} height={24} />
                            )}
                            <div>{}</div>
                            <Typography 
                              sx={{
                                fontSize:'12px',
                                color:'#fff',
                                marginLeft:'8px',
                                alignItems: 'center',
                              }}
                            >
                              {parseFloat(inbox['vaultBalances'][ibx]).toFixed(2)} {ibx.split('.')[2]}
                            </Typography>
                            <Box sx={{flex: 1}}></Box>
                            <Typography 
                              sx={{
                                fontSize:'12px',
                                color:'#fff'
                              }}
                            >
                              {ibx.split('.')[2] === 'FUSD' ? `$${parseFloat(inbox['vaultBalances'][ibx]).toFixed(2)}` : ''}
                            </Typography>
                          </Box>
                          <Box sx={{flex:1}}></Box>
                          <Box 
                            sx={{
                              display:'flex',
                              justifyContent:'spaceBetween',
                              width:'100%'
                            }}
                          >
                            <Box sx={{flex:1}}></Box>
                            {(claiming && (ids === ibx.split('.')[2])) ? (
                              <Box
                                sx={{
                                  borderRadius:'14.5px',
                                  height:'29px',
                                  width:'62px',
                                  fontSize:'12px',
                                  textTransform: 'none !important',
                                  display:'flex',
                                  justifyContent:'center',
                                  backgroundColor:'#f2f2f2',
                                  alignItems: 'center',
                                }}
                              >
                                {/* {failed ?
                                  <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 'bold', fontSize:'12px' }}
                                    color="error"
                                  >
                                  error
                                  </Typography>
                                  : */}
                                <Box sx={{display:'flex',justifyContent:'center', gap: '5px'}}>
                                  <LLSpinner size={10}/>
                                </Box>
                                {/* } */}
                              </Box>
                            ) : (
                              <LLPrimaryButton
                                label="Claim"
                                onClick={() => claim(inbox['vaultBalances'][ibx], ibx.split('.')[2])}
                                sx={{
                                  borderRadius:'14.5px',
                                  height:'29px',
                                  width:'62px',
                                  fontSize:'12px',
                                  color:'#000',
                                  textTransform: 'none !important',
                                }}
                              />
                            )}
                          </Box>
                        </ListItem>

                        }
                      </>
                    );
                  })};

              </>
              :
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  height:'100%',
                  backgroundColor:'#000',
                }}>
                <CardMedia sx={{ width:'100px', height:'102px', margin:'50px auto 0', }} image={activity} />
                <Typography
                  variant="overline"
                  sx={{ lineHeight: '1', textAlign: 'center', color:'#5E5E5E', marginTop:'5px', fontSize:'16px' }}
                >
                 Inbox empty
                </Typography>
              </Box>
            }
          </Box>
          : [1, 2].map((index) => {
            return (
              <ListItem
                key={index}
                secondaryAction={
                  <ListItemText
                    disableTypography={true}
                    primary={
                      <Skeleton variant="text" width={35} height={15} />
                    }
                    secondary={
                      <Skeleton variant="text" width={35} height={15} />
                    }
                  />
                }
              >
                <ListItemText
                  disableTypography={true}
                  primary={
                    <Skeleton variant="text" width={35} height={15} />
                  }
                  secondary={
                    <Skeleton variant="text" width={35} height={15} />
                  }
                />
              </ListItem>
            );
          })}
      </List>
    </ThemeProvider>
  );
};

export default Token;
