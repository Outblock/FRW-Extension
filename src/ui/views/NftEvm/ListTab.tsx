/* eslint-disable indent */
import React, { forwardRef, useImperativeHandle } from 'react';
import { Box } from '@mui/system';
import { makeStyles } from '@mui/styles';
import {
  Typography,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Container,
  Grid,
  Skeleton,
} from '@mui/material';
import { Link, useHistory } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useEffect, useState } from 'react';
import { useWallet } from '@/ui/utils/WalletContext';
import EmptyStatus from './EmptyStatus';

interface ListTabProps {
  data: any;
  setCount: (count: any) => void;
  accessible: any;
  isActive: boolean;
  nftList: any;
}


const useStyles = makeStyles(() => ({
  collectionContainer: {
    width: '100%',
    justifyContent: 'center',
  },
  collectionCard: {
    display: 'flex',
    width: '100%',
    height: '64px',
    margin: '12px auto',
    boxShadow: 'none',
  },
  skeletonCard: {
    display: 'flex',
    backgroundColor: '#000000',
    width: '100%',
    height: '72px',
    margin: '12px auto',
    boxShadow: 'none',
    padding: 'auto',
  },
  collectionImg: {
    borderRadius: '12px',
    width: '48px',
    padding: '8px',
  },
  arrow: {
    position: 'absolute',
    top: 0,
  },
  actionarea: {
    width: '100%',
    height: '100%',
    backgroundColor: '#282828',
    '&:hover': {
      color: '#787878',
      backgroundColor: '#787878',
    },
  },
}));

const ListTab = forwardRef((props: ListTabProps, ref) => {
  const history = useHistory();
  const classes = useStyles();
  const usewallet = useWallet();
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [collections, setCollections] = useState<any[]>([]);
  const [isCollectionEmpty, setCollectionEmpty] = useState(true);
  const [accesibleArray, setAccessible] = useState([{ id: '' }]);
  const [ownerAddress, setAddress] = useState('');

  useEffect(() => {
    reverseTransformCollections();
  }, []);

  useEffect(() => {
    if (props.data.ownerAddress) {
      setAddress(props.data.ownerAddress);
    }
  }, [props.data.ownerAddress]);


  const reverseTransformCollections = () => {
    const collectionsMap = {};
    const nftCatalogModels = props.nftList;
    nftCatalogModels.forEach(nft => {
      const collectionID = nft.collectionID;

      if (!collectionsMap[collectionID]) {
        collectionsMap[collectionID] = {
          collection: {
            id: nft.collectionID,
            contract_name: nft.collectionContractName,
            logo: nft.collectionSquareImage,
            address: nft.contractAddress,
            name: nft.collectionName,
            banner: nft.collectionBannerImage,
            official_website: nft.collectionExternalURL,
            description: nft.collectionDescription,
            path: {
              // Assuming static values for the path, adjust as necessary
              storage_path: `/storage/${nft.collectionContractName}Collection`,
              public_path: `/public/${nft.collectionContractName}Collection`,
              public_collection_name: "NonFungibleToken.CollectionPublic",
              public_type: `${nft.collectionContractName}.Collection{${nft.collectionContractName}.CollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Receiver,MetadataViews.ResolverCollection}`,
              private_type: `${nft.collectionContractName}.Collection{${nft.collectionContractName}.CollectionPublic,NonFungibleToken.CollectionPublic,NonFungibleToken.Provider,MetadataViews.ResolverCollection}`
            },
            socials: {
              // Assuming static values for the socials, adjust as necessary
              discord: { url: "https://discord.gg/example" },
              twitter: { url: "https://twitter.com/example" }
            }
          },
          ids: [],
          count: 0
        };
      }

      collectionsMap[collectionID].ids.push(nft.id);
      collectionsMap[collectionID].count += 1;
    });
    console.log('collectionsMap ', Object.values(collectionsMap))
    const objCollections = Object.values(collectionsMap);
    if (objCollections.length > 0) {
      setCollectionEmpty(false);
    }
    setCollectionLoading(false);
    setCollections(objCollections);
  };

  const CollectionView = (data) => {
    console.log('props  ', props)
    return (
      <Card sx={{ borderRadius: '12px' }} className={classes.collectionCard}>
        <CardActionArea
          sx={{ backgroundColor: 'background.paper', borderRadius: '12px' }}
          className={classes.actionarea}
          onClick={() =>
            history.push({
              pathname: `/dashboard/nested/evm/collectiondetail/${data.ownerAddress + '.' + data.contract_name + '.' + data.count
                }`,
              state: {
                collection: data,
                ownerAddress: data.ownerAddress,
                accessible: props.accessible
              }
            })
          }

        >
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <CardMedia
              component="img"
              sx={{
                width: '48px',
                height: '48px',
                margin: '8px',
                borderRadius: '12px',
                justifyContent: 'center',
              }}
              image={data.logo}
              alt={data.name}
            />
            <CardContent sx={{ flex: '1 0 auto', padding: '8px 4px' }}>
              <Grid container>
                <Grid item sx={{ width: '260px' }}>
                  <Typography
                    component="div"
                    variant="body1"
                    color="#fff"
                    sx={{ mb: 0 }}
                  >
                    {data.name}
                  </Typography>


                  {
                    (!accesibleArray.some(item => {
                      const parts = item.id.split('.');
                      const thirdString = parts[2];
                      return data.contract_name === thirdString;
                    }) && !props.isActive) ?

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '67px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          color: 'neutral.text',
                          marginTop: '2px',
                          fontSize: '10px',
                          fontFamily: 'Inter, sans-serif',
                          backgroundColor: 'neutral1.light'
                        }}
                      >
                        {chrome.i18n.getMessage('Inaccessible')}
                      </Box>
                      :
                      <Typography
                        variant="body1"
                        sx={{ fontSize: '14px' }}
                        color="#B2B2B2"
                        component="div"
                      >
                        {data.count}{' '}{chrome.i18n.getMessage('collectibles')}
                      </Typography>
                  }
                </Grid>
                <Grid item>
                  <ArrowForwardIcon color="primary" sx={{ mt: '12px' }} />
                </Grid>
              </Grid>
            </CardContent>
          </Box>
        </CardActionArea>
      </Card>
    );
  };

  const createListCard = (props, index) => {
    return (
      <CollectionView
        name={props.collection.name}
        logo={props.collection.logo}
        // number={props.number}
        key={props.collection.name}
        count={props.count}
        index={index}
        contract_name={props.collection.id}
        ownerAddress={ownerAddress}
      />
    );
  };

  return (
    <Container className={classes.collectionContainer}>
      {collectionLoading ? (
        <div>
          <Card
            sx={{
              borderRadius: '12px',
              backgroundColor: '#000000',
              padding: '12px',
            }}
            className={classes.skeletonCard}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <CardMedia
                sx={{
                  width: '48px',
                  height: '48px',
                  justifyContent: 'center',
                }}
              >
                <Skeleton variant="circular" width={48} height={48} />
              </CardMedia>
              <CardContent sx={{ flex: '1 0 auto', padding: '0 8px' }}>
                <Skeleton variant="text" width={280} />
                <Skeleton variant="text" width={150} />
              </CardContent>
            </Box>
          </Card>

          <Card
            sx={{
              borderRadius: '12px',
              backgroundColor: '#000000',
              padding: '12px',
            }}
            className={classes.skeletonCard}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <CardMedia
                sx={{
                  width: '48px',
                  height: '48px',
                  justifyContent: 'center',
                }}
              >
                <Skeleton variant="circular" width={48} height={48} />
              </CardMedia>
              <CardContent sx={{ flex: '1 0 auto', padding: '0 8px' }}>
                <Skeleton variant="text" width={280} />
                <Skeleton variant="text" width={150} />
              </CardContent>
            </Box>
          </Card>

          <Card
            sx={{
              borderRadius: '12px',
              backgroundColor: '#000000',
              padding: '12px',
            }}
            className={classes.skeletonCard}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <CardMedia
                sx={{
                  width: '48px',
                  height: '48px',
                  justifyContent: 'center',
                }}
              >
                <Skeleton variant="circular" width={48} height={48} />
              </CardMedia>
              <CardContent sx={{ flex: '1 0 auto', padding: '0 8px' }}>
                <Skeleton variant="text" width={280} />
                <Skeleton variant="text" width={150} />
              </CardContent>
            </Box>
          </Card>

          <Card
            sx={{
              borderRadius: '12px',
              backgroundColor: '#000000',
              padding: '12px',
            }}
            className={classes.skeletonCard}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <CardMedia
                sx={{
                  width: '48px',
                  height: '48px',
                  justifyContent: 'center',
                }}
              >
                <Skeleton variant="circular" width={48} height={48} />
              </CardMedia>
              <CardContent sx={{ flex: '1 0 auto', padding: '0 8px' }}>
                <Skeleton variant="text" width={280} />
                <Skeleton variant="text" width={150} />
              </CardContent>
            </Box>
          </Card>
        </div>
      ) : isCollectionEmpty ? (
        <EmptyStatus />
      ) : (
        collections.map(createListCard)
      )}
    </Container>
  );
});

export default ListTab;
