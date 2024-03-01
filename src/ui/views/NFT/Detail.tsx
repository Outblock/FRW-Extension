import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { StyledEngineProvider } from '@mui/material/styles';
import { useWallet } from 'ui/utils';
import {
  Typography,
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { PostMedia, MatchMediaType } from '@/ui/utils/url';
import { saveAs } from 'file-saver'
import SendIcon from 'ui/FRWAssets/svg/send.svg';
import fallback from 'ui/FRWAssets/image/errorImage.png';
import { Link } from 'react-router-dom';
import Move from '../Move';

const useStyles = makeStyles(() => ({
  pageContainer: {
    height: '100%',
    width: '100%',
    overflowY: 'scroll',
    justifyContent: 'space-between',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column'
  },
  detailContainer: {
    width: '100%',
    backgroundColor: '#282828',
    borderRadius: '16px 16px 0 0',
    padding: '18px',
    margin: 0,
  },
  metadata: {
    borderRadius: '12px',
    border: '1px solid rgba(186, 186, 186, 0.4)',
    padding: '6px 10px',
    maxWidth: '360px',
  },
  mediabox: {
    width: '100%',
    // minHeight: '354px',
    justifyContent: 'center',
    backgroundColor: 'inherit',
    flexGrow: 1,
    paddingBottom: '10px'
  },
  media: {
    width: '100%',
    borderRadius: '8px',
  },
  arrowback: {
    borderRadius: '100%',
    margin: '8px',
  },
  iconbox: {
    position: 'sticky',
    top: 0,
    width: '100%',
    backgroundColor: '#121212',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  extendMore: {
    borderRadius: '100%',
    margin: '8px',
    marginRight: 0
  }
}));

interface NFTDetailState {
  nft: any;
  media: PostMedia;
  index: number;
  ownerAddress: any
}

const Detail = () => {
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const usewallet = useWallet();
  const [nftDetail, setDetail] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [contractInfo, setContractInfo] = useState<any>(null);
  const [ownerAddress, setOwnerAddress] = useState<any>(null);
  const [media, setMedia] = useState<PostMedia | null>(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [moveOpen, setMoveOpen] = useState<boolean>(true);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };


  const fetchNft = async () => {
    const state = location.state as NFTDetailState
    const NFT = state.nft
    const media = state.media
    const ownerAddress = state.ownerAddress
    // console.log('state ===>', state, NFT, media, ownerAddress)
    setDetail(NFT);
    setMedia(media);
    setOwnerAddress(ownerAddress);
    const nft_metadata = NFT
    setMetadata(nft_metadata);
    // const metadata_titles = ['name', 'title', 'description', 'uri', 'image', 'media', 'mimeType', 'type']
    // if (nft_metadata) {
    //   const metadata_titles = ['name', 'title', 'description', 'image', 'mimeType', 'uri']
    //   const filtered_metadata = nft_metadata
    //     .filter((metadata) => !metadata_titles.includes(metadata.name))
    //     .sort((a, b) => (a.value.length + a.name.length) - (b.value.length + b.name.length))

    //   setMetadata(filtered_metadata);
    // }
    const contractList = await usewallet.openapi.getAllNft();
    await usewallet.setDashIndex(1);
    const filteredCollections = returnFilteredCollections(contractList, NFT)
    if (filteredCollections.length > 0) {
      setContractInfo(filteredCollections[0])
    }
  }

  const replaceIPFS = (url: string | null): string => {
    if (!url) {
      return ''
    }

    const lilicoEndpoint = 'https://lilico.infura-ipfs.io/ipfs/'

    const replacedURL = url
      .replace('ipfs://', lilicoEndpoint)
      .replace('https://ipfs.infura.io/ipfs/', lilicoEndpoint)
      .replace('https://ipfs.io/ipfs/', lilicoEndpoint)
      .replace('https://lilico.app/api/ipfs/', lilicoEndpoint)

    return replacedURL
  }

  useEffect(() => {
    fetchNft();
  }, []);

  const returnFilteredCollections = (contractList, NFT) => {
    return contractList.filter(
      (collection) => collection.name == NFT.collectionName
    );
  }

  const downloadImage = (image_url, title) => {
    saveAs(image_url, title) // Put your image url here.
  }

  const MetaBox = (props) => {
    return (
      <Box className={classes.metadata}>
        <Typography
          color="neutral2.main"
          variant="caption"
          sx={{ textTransform: 'uppercase' }}
        >
          {props.name}
        </Typography>
        <Box sx={{
          width: '100%',
          maxWidth: '100%',
        }}>
          <Typography color="text.secondary" variant="body1" sx={{ width: '100%', maxWidth: '100%' }}>
            {props.value}
          </Typography>
        </Box>
      </Box>
    );
  };

  const createMetaBoxes = (props, index) => {
    if (props.value && typeof props.value === 'string')
      return <MetaBox meta_id={props.name} name={props.name} value={props.value} key={props.name + index} />;
  };


  const getUri = () => {
    return (
      <>
        {mediaLoading ? <div /> : (
          <div
            style={{
              background: '#222222',
              height: '100%',
              width: '100%',
              borderRadius: '8px'
            }}
          />
        )}

        {media && (
          media.image ?
            <img
              src={replaceIPFS(media.image)}
              className={classes.media}
              onLoad={() => setMediaLoading(true)}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.src = fallback;
              }}
            />
            :
            <>
              <video loop autoPlay controls muted preload="auto" controlsList='noremoteplayback nofullscreen' onLoadedData={() => setMediaLoading(true)}
                style={{ margin: '0 auto', width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}>
                <source src={media.video} type="video/mp4" className={classes.media} />
              </video>
            </>)
        }
      </>
    );
  };

  const getMedia = () => {
    return (
      <>
        {mediaLoading && <img src={replaceIPFS(media?.image || null)} className={classes.media} />}
        <video loop autoPlay controls muted playsInline preload="auto"
          controlsList='noremoteplayback nofullscreen'
          onLoadedData={() => setMediaLoading(false)}
          style={{ visibility: mediaLoading ? 'hidden' : 'visible', width: '100%' }}
        >
          <source src={media?.video || undefined} type="video/mp4" className={classes.media} />
        </video>
      </>
    )
  }

  return (
    <StyledEngineProvider injectFirst>
      <div className='page' style={{ display: 'flex', flexDirection: 'column' }}>
        <Box className={classes.iconbox}>
          <IconButton onClick={() => history.goBack()} className={classes.arrowback}>
            <ArrowBackIcon sx={{ color: 'icon.navi' }} />
          </IconButton>
          {/* {
            nftDetail && 
            <>
              <IconButton onClick={handleClick} className={classes.extendMore}>
                <MoreHorizIcon sx={{ color: 'icon.navi'}} />
              </IconButton>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
              >
                <MenuItem onClick={handleClose}>
                  <a href={'https://lilico.app/nft/' + ownerAddress +'/'+ nftDetail.contract.address +'/'+ nftDetail.contract.name + '?tokenId=' + nftDetail.id.tokenId} target="_blank">
                Share
                  </a>
                </MenuItem>
              </Menu>
            </>
          } */}
        </Box>

        {nftDetail &&
          <Container className={classes.pageContainer} sx={{ width: '100%' }}>
            <Box sx={{ padding: '10px 18px', justifyContent: 'center', backgroundColor: '#121212', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Box className={classes.mediabox}>
                {(media && media?.video != null) ?
                  getMedia() :
                  getUri()
                }
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                <Box sx={{ flex: '1 0 auto' }}>
                  <Typography component="div" color="text.primary" variant="h6" sx={{ maxWidth: '270px' }}>
                    {media?.title}
                  </Typography>

                  {contractInfo &&
                    <a href={contractInfo.official_website} target='_blank' >
                      <Typography
                        component="div"
                        color="text.secondary"
                        variant="body1"
                        display='flex'
                        flexDirection='row'
                        alignItems='center'
                      >
                        <img src={contractInfo.logo} width='20px' style={{ marginRight: '6px', borderRadius: '50%' }} />
                        {contractInfo.name}
                        <ArrowForwardOutlinedIcon sx={{ color: 'icon.navi', marginLeft: '6px', mt: 0, fontSize: '20px', padding: 0 }} />
                      </Typography>
                    </a>
                  }
                </Box>
                <Box sx={{ mt: 0, mr: 0, pr: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <IconButton
                    sx={{
                      backgroundColor: 'neutral2.main',
                      p: '8px',
                      aspectRatio: '1 / 1'
                      // mr: '10px',
                    }}
                    onClick={() => downloadImage(media?.image || media?.video, media?.title || 'NFT')}
                  >
                    <SaveAltIcon color="primary" />
                  </IconButton>

                  {!(contractInfo?.contract_name === 'Domains' && media?.title?.includes('.meow')) &&
                    <IconButton
                      sx={{ backgroundColor: 'neutral2.main', p: '12px', aspectRatio: '1 / 1' }}
                      onClick={() => history.push({
                        pathname: '/dashboard/nft/send',
                        state: { nft: nftDetail, media: media, contract: contractInfo }
                      })}
                    >
                      {/* <IosShareOutlinedIcon color="primary" /> */}
                      <img src={SendIcon} style={{ width: '20px', height: '20px' }} />
                    </IconButton>
                  }
                </Box>
              </Box>
            </Box>

            <Container className={classes.detailContainer}>
              <Box
                sx={{
                  display: 'inline-flex',
                  gap: '10px',
                  flexDirection: 'row',
                  p: '10px 0',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-start',
                  maxWidth: '400px'
                }}
              >
                {(metadata && metadata.traits) && metadata.traits.map(createMetaBoxes)}
              </Box>

              <Typography variant="body1" color="text.secondary" component="div" sx={{ mb: '90px' }}>
                {media && media.description}
              </Typography>
            </Container>
          </Container>
        }
        <Move
          isConfirmationOpen={moveOpen}
          data={{ amount: 0, }}
          handleCloseIconClicked={() => setMoveOpen(false)}
          handleCancelBtnClicked={() => setMoveOpen(false)}
          handleAddBtnClicked={() => {
            setMoveOpen(false);
          }}
        />
      </div>
    </StyledEngineProvider>
  );
};

export default Detail;
