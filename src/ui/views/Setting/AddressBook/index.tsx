import React, { useState, useEffect } from 'react';
import {
  List,
  ListItemText,
  ListItem,
  ListSubheader,
  ListItemAvatar,
  Input,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { makeStyles } from '@mui/styles';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddOrEditAddress from './AddOrEditAddress';
import { useWallet } from 'ui/utils';
import EmptyStateImage from 'ui/FRWAssets/image/search_user.png';
import { StyledEngineProvider } from '@mui/material/styles';
import { Contact } from 'background/service/networkModel';
import AddressBookItem from './AddressBookItem';

const useStyles = makeStyles((theme) => ({
  customInputLabel: {
    '& legend': {
      visibility: 'visible',
    },
  },
  // inputBox: {
  //   minHeight: '46px',
  //   zIndex: '999',
  //   border: '1px solid #5E5E5E',
  //   borderRadius: '16px',
  //   boxSizing: 'border-box',
  //   margin: '2px 18px 10px 18px',
  // },
  inputBox: {
    minHeight: '56px',
    // borderRadius: theme.spacing(2),
    backgroundColor: '#282828',
    zIndex: '999',
    // width: '100%',
    borderRadius: '16px',
    boxSizing: 'border-box',
    // margin: '2px 18px 10px 18px',
    width: '100%',
    marginBottom: '16px',
  },
  inputWrapper: {
    paddingLeft: '18px',
    paddingRight: '18px',
    width: 'auto',
  },
}));

const AddressBook = () => {
  const [group, setGroup] = useState<Array<Contact>>([]);
  const grouped = _.groupBy(group, (contact) => contact.contact_name[0]);

  const history = useHistory();
  const classes = useStyles();
  const wallet = useWallet();

  const [name, setName] = useState('');
  const [foundContacts, setFoundContacts] = useState<Array<Contact>>(group);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEmptyList, setEmptyList] = useState<boolean>(false);
  const [editableContact, setEditableContact] = useState<Contact | undefined>(undefined);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const filter = (e1) => {
    const keyword = e1.target.value;

    if (keyword !== '') {
      const results = group.filter((contact) => {
        return contact.contact_name.toLowerCase().includes(keyword.toLowerCase());
      });
      setFoundContacts(results);
    } else {
      setFoundContacts(group);
    }
    setName(keyword);
  };

  const filterResult = _.groupBy(foundContacts, (contact) => contact.contact_name[0]);

  const fetchAddressBook = async () => {
    try {
      setIsLoading(true);
      const contacts = await wallet.getAddressBook();
      setEmptyList(contacts === null);
      setIsLoading(false);

      const sortedContacts = contacts.sort((a, b) =>
        a.contact_name.toLowerCase().localeCompare(b.contact_name.toLowerCase())
      );

      setGroup(sortedContacts);
      setFoundContacts(sortedContacts);
    } catch (err) {
      setIsLoading(false);
    }
  };

  const renderLoading = () => {
    return [1, 2, 3].map((index) => {
      return (
        <ListItem key={index}>
          <ListItemAvatar>
            <Skeleton variant="circular" width={35} height={35} />
          </ListItemAvatar>
          <ListItemText
            disableTypography={true}
            primary={<Skeleton variant="text" width={45} height={15} />}
            secondary={<Skeleton variant="text" width={75} height={15} />}
          />
        </ListItem>
      );
    });
  };

  const renderEmptyState = () => {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={EmptyStateImage}
          style={{
            objectFit: 'none',
          }}
        />
        <Typography variant="body1" color="text.secondary">
          {chrome.i18n.getMessage('Empty__List')}
        </Typography>
      </Box>
    );
  };

  const setTab = async () => {
    await wallet.setDashIndex(3);
  };

  useEffect(() => {
    setTab();
    fetchAddressBook();
  }, []);

  const handleEditClicked = (contact: Contact) => {
    setIsEdit(true);
    setEditableContact(contact);

    setIsAddAddressOpen(true);
  };

  const handleDeleteClicked = async (contact: Contact) => {
    const response = await wallet.openapi.deleteAddressBook(contact.id);
    if (response.status === 200) {
      await wallet.refreshAddressBook();
      fetchAddressBook();
    }
  };

  return (
    <Box className="page" style={{ display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: 'auto',
            px: '16px',
          }}
        >
          <ArrowBackIcon
            fontSize="medium"
            sx={{ color: 'icon.navi', cursor: 'pointer' }}
            onClick={() => history.push('/dashboard')}
          />
          <Typography
            variant="h1"
            sx={{
              py: '14px',
              alignSelf: 'center',
              fontSize: '20px',
            }}
          >
            {chrome.i18n.getMessage('Address__Book')}
          </Typography>
          <AddIcon
            fontSize="medium"
            sx={{ color: 'icon.navi', cursor: 'pointer' }}
            onClick={() => {
              setIsAddAddressOpen(true);
              setIsEdit(false);
            }}
          />
        </Box>
        <div className={classes.inputWrapper}>
          <Input
            type="search"
            value={name}
            onChange={filter}
            className={classes.inputBox}
            placeholder={chrome.i18n.getMessage('Search')}
            autoFocus
            disableUnderline
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon color="primary" sx={{ ml: '10px', my: '5px', fontSize: '24px' }} />
              </InputAdornment>
            }
          />
        </div>

        <AddOrEditAddress
          isAddAddressOpen={isAddAddressOpen}
          handleCloseIconClicked={() => setIsAddAddressOpen(false)}
          handleCancelBtnClicked={() => setIsAddAddressOpen(false)}
          handleAddBtnClicked={() => {
            setIsAddAddressOpen(false);
            fetchAddressBook();
          }}
          editableContact={editableContact}
          isEdit={isEdit}
        />

        {isLoading ? (
          renderLoading()
        ) : (
          <div
            style={{
              flexGrow: 1,
              overflowY: 'scroll',
              justifyContent: 'space-between',
            }}
          >
            {isEmptyList ? (
              renderEmptyState()
            ) : (
              <div style={{ flexGrow: 1 }}>
                {filterResult && filterResult.value !== null ? (
                  <List
                    dense={false}
                    sx={{
                      paddingTop: '0px',
                      paddingBottom: '0px',
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                      overflow: 'auto',
                    }}
                  >
                    {Object.keys(filterResult).map((key) => (
                      <li key={`section-${key}`}>
                        <ul>
                          <ListSubheader
                            sx={{
                              lineHeight: '18px',
                              marginTop: '0px',
                              marginBottom: '0px',
                              backgroundColor: '#121212',
                            }}
                          >
                            #{key.toUpperCase()}
                          </ListSubheader>
                          {filterResult[key].map((contact, index) => (
                            <AddressBookItem
                              key={index}
                              contact={contact}
                              index={index}
                              onEditClicked={handleEditClicked}
                              onDeleteClicked={handleDeleteClicked}
                            />
                          ))}
                        </ul>
                      </li>
                    ))}
                  </List>
                ) : (
                  <List>
                    <ListItem>
                      <ListItemText
                        primary={chrome.i18n.getMessage('No__results__found')}
                        sx={{ paddingLeft: '120px' }}
                      />
                    </ListItem>
                  </List>
                )}
              </div>
            )}
          </div>
        )}
      </Box>
    </Box>
  );
};

export default AddressBook;
