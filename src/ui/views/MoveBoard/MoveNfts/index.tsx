import React, { useState, useEffect } from 'react';
import { Box, Button, Skeleton, Typography, Drawer, IconButton, ListItem, ListItemIcon, ListItemText, Avatar, CardMedia } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useWallet } from 'ui/utils';
import { useHistory } from 'react-router-dom';
import selectedCover from 'ui/FRWAssets/svg/selectedCover.svg';
import moveSelectDrop from 'ui/FRWAssets/svg/moveSelectDrop.svg';
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


const MoveNfts = (props: MoveBoardProps) => {


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
  const [collectionLoaded, setCollectionLoaded] = useState(false);
  const [selectCollection, setSelectCollection] = useState(false);
  const [currentCollection, setCurrentCollection] = useState<any>({
    CollectionName: '',
    NftCount: 0,
    id: '',
    address: '',
    logo: '',
  });
  // console.log('props.loggedInAccounts', props.current)

  const findCollectionByContractName = () => {
    if (collectionList) {
      const collection = collectionList.find(collection => collection.id === selectedCollection);
      setCurrentCollection(collection);
    }

  };

  const requestCadenceNft = async () => {
    const cadenceResult = await usewallet.requestCadenceNft();
    console.log(cadenceResult[0].collection.id, ' cadenceResult[0].collection.id')
    setSelected(cadenceResult[0].collection.id);
    const extractedObjects = cadenceResult.map(obj => {
      return {
        CollectionName: obj.collection.contract_name,
        NftCount: obj.count,
        id: obj.collection.id,
        address: obj.collection.address,
        logo: obj.collection.logo,
      };

    });

    setCollectionList(extractedObjects);
    setCadenceNft(cadenceResult);
  };

  const requestCollectionInfo = async () => {
    if (selectedCollection) {
      const cadenceResult = await usewallet.requestCollectionInfo(selectedCollection);
      setCollectionDetail(cadenceResult);
    }
  };

  const toggleSelectNft = async (nftId) => {
    const tempIdArray = [...nftIdArray];
    const index = tempIdArray.indexOf(nftId);

    if (index === -1) {
      // If nftId is not in the array, add it
      tempIdArray.push(nftId);
    } else {
      // If nftId is in the array, remove it
      tempIdArray.splice(index, 1);
    }

    setNftIdArray(tempIdArray);
  };

  const moveNFT = async () => {
    setSending(true);
    usewallet.batchBridgeNftToEvm(collectionDetail.collection.address, collectionDetail.collection.contract_name, nftIdArray).then(async (txID) => {
      usewallet.listenTransaction(txID, true, `Move complete`, `You have moved ${nftIdArray.length} ${collectionDetail.collection.contract_name} to your evm address. \nClick to view this transaction.`,);
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
    requestCollectionInfo();
  }, [selectedCollection])

  useEffect(() => {
    findCollectionByContractName();
  }, [collectionList, selectedCollection])

  return (
    <Drawer
      anchor="bottom"
      sx={{ zIndex: '1600 !important' }}
      transitionDuration={300}
      open={props.showMoveBoard}
      PaperProps={{
        sx: { width: '100%', height: '479px', background: '#222', borderRadius: '18px 18px 0px 0px', },
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
        <Box sx={{height:'24px', padding:'6px 0'}}>
          <Typography
            variant="body1"
            component="div"
            display="inline"
            color='text'
            sx={{ fontSize: '14px', textAlign: 'center', lineHeight: '24px',fontWeight: '600' }}
          >
            Collection
          </Typography>
        </Box>
        {currentCollection &&
          <Button onClick={() => setSelectCollection(true)} >
            {currentCollection.logo && <CardMedia component="img" sx={{ width: '24px', height: '24px', display: 'inline', borderRadius: '8px', marginRight: '8px', objectFit: 'cover', objectPosition: 'left !important' }} image={currentCollection.logo} />}
            <Typography
              variant="body1"
              component="div"
              display="inline"
              color='text'
              sx={{ fontSize: '14px', textAlign: 'center', lineHeight: '24px', fontWeight: '600' }}
            >
              Select
            </Typography>
            <CardMedia component="img" sx={{ width: '16px', height: '16px', marginLeft: '4px' }} image={moveSelectDrop} />
          </Button>

        }
      </Box>
      {collectionDetail ?
        <Box sx={{ display: 'flex', mb: '18px', padding: '18px', gap: '4px', flexWrap: 'wrap', justifyContent: collectionDetail.nfts.length <= 4 ? 'flex-start' : 'space-between' }}>

          {
            collectionDetail.nfts.map((nft) => (
              <Box key={nft.id} sx={{
                display: 'flex', position: 'relative', width: '84px', height: '84px', borderRadius: '16px', marginBottom: '3px', backgroundColor: '#333',
              }}>

                <Button onClick={() => toggleSelectNft(nft.id)}>
                  {nftIdArray.includes(nft.id) && <CardMedia component="img" sx={{ width: '84px', height: '84px', zIndex: '2000', position: 'absolute' }} image={selectedCover} />}
                  <CardMedia
                    component="img"
                    alt={nft.name}
                    height="84px"
                    image={nft.thumbnail}
                    title={nft.name}
                  />
                </Button>
              </Box>
            ))
          }
        </Box>
        :
        <Box sx={{ display: 'flex', mb: '18px', padding: '18px', gap: '4px' }}>
          <Box sx={{ display: 'flex', width: '84px', height: '84px', borderRadius: '16px', backgroundColor: '#333' }}>
            <Skeleton
              variant="rectangular"
              width={84}
              height={84}
              sx={{ margin: '0 auto', borderRadius: '16px' }}
            />
          </Box>
          <Box sx={{ display: 'flex', width: '84px', height: '84px', borderRadius: '16px', backgroundColor: '#333' }}>
            <Skeleton
              variant="rectangular"
              width={84}
              height={84}
              sx={{ margin: '0 auto', borderRadius: '16px' }}
            />
          </Box>
          <Box sx={{ display: 'flex', width: '84px', height: '84px', borderRadius: '16px', backgroundColor: '#333' }}>
            <Skeleton
              variant="rectangular"
              width={84}
              height={84}
              sx={{ margin: '0 auto', borderRadius: '16px' }}
            />
          </Box>
          <Box sx={{ display: 'flex', width: '84px', height: '84px', borderRadius: '16px', backgroundColor: '#333' }}>
            <Skeleton
              variant="rectangular"
              width={84}
              height={84}
              sx={{ margin: '0 auto', borderRadius: '16px' }}
            />
          </Box>
        </Box>
      }
      <Box sx={{ flex: '1' }}></Box>

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
          marginBottom: '33px',
          mx: '16px',
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
                  Move {nftIdArray.length > 0 && nftIdArray.length} NFT{nftIdArray.length > 1 && 's'}
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


export default MoveNfts;