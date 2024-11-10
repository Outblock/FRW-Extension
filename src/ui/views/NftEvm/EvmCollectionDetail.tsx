import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@mui/styles';
import { StyledEngineProvider } from '@mui/material/styles';
import {
  Typography,
  Card,
  Grid,
  Button,
  Box,
  IconButton,
  CardMedia,
  CardContent,
  Skeleton,
  ButtonBase,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import { storage } from '@/background/webapi';
import { useWallet } from 'ui/utils';
import GridView from './GridView';
// import InfiniteScroll from 'react-infinite-scroller';
import InfiniteScroll from 'react-infinite-scroll-component';
import { LLSpinner } from '@/ui/FRWComponent';
import { has } from 'lodash';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { PostMedia, MatchMediaType } from '@/ui/utils/url';

interface CollectionDisplay {
  name: string;
  squareImage: SquareImage;
  externalURL: string;
}

interface Info {
  collectionDisplay: CollectionDisplay;
}

interface Result {
  info: Info;
  nftCount: number;
  nfts: Array<NFT>;
}

interface File {
  url: string;
}

interface SquareImage {
  file: File;
}

interface NFT {
  id: string;
  unique_id: string;
  name: string;
  description: string;
  thumbnail: string;
  postMedia: PostMedia;
}

const useStyles = makeStyles(() => ({
  title: {
    fontSize: '22px',
    color: '#F2F2F2',
    lingHeight: '32px',
    fontWeight: 600,
    margin: '18px',
  },
  card: {
    width: '185px',
    height: '225px',
    backgroundColor: '#1B1B1B',
    padding: '0',
    boxShadow: 'none',
    margin: 0,
    borderRadius: '8px',
  },
  cardNoHover: {
    flex: '50%',
    padding: '13px',
    // height: '211px',
    backgroundColor: 'inherit',
    boxShadow: 'none',
    margin: 0,
    borderRadius: '8px',
    display: 'inline-block',
  },
  actionarea: {
    width: '100%',
    height: '100%',
    borderRadius: '8px',
    padding: '13px',
    '&:hover': {
      color: '#282828',
      backgroundColor: '#282828',
    },
  },
  grid: {
    width: '100%',
    minHeight: '360px',
    backgroundColor: '#1B1B1B',
    borderRadius: '16px 16px 0 0',
    padding: '10px 13px',
    margin: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'flex-start',
    // marginLeft: 'auto'
    marginBottom: '20px',
    overflow: 'auto',
  },
  cardmedia: {
    height: '159px',
    width: '100%',
    justifyContent: 'center',
  },
  media: {
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: '8px',
    margin: '0 auto',
  },
  content: {
    height: '40px',
    padding: '5px 0',
    backgroundColor: 'inherit',
    borderRadius: '0 0 8px 8px',
  },
  nftname: {
    color: '#E6E6E6',
    fontSize: '14px',
  },
  nftprice: {
    color: '#808080',
    fontSize: '14px',
  },
  collectionCard: {
    display: 'flex',
    // backgroundColor: '#282828',
    width: '100%',
    height: '64px',
    margin: '11px auto',
    borderRadius: '16px',
    boxShadow: 'none',
  },
  collectionImg: {
    borderRadius: '12px',
    width: '48px',
    margin: '8px',
  },
  arrowback: {
    borderRadius: '100%',
    margin: '8px',
  },
  iconbox: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#121212',
    width: '100%',
    margin: 0,
    padding: 0,
    zIndex: 5,
  },
}));

interface EvmCollectionDetailState {
  collection: any;
  ownerAddress: any;
  accessible: any;
  nftList: any;
}

const EvmCollectionDetail = (props) => {
  const usewallet = useWallet();

  const classes = useStyles();
  const location = useParams();

  const uselocation = useLocation<EvmCollectionDetailState>();

  const history = useHistory();
  const [list, setLists] = useState<any[]>([]);
  const [ownerAddress, setOwnerAddress] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const collection_info = location['collection_address_name'].split('.');
  const address = collection_info[0];
  const collection_name = collection_info[3];
  const { nftList } = uselocation.state || {};

  const fetchCollection = async () => {
    // const { collection, ownerAddress } = await getInfo();
    setOwnerAddress(address);
    setLoading(true);
    try {
      const res = await convertToNftCollectionModel(nftList, collection_name);
      console.log('res   ', res);
      if (res) {
        setInfo(res.info);
        setTotal(res.nftCount);
        setLists(res.nfts);
      }
    } catch (err) {
      console.log('err   ', err);
      // Handle the error if needed
    } finally {
      setLoading(false);
    }
  };

  function convertToNftCollectionModel(data, collection_name) {
    // Filter the array based on collectionContractName == "ExampleNFT"
    const filteredData = data.filter((nft) => nft.collectionContractName === collection_name);

    if (filteredData.length === 0) {
      return null; // Return null or an empty object if no data matches the criteria
    }

    // Initialize the result object
    const result = {
      nfts: [],
      nftCount: 0,
      collection: {},
      info: {},
    };

    // Extract the first item to get the collection data
    const firstItem = filteredData[0];

    // Fill in the collection details
    result.collection = {
      id: firstItem.collectionID,
      contract_name: firstItem.collectionContractName,
      address: firstItem.contractAddress,
      name: firstItem.collectionName,
      logo: firstItem.collectionSquareImage,
      banner: firstItem.collectionBannerImage,
      official_website: firstItem.collectionExternalURL,
      description: firstItem.collectionDescription,
      path: {
        storage_path: '',
        public_path: '',
      },
      socials: {},
    };

    // Fill in the nfts and nftCount
    result.nfts = filteredData.map((nft) => ({
      id: nft.id,
      name: nft.name,
      description: nft.description,
      thumbnail: nft.thumbnail,
      externalURL: nft.externalURL,
      collectionID: nft.collectionID,
      collectionName: nft.collectionName,
      collectionContractName: nft.collectionContractName,
      contractAddress: nft.contractAddress,
      collectionDescription: nft.collectionDescription,
      collectionSquareImage: nft.collectionSquareImage,
      collectionBannerImage: nft.collectionBannerImage,
      collectionExternalURL: nft.collectionExternalURL,
      royalties: nft.royalties,
      traits: nft.traits,
      postMedia: nft.postMedia,
      unique_id: `${nft.collectionName}_${nft.id}`,
    }));
    result.nftCount = result.nfts.length;

    // Fill in the info details
    result.info = {
      contractName: firstItem.collectionContractName,
      contractAddress: firstItem.contractAddress,
      id: `A.${firstItem.contractAddress}.${firstItem.collectionContractName}.Collection`,
      path: '/storage/cadenceExampleNFTCollection',
      collectionDisplay: {
        name: firstItem.collectionName,
        description: firstItem.collectionDescription,
        externalURL: {
          url: firstItem.collectionExternalURL,
        },
        squareImage: {
          file: {
            url: firstItem.collectionSquareImage,
          },
          mediaType: 'image/svg+xml',
        },
        bannerImage: {
          file: {
            url: firstItem.collectionBannerImage,
          },
          mediaType: 'image/svg+xml',
        },
        socials: {
          twitter: {
            url: 'https://twitter.com/flow_blockchain',
          },
        },
      },
      collectionData: {
        storagePath: {
          domain: 'storage',
          identifier: 'cadenceExampleNFTCollection',
        },
        publicPath: {
          domain: 'public',
          identifier: 'cadenceExampleNFTCollection',
        },
        publicCollection: {
          type: '',
          kind: 'Resource',
          typeID: `A.${firstItem.contractAddress}.${firstItem.collectionContractName}.Collection`,
          fields: [
            {
              type: {
                kind: 'UInt64',
              },
              id: 'uuid',
            },
            {
              type: {
                key: {
                  kind: 'UInt64',
                },
                value: {
                  kind: 'Intersection',
                  typeID: `{A.b6763b4399a888c8.NonFungibleToken.NFT}`,
                  types: [
                    {
                      type: '',
                      kind: 'ResourceInterface',
                      typeID: 'A.b6763b4399a888c8.NonFungibleToken.NFT',
                      fields: [
                        {
                          type: {
                            kind: 'UInt64',
                          },
                          id: 'uuid',
                        },
                        {
                          type: {
                            kind: 'UInt64',
                          },
                          id: 'id',
                        },
                      ],
                      initializers: [],
                    },
                  ],
                },
                kind: 'Dictionary',
              },
              id: 'ownedNFTs',
            },
            {
              type: {
                kind: 'StoragePath',
              },
              id: 'storagePath',
            },
            {
              type: {
                kind: 'PublicPath',
              },
              id: 'publicPath',
            },
          ],
          initializers: [],
        },
        publicLinkedType: {
          type: '',
          kind: 'Resource',
          typeID: `A.${firstItem.contractAddress}.${firstItem.collectionContractName}.Collection`,
          fields: [
            {
              type: {
                kind: 'UInt64',
              },
              id: 'uuid',
            },
            {
              type: {
                key: {
                  kind: 'UInt64',
                },
                value: {
                  kind: 'Intersection',
                  typeID: `{A.b6763b4399a888c8.NonFungibleToken.NFT}`,
                  types: [
                    {
                      type: '',
                      kind: 'ResourceInterface',
                      typeID: 'A.b6763b4399a888c8.NonFungibleToken.NFT',
                      fields: [
                        {
                          type: {
                            kind: 'UInt64',
                          },
                          id: 'uuid',
                        },
                        {
                          type: {
                            kind: 'UInt64',
                          },
                          id: 'id',
                        },
                      ],
                      initializers: [],
                    },
                  ],
                },
                kind: 'Dictionary',
              },
              id: 'ownedNFTs',
            },
            {
              type: {
                kind: 'StoragePath',
              },
              id: 'storagePath',
            },
            {
              type: {
                kind: 'PublicPath',
              },
              id: 'publicPath',
            },
          ],
          initializers: [],
        },
      },
      ids: filteredData.map((nft) => nft.id),
    };

    return result;
  }

  const nextPage = async () => {
    console.log('next');
  };

  function truncate(str, n) {
    return str.length > n ? str.slice(0, n - 1) + '...' : str;
  }

  const hasMore = (): boolean => {
    if (list && list.length == 0) {
      return true;
    }
    return list.length < total;
  };

  const loader = (
    <Box sx={{ display: 'flex', py: '8px', justifyContent: 'center' }}>
      <LLSpinner size={28} />
    </Box>
  );

  useEffect(() => {
    fetchCollection();
  }, []);

  const createGridCard = (data, index) => {
    return (
      <GridView
        data={data}
        blockList={[]}
        accessible={uselocation.state ? uselocation.state.accessible : []}
        key={data.unique_id}
        index={index}
        ownerAddress={ownerAddress}
      />
    );
  };

  return (
    <StyledEngineProvider injectFirst>
      <div className="page" id="scrollableDiv" style={{ overflow: 'auto' }}>
        <Box className={classes.iconbox}>
          <IconButton onClick={() => history.push('/dashboard')} className={classes.arrowback}>
            <ArrowBackIcon sx={{ color: 'icon.navi' }} />
          </IconButton>
        </Box>

        {info ? (
          <>
            <Grid container sx={{ width: '100%', p: '0 25px 18px 25px' }}>
              <Grid
                item
                sx={{
                  justifyContent: 'center',
                  backgroundColor: '#121212',
                  width: '108px',
                  height: '108px',
                }}
              >
                <img
                  src={info?.collectionDisplay?.squareImage?.file?.url || info?.logo}
                  alt="collection avatar"
                  style={{ borderRadius: '12px', width: '100%', height: '100%' }}
                />
              </Grid>
              <Grid item sx={{ ml: 0, pl: '18px' }}>
                <Typography component="div" color="text.primary" variant="h6">
                  {truncate(info?.collectionDisplay?.name || info.name, 16)}
                </Typography>

                <Tooltip title={chrome.i18n.getMessage('Refresh')} arrow>
                  <ButtonBase sx={{ flexGrow: 1, justifyContent: 'flex-start' }}>
                    <Typography component="div" color="text.secondary" variant="body1">
                      {total | 0} {chrome.i18n.getMessage('NFTs')}
                    </Typography>
                    <IconButton
                      aria-label="close"
                      color="primary"
                      size="small"
                      // onClick={onCloseBtnClicked}
                    >
                      <ReplayRoundedIcon fontSize="inherit" />
                    </IconButton>
                  </ButtonBase>
                </Tooltip>

                <Box sx={{ p: 0, mt: '10px' }}>
                  {info.marketplace && (
                    <Button
                      startIcon={
                        <StorefrontOutlinedIcon
                          width="16px"
                          color="primary"
                          sx={{ ml: '4px', mr: 0 }}
                        />
                      }
                      sx={{
                        backgroundColor: 'neutral2.main',
                        color: 'text.secondary',
                        borderRadius: '12px',
                        textTransform: 'none',
                        p: '10px 8px',
                        mr: '10px',
                      }}
                    >
                      <a
                        href={info.marketplace}
                        target="_blank"
                        style={{ textTransform: 'none', color: 'inherit', ml: 0 }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '14px' }}>
                          {chrome.i18n.getMessage('Market')}
                        </Typography>
                      </a>
                    </Button>
                  )}
                  {info.collectionDisplay?.externalURL && (
                    <Button
                      startIcon={
                        <PublicOutlinedIcon
                          width="16px"
                          color="primary"
                          sx={{ ml: '4px', mr: 0 }}
                        />
                      }
                      sx={{
                        backgroundColor: 'neutral2.main',
                        color: 'text.secondary',
                        borderRadius: '12px',
                        textTransform: 'none',
                        p: '10px 8px',
                      }}
                    >
                      <a
                        href={info.collectionDisplay?.externalURL?.url}
                        target="_blank"
                        style={{ textTransform: 'none', color: 'inherit', ml: 0 }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '14px' }}>
                          {chrome.i18n.getMessage('Website')}
                        </Typography>
                      </a>
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>

            {loading ? (
              <Grid container className={classes.grid}>
                {[...Array(4).keys()].map((key) => (
                  <Card className={classes.card} elevation={0} key={key}>
                    <CardMedia className={classes.cardmedia}>
                      <Skeleton
                        variant="rectangular"
                        width={150}
                        height={150}
                        sx={{ margin: '0 auto', borderRadius: '8px' }}
                      />
                    </CardMedia>
                    <CardContent className={classes.content}>
                      <Skeleton variant="text" width={150} sx={{ margin: '0 auto' }} />
                    </CardContent>
                  </Card>
                ))}
              </Grid>
            ) : (
              info && (
                <InfiniteScroll
                  dataLength={list.length} //This is important field to render the next data
                  next={nextPage}
                  hasMore={hasMore()}
                  loader={loader}
                  scrollableTarget="scrollableDiv"
                  style={{
                    backgroundColor: '#1B1B1B',
                    borderRadius: '16px 16px 0 0',
                  }}
                >
                  <Grid container className={classes.grid}>
                    {list && list.map(createGridCard)}
                    {list.length % 2 != 0 && <Card className={classes.cardNoHover} elevation={0} />}
                  </Grid>
                </InfiniteScroll>
              )
            )}
          </>
        ) : (
          <Grid container className={classes.grid}>
            {[...Array(4).keys()].map((key) => (
              <Card className={classes.card} elevation={0} key={key}>
                <CardMedia className={classes.cardmedia}>
                  <Skeleton
                    variant="rectangular"
                    width={150}
                    height={150}
                    sx={{ margin: '0 auto', borderRadius: '8px' }}
                  />
                </CardMedia>
                <CardContent className={classes.content}>
                  <Skeleton variant="text" width={150} sx={{ margin: '0 auto' }} />
                </CardContent>
              </Card>
            ))}
          </Grid>
        )}
      </div>
    </StyledEngineProvider>
  );
};

export default EvmCollectionDetail;
