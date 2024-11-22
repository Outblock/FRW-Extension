import { Typography, ListItem, ListItemText, Skeleton, List, CardMedia } from '@mui/material';
import { Box, ThemeProvider } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import fallback from 'ui/FRWAssets/image/errorImage.png';
import Activity from 'ui/FRWAssets/svg/activity.svg';
import { LLPrimaryButton, LLSpinner } from 'ui/FRWComponent';
import { useWallet } from 'ui/utils';

import theme from '../../style/LLTheme';

const Nft = ({ data }) => {
  const wallet = useWallet();
  const [isLoading, setLoading] = useState(true);
  const history = useHistory();
  const [inbox, setInbox] = useState({});
  const [ids, setIds] = useState('');
  const [failed, setFailed] = useState(false);
  const [notEmpty, setEmpty] = useState(false);

  const claim = async (itemId, symbol) => {
    setIds(itemId);

    const userDomain = await wallet.fetchUserDomain();
    wallet
      .claimNFTFromInbox(userDomain, itemId, symbol)
      .then(async (resp) => {
        setFailed(false);
        wallet.listenTransaction(
          resp,
          true,
          `${itemId} ${symbol} Claimed`,
          `You have claimed ${itemId} ${symbol} to ${userDomain}. \nClick to view this transaction.`
        );
        setIds('');
        await wallet.setDashIndex(0);
        history.push('/dashboard?activity=1');
      })
      .catch((err) => {
        console.log(err);
        setIds('');
        setFailed(true);
      });
  };

  const checkEmpty = async (data) => {
    Object.keys(data['collections']).map((i: any, v: any) => {
      if (data['collections'][i].length) {
        setEmpty(true);
      }
    });
  };

  useEffect(() => {
    setLoading(data === null);
    if (data) {
      setInbox(data);
      checkEmpty(data);
      setLoading(false);
    }
  }, [data]);

  return (
    <ThemeProvider theme={theme}>
      <List sx={{ padding: '0 17px', marginTop: '19px', background: '#000' }}>
        {!isLoading ? (
          <Box>
            {notEmpty ? (
              <>
                {Object.keys(inbox['collections']).map((i: any, v: any) => {
                  return (
                    <Box key={i}>
                      {inbox['collections'][i].map((ibx: any, v: any) => {
                        return (
                          <ListItem
                            sx={{
                              background: '#282828',
                              borderRadius: '12px',
                              width: '100%',
                              height: '132px',
                              marginBottom: '8px',
                              display: 'flex',
                              // flexDirection:'column',
                              justifyContent: 'spaceBetween',
                              padding: '14px 20px',
                            }}
                            key={ibx}
                          >
                            <Box
                              sx={{
                                paddingRight: '0px',
                                color: '#fff',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                              }}
                            >
                              <img
                                src={fallback}
                                style={{
                                  height: '100px',
                                  width: '100px',
                                  backgroundColor: '#282828',
                                  borderRadius: '12px',
                                }}
                              />
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'spaceBetween',
                                flexDirection: 'column',
                                width: '100%',
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: '14px',
                                  color: '#fff',
                                  fontFamily: 'Inter',
                                  fontWeight: 600,
                                }}
                              >
                                {i.split('.')[2]}
                              </Typography>
                              <Box
                                sx={{
                                  backgroundColor: '#4C4C4C',
                                  height: '1px',
                                  width: '100%',
                                  margin: '11px 0',
                                }}
                              ></Box>
                              <Typography
                                sx={{
                                  fontSize: '12px',
                                  color: '#808080',
                                  marginBottom: '18px',
                                }}
                              >
                                ID: {ibx}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                {ids === ibx ? (
                                  <Box
                                    sx={{
                                      borderRadius: '14.5px',
                                      height: '29px',
                                      width: '62px',
                                      fontSize: '12px',
                                      textTransform: 'none !important',
                                      display: 'flex',
                                      justifyContent: 'center',
                                      backgroundColor: '#f2f2f2',
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
                                    <Box
                                      sx={{ display: 'flex', justifyContent: 'center', gap: '5px' }}
                                    >
                                      <LLSpinner size={12} />
                                    </Box>
                                    {/* } */}
                                  </Box>
                                ) : (
                                  <LLPrimaryButton
                                    label="Claim"
                                    onClick={() => claim(ibx, i.split('.')[2])}
                                    sx={{
                                      borderRadius: '14.5px',
                                      height: '29px',
                                      width: '67px',
                                      fontSize: '12px',
                                      color: '#000',
                                      fontWeight: 700,
                                      textTransform: 'none !important',
                                      float: 'right',
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </ListItem>
                        );
                      })}
                      ;
                    </Box>
                  );
                })}
                ;
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  height: '100%',
                  backgroundColor: '#000',
                }}
              >
                <CardMedia sx={{ width: '100px', height: '102px', margin: '50px auto 0' }}>
                  <Activity />
                </CardMedia>
                <Typography
                  variant="overline"
                  sx={{
                    lineHeight: '1',
                    textAlign: 'center',
                    color: '#5E5E5E',
                    marginTop: '5px',
                    fontSize: '16px',
                  }}
                >
                  Inbox empty
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          [1, 2].map((index) => {
            return (
              <ListItem
                key={index}
                secondaryAction={
                  <ListItemText
                    disableTypography={true}
                    primary={<Skeleton variant="text" width={35} height={15} />}
                    secondary={<Skeleton variant="text" width={35} height={15} />}
                  />
                }
              >
                <ListItemText
                  disableTypography={true}
                  primary={<Skeleton variant="text" width={35} height={15} />}
                  secondary={<Skeleton variant="text" width={35} height={15} />}
                />
              </ListItem>
            );
          })
        )}
      </List>
    </ThemeProvider>
  );
};

export default Nft;
