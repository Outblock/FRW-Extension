import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Skeleton, Typography, Drawer, IconButton, CardMedia } from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import WarningSnackbar from '@/ui/FRWComponent/WarningSnackbar';
import { WarningStorageLowSnackbar } from '@/ui/FRWComponent/WarningStorageLowSnackbar';
import { useStorageCheck } from '@/ui/utils/useStorageCheck';
import alertMark from 'ui/FRWAssets/svg/alertMark.svg';
import moveSelectDrop from 'ui/FRWAssets/svg/moveSelectDrop.svg';
import selected from 'ui/FRWAssets/svg/selected.svg';
import { LLSpinner } from 'ui/FRWComponent';
import { useWallet } from 'ui/utils';

import AccountBox from '../AccountBox';
import MoveCollectionSelect from '../MoveCollectionSelect';

interface MoveBoardProps {
  showMoveBoard: boolean;
  handleCloseIconClicked: () => void;
  handleCancelBtnClicked: () => void;
  handleAddBtnClicked: () => void;
  handleReturnHome: () => void;
}

const MoveEvm = (props: MoveBoardProps) => {
  const usewallet = useWallet();
  const history = useHistory();
  const [cadenceNft, setCadenceNft] = useState<any>(null);
  const [collectionList, setCollectionList] = useState<any>(null);
  const [selectedCollection, setSelected] = useState<string>('');
  const [collectionDetail, setCollectionDetail] = useState<any>(null);
  const [collectInfo, setCollectionInfo] = useState<any>(null);
  const [nftIdArray, setNftIdArray] = useState<number[]>([]);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorOpen, setShowError] = useState(false);
  const [selectCollection, setSelectCollection] = useState(false);
  const [selectedAccount, setSelectedChildAccount] = useState(null);
  const { sufficient: isSufficient, sufficientAfterAction } = useStorageCheck({
    transferAmount: 0,
    movingBetweenEVMAndFlow: true,
  });

  const isLowStorage = isSufficient !== undefined && !isSufficient; // isSufficient is undefined when the storage check is not yet completed
  const isLowStorageAfterAction = sufficientAfterAction !== undefined && !sufficientAfterAction;

  const handleErrorClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowError(false);
  };

  const updateCurrentCollection = useCallback(async () => {
    if (collectionList && cadenceNft) {
      const collection = collectionList.find((collection) => collection.id === selectedCollection);

      const cadenceResult = await usewallet.EvmNFTcollectionList(selectedCollection);
      setCollectionDetail(collection);
      setCollectionInfo(cadenceResult);
    }
  }, [collectionList, cadenceNft, selectedCollection, usewallet]);

  const requestCadenceNft = useCallback(async () => {
    const cadenceResult = await usewallet.reqeustEvmNft();
    const tokensWithNfts = cadenceResult.filter((token) => token.ids && token.ids.length > 0);
    const filteredData = tokensWithNfts.filter((item) => item.collection.flowIdentifier);
    if (filteredData.length > 0) {
      setSelected(filteredData[0].collection.id);
      const extractedObjects = filteredData.map((obj) => {
        const flowIdentifierParts = obj.collection.flowIdentifier.split('.');
        return {
          CollectionName: flowIdentifierParts[2],
          NftCount: obj.count,
          id: obj.collection.id,
          address: flowIdentifierParts[1],
          logo: obj.collection.logo,
          flowIdentifier: obj?.collection?.flowIdentifier || '',
        };
      });
      setCadenceNft(filteredData);
      setCollectionList(extractedObjects);
    } else {
      setCollectionInfo({ nfts: [] });
    }
    setLoading(false);
  }, [usewallet]);

  const toggleSelectNft = async (nftId) => {
    const tempIdArray = [...nftIdArray];
    const index = tempIdArray.indexOf(nftId);

    if (index === -1) {
      // If nftId is not in the array, add it
      if (tempIdArray.length < 9) {
        tempIdArray.push(nftId);
      } else {
        // Display an error or warning message that no more than 3 IDs are allowed
        setShowError(true);
      }
    } else {
      // If nftId is in the array, remove it
      tempIdArray.splice(index, 1);
    }

    setNftIdArray(tempIdArray);
  };

  const moveNFT = async () => {
    const parentAddress = await usewallet.getMainAddress();
    if (parentAddress === selectedAccount!['address']) {
      moveToParent();
    } else {
      moveToChild();
    }
  };

  const moveToChild = async () => {
    setSending(true);
    const collection = collectionList.find((collection) => collection.id === selectedCollection);
    console.log('collectionDetail ', selectedCollection);
    usewallet
      .batchBridgeChildNFTFromEvm(
        selectedAccount!['address'],
        collection.flowIdentifier,
        nftIdArray
      )
      .then(async (txID) => {
        usewallet.listenTransaction(
          txID,
          true,
          `Move complete`,
          `You have moved ${nftIdArray.length} ${collection.CollectionName} from evm to your flow address. \nClick to view this transaction.`
        );
        props.handleReturnHome();
        props.handleCloseIconClicked();
        await usewallet.setDashIndex(0);
        setSending(false);
        history.push('/dashboard?activity=1');
      })
      .catch((err) => {
        console.log(err);
        setSending(false);
        setFailed(true);
      });
  };

  const moveToParent = async () => {
    setSending(true);
    const collection = collectionList.find((collection) => collection.id === selectedCollection);
    console.log('collectionDetail ', collectionDetail);
    usewallet
      .batchBridgeNftFromEvm(collection.flowIdentifier, nftIdArray)
      .then(async (txID) => {
        usewallet.listenTransaction(
          txID,
          true,
          `Move complete`,
          `You have moved ${nftIdArray.length} ${collection.CollectionName} from evm to your flow address. \nClick to view this transaction.`
        );
        props.handleReturnHome();
        props.handleCloseIconClicked();
        await usewallet.setDashIndex(0);
        setSending(false);
        history.push('/dashboard?activity=1');
      })
      .catch((err) => {
        console.log(err);
        setSending(false);
        setFailed(true);
      });
  };

  useEffect(() => {
    requestCadenceNft();
  }, [requestCadenceNft]);

  useEffect(() => {
    updateCurrentCollection();
  }, [collectionList, cadenceNft, selectedCollection, updateCurrentCollection]);

  return (
    <Drawer
      anchor="bottom"
      sx={{ zIndex: '1100 !important' }}
      transitionDuration={300}
      open={props.showMoveBoard}
      PaperProps={{
        sx: { width: '100%', height: 'calc(100% - 56px)', background: '#222' },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', px: '20px' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            height: '24px',
            margin: '20px 0',
            alignItems: 'center',
          }}
        >
          <Box sx={{ width: '40px' }}></Box>
          <Typography
            variant="body1"
            component="div"
            display="inline"
            color="text"
            sx={{
              fontSize: '20px',
              textAlign: 'center',
              fontFamily: 'e-Ukraine',
              lineHeight: '24px',
              fontWeight: '700',
            }}
          >
            {chrome.i18n.getMessage('select')} NFTs
          </Typography>
          <Box>
            <IconButton onClick={props.handleCancelBtnClicked}>
              <CloseIcon fontSize="medium" sx={{ color: 'icon.navi', cursor: 'pointer' }} />
            </IconButton>
          </Box>
        </Box>
      </Box>
      <AccountBox
        isChild={true}
        setSelectedChildAccount={setSelectedChildAccount}
        selectedAccount={selectedAccount}
        isEvm={true}
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: '0',
          mt: '10px',
          padding: '0 18px',
        }}
      >
        <Box sx={{ height: '24px', padding: '6px 0' }}>
          <Typography
            variant="body1"
            component="div"
            display="inline"
            color="text"
            sx={{ fontSize: '14px', textAlign: 'center', lineHeight: '24px', fontWeight: '600' }}
          >
            {chrome.i18n.getMessage('collection')}
          </Typography>
        </Box>
        {collectionDetail && (
          <Button onClick={() => setSelectCollection(true)}>
            <CardMedia
              component="img"
              sx={{
                width: '24px',
                height: '24px',
                display: 'inline',
                borderRadius: '8px',
                marginRight: '8px',
                objectFit: 'cover',
                objectPosition: 'left !important',
              }}
              image={collectionDetail.logo}
            />
            <Typography
              variant="body1"
              component="div"
              display="inline"
              color="text"
              sx={{ fontSize: '14px', textAlign: 'center', lineHeight: '24px', fontWeight: '600' }}
            >
              {collectionDetail.CollectionName}
            </Typography>
            <CardMedia
              component="img"
              sx={{ width: '12px', height: '12px', marginLeft: '4px' }}
              image={'https://raw.githubusercontent.com/Outblock/Assets/main/ft/flow/logo.png'}
            />
            <CardMedia
              component="img"
              sx={{ width: '16px', height: '16px', marginLeft: '4px' }}
              image={moveSelectDrop}
            />
          </Button>
        )}
      </Box>
      {!loading ? (
        <Box
          sx={{
            display: 'flex',
            mb: '18px',
            padding: '16px',
            gap: '4px',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            height: '150px',
            overflowY: 'scroll',
          }}
        >
          {collectInfo &&
            (collectInfo.nfts.length > 0 ? (
              collectInfo.nfts.map((items) => (
                <Box
                  key={items.id}
                  sx={{
                    display: 'flex',
                    position: 'relative',
                    width: '84px',
                    height: '84px',
                    borderRadius: '16px',
                    marginBottom: '3px',
                    border: nftIdArray.includes(items.id) ? '1px solid #41CC5D' : 'none',
                  }}
                >
                  <Button
                    onClick={() => toggleSelectNft(items.id)}
                    sx={{
                      padding: 0,
                      borderRadius: '16px',
                      backgroundColor: '#333',
                    }}
                  >
                    {nftIdArray.includes(items.id) && (
                      <Box
                        sx={{
                          backgroundColor: '#00000099',
                          borderRadius: '16px',
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                        }}
                      >
                        <CardMedia
                          component="img"
                          sx={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '16px',
                            top: '8px',
                            right: '8px',
                            zIndex: '2000',
                            position: 'absolute',
                          }}
                          image={selected}
                        />
                      </Box>
                    )}
                    <CardMedia
                      component="img"
                      alt={items.name}
                      height="84px"
                      width="84px"
                      sx={{ borderRadius: '16px' }}
                      image={items.thumbnail}
                      title={items.name}
                    />
                  </Button>
                </Box>
              ))
            ) : (
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <Typography
                  sx={{
                    color: '#FFFFFF66',
                    fontSize: '14px',
                    fontWeight: '700',
                  }}
                >
                  0 NFTs
                </Typography>
              </Box>
            ))}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', mb: '18px', padding: '18px', gap: '4px' }}>
          <Box
            sx={{
              display: 'flex',
              width: '84px',
              height: '84px',
              borderRadius: '16px',
              backgroundColor: '#333',
            }}
          >
            <Skeleton
              variant="rectangular"
              width={84}
              height={84}
              sx={{ margin: '0 auto', borderRadius: '16px' }}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              width: '84px',
              height: '84px',
              borderRadius: '16px',
              backgroundColor: '#333',
            }}
          >
            <Skeleton
              variant="rectangular"
              width={84}
              height={84}
              sx={{ margin: '0 auto', borderRadius: '16px' }}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              width: '84px',
              height: '84px',
              borderRadius: '16px',
              backgroundColor: '#333',
            }}
          >
            <Skeleton
              variant="rectangular"
              width={84}
              height={84}
              sx={{ margin: '0 auto', borderRadius: '16px' }}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              width: '84px',
              height: '84px',
              borderRadius: '16px',
              backgroundColor: '#333',
            }}
          >
            <Skeleton
              variant="rectangular"
              width={84}
              height={84}
              sx={{ margin: '0 auto', borderRadius: '16px' }}
            />
          </Box>
        </Box>
      )}
      <Box sx={{ flex: '1' }}></Box>
      <WarningStorageLowSnackbar
        isLowStorage={isLowStorage}
        isLowStorageAfterAction={isLowStorageAfterAction}
      />
      <Button
        onClick={moveNFT}
        // disabled={sending || occupied}
        variant="contained"
        color="success"
        size="large"
        disabled={!collectionDetail || collectionDetail.NftCount === 0}
        sx={{
          height: '50px',
          width: '100%',
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
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="text.primary">
              {chrome.i18n.getMessage('Sending')}
            </Typography>
          </>
        ) : (
          <>
            {failed ? (
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="text.primary">
                {chrome.i18n.getMessage('Transaction__failed')}
              </Typography>
            ) : (
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="text.primary">
                {chrome.i18n.getMessage('Move')} {nftIdArray.length > 0 && nftIdArray.length} NFT
                {nftIdArray.length > 1 && 's'}
              </Typography>
            )}
          </>
        )}
      </Button>
      {selectCollection && (
        <MoveCollectionSelect
          showMoveBoard={selectCollection}
          handleCloseIconClicked={() => setSelectCollection(false)}
          handleCancelBtnClicked={() => setSelectCollection(false)}
          handleAddBtnClicked={() => setSelectCollection(false)}
          selectedCollection={selectedCollection}
          setSelected={setSelected}
          collectionList={collectionList}
        />
      )}
      <WarningSnackbar
        open={errorOpen}
        onClose={handleErrorClose}
        alertIcon={alertMark}
        message={chrome.i18n.getMessage('Cannot_move_more')}
      />
    </Drawer>
  );
};

export default MoveEvm;
