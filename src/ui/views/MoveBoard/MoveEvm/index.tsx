import React, { useState, useEffect } from 'react';
import { Box, Button, Skeleton, Typography, Drawer, IconButton, ListItem, ListItemIcon, ListItemText, Avatar, CardMedia } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useWallet } from 'ui/utils';
import { useHistory } from 'react-router-dom';
import popLock from 'ui/FRWAssets/svg/popLock.svg';
import popAdd from 'ui/FRWAssets/svg/popAdd.svg';
import iconCheck from 'ui/FRWAssets/svg/iconCheck.svg';
import vmsvg from 'ui/FRWAssets/svg/viewmore.svg';
import MoveCollectionSelect from '../MoveCollectionSelect';
import {
  LLSpinner,
} from 'ui/FRWComponent';




interface MoveBoardProps {
  showMoveBoard: boolean;
  handleCloseIconClicked: () => void;
  handleCancelBtnClicked: () => void;
  handleAddBtnClicked: () => void;
}


const MoveEvm = (props: MoveBoardProps) => {


  const usewallet = useWallet();
  const history = useHistory();
  const [viewmore, setMore] = useState<boolean>(false);
  const [cadenceNft, setCadenceNft] = useState<any>(null);
  const [collectionList, setCollectionList] = useState<any>(null);
  const [selectedCollection, setSelected] = useState<string>('');
  const [collectionDetail, setCollectionDetail] = useState<any>(null);
  const [nftIdArray, setNftIdArray] = useState<number[]>([]);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [occupied, setOccupied] = useState(true);
  const [selectCollection, setSelectCollection] = useState(false);
  // console.log('props.loggedInAccounts', props.current)


  const updateCurrentCollection = async () => {
    const collection = collectionList.find(collection => collection.id === selectedCollection);
    setCollectionDetail(collection);
  };

  const requestCadenceNft = async () => {
    const cadenceResult = await usewallet.reqeustEvmNft();
    const tokensWithNfts = cadenceResult.filter(token => token.nftIds && token.nftIds.length > 0);
    setSelected(tokensWithNfts[0].name);
    const extractedObjects = tokensWithNfts.map(obj => {
      console.log('obj ', obj.nfts)
      console.log('obj ', obj.nfts.length)
      const flowIdentifierParts = obj.flowIdentifier.split('.');
      return {
        CollectionName: flowIdentifierParts[2],
        NftCount: obj.nfts.length,
        id: obj.name,
        address: flowIdentifierParts[1],
        logo: obj.logoURI,
      };
    });

    setCollectionList(extractedObjects);

    console.log('cadenceResult ', tokensWithNfts)
    setCadenceNft(tokensWithNfts);
  };

  const toggleSelectNft = async (nftId) => {
    const tempIdArray = [...nftIdArray];
    const index = tempIdArray.indexOf(nftId);

    if (index === -1) {
      tempIdArray.push(nftId);
    } else {
      tempIdArray.splice(index, 1);
    }

    setNftIdArray(tempIdArray);
  };

  const moveNFT = async () => {
    const collection = collectionList.find(collection => collection.id === selectedCollection);

    console.log('identifier ', collection);

    usewallet.batchBridgeNftFromEvm(`0x${collection.address}`, collection.CollectionName, nftIdArray).then(async (txID) => {
      usewallet.listenTransaction(txID, true, `Move complete`, `You have moved ${nftIdArray.length} ${collection.CollectionName} from evm to your flow address. \nClick to view this transaction.`,);
      props.handleCloseIconClicked();
      await usewallet.setDashIndex(0);
      setSending(false);
      history.push('/dashboard?activity=1');
    }).catch(() => {
      setSending(false);
      setFailed(true);
    })

  };

  useEffect(() => {
    requestCadenceNft();
  }, [])

  useEffect(() => {
    updateCurrentCollection();
  }, [collectionList, selectedCollection])


  return (
    <Drawer
      anchor="bottom"
      sx={{ zIndex: '1600 !important' }}
      transitionDuration={300}
      open={props.showMoveBoard}
      PaperProps={{
        sx: { width: '100%', height: 'auto', background: '#222', borderRadius: '18px 18px 0px 0px', },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', px: '20px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '24px', margin: '20px 0', alignItems: 'center', }}>
          <Box sx={{ width: '40px' }}></Box>
          <Typography
            variant="body1"
            component="div"
            display="inline"
            color='text'
            sx={{ fontSize: '18px', textAlign: 'center', lineHeight: '24px', fontWeight: '700' }}
          >
            Select NFTs
          </Typography>
          <Box>
            <IconButton onClick={props.handleCancelBtnClicked}>
              <CloseIcon
                fontSize="medium"
                sx={{ color: 'icon.navi', cursor: 'pointer' }}
              />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '16px', mt: '10px', padding: '0 18px' }}>
        <Box>
          <Typography
            variant="body1"
            component="div"
            display="inline"
            color='text'
            sx={{ fontSize: '14px', textAlign: 'center', lineHeight: '24px', fontWeight: '600' }}
          >
            Collection
          </Typography>
        </Box>
        {collectionDetail &&
          <Button onClick={() => setSelectCollection(true)} >
            <CardMedia component="img" sx={{ width: '24px', height: '24px', display: 'inline', borderRadius: '8px', paddingRight: '8px' }} image={collectionDetail.logo} />
            <Typography
              variant="body1"
              component="div"
              display="inline"
              color='text'
              sx={{ fontSize: '14px', textAlign: 'center', lineHeight: '24px', fontWeight: '600' }}
            >
              Select
            </Typography>
          </Button>
        }
      </Box>
      {collectionDetail ?
        <Box sx={{ display: 'flex', mb: '18px', padding: '18px', gap: '4px', flexWrap: 'wrap', justifyContent: collectionDetail.NftCount <= 4 ? 'flex-start' : 'space-between' }}>

          {
            cadenceNft.find(collection => collection.name === selectedCollection).nfts.map((nfts) => (
              <Box
                key={nfts.id}
                sx={{
                  display: 'flex',
                  width: '84px',
                  height: '84px',
                  marginBottom: '3px',
                  borderRadius: '16px',
                  backgroundColor: '#333',
                  border: nftIdArray.includes(nfts.id) ? '1px solid #41CC5D' : 'none'
                }}
              >
                <Button onClick={() => toggleSelectNft(nfts.id)}>
                  {/* Replace 'thumbnail' with the appropriate property from your NFT object */}
                  <CardMedia
                    component="img"
                    alt={nfts.name}
                    height="84px"
                    image={nfts.thumbnail} // Call a function to get the image link based on nftId
                    title={nfts.name}
                  />
                </Button>
              </Box>
            ))
          }
        </Box>
        :
        <Box sx={{ display: 'flex', mb: '18px', padding: '18px', gap: '4px' }}>
          <Box sx={{ display: 'flex', width: '74px', height: '74px', borderRadius: '16px', backgroundColor: '#333' }}>
            <Skeleton
              variant="rectangular"
              width={74}
              height={74}
              sx={{ margin: '0 auto', borderRadius: '16px' }}
            />
          </Box>
          <Box sx={{ display: 'flex', width: '74px', height: '74px', borderRadius: '16px', backgroundColor: '#333' }}>
            <Skeleton
              variant="rectangular"
              width={74}
              height={74}
              sx={{ margin: '0 auto', borderRadius: '16px' }}
            />
          </Box>
        </Box>
      }

      <Button
        onClick={moveNFT}
        // disabled={sending || occupied}
        variant="contained"
        color="success"
        size="large"
        sx={{
          height: '50px',
          borderRadius: '12px',
          textTransform: 'capitalize',
          display: 'flex',
          gap: '12px',
          marginBottom: '33px'
        }}
      >
        {sending ? (
          <>
            <LLSpinner size={28} />
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 'bold' }}
              color="text.primary"
            >
              {chrome.i18n.getMessage('Sending')}
            </Typography>
          </>
        ) :
          (
            <>
              {failed ?
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold' }}
                  color="text.primary"
                >
                  {chrome.i18n.getMessage('Transaction__failed')}
                </Typography>
                :
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 'bold' }}
                  color="text.primary"
                >
                  {chrome.i18n.getMessage('Send')}
                </Typography>
              }
            </>
          )}

      </Button>
      {selectCollection &&
        <MoveCollectionSelect
          showMoveBoard={selectCollection}
          handleCloseIconClicked={() => setSelectCollection(false)}
          handleCancelBtnClicked={() => setSelectCollection(false)}
          handleAddBtnClicked={() => setSelectCollection(false)}
          selectedCollection={selectedCollection}
          setSelected={setSelected}
          collectionList={collectionList}
        />
      }



    </Drawer >
  );
}


export default MoveEvm;