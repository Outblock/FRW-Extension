import React, {useEffect, useState} from 'react';
import {
  List,
  ListSubheader,
  CardMedia,
  Typography,
  ButtonBase,
  Box,
} from '@mui/material';
import { groupBy, isEmpty } from 'lodash';
import { LLContactCard } from '../../FRWComponent';
import { useHistory } from 'react-router-dom';
import EmptyAddress from 'ui/assets/EmptyAddress.svg';

const AddressBookList = ({ filteredContacts, isLoading, handleClick }) => {

  const [grouped, setGrouped] = useState<any>([]);

  useEffect(() => {
    const group = groupBy(
      filteredContacts,
      (contact) => contact.contact_name[0]
    );
    setGrouped(group);
  }, [filteredContacts]);

  const history = useHistory();

  return (
    <Box sx={{height:'100%'}}>
      {!isEmpty(grouped) ? (
        Object.keys(grouped).map((key) => (
          <List
            dense={false}
            sx={{ paddingTop: '0px', paddingBottom: '0px' }}
            key={key}
          >
            <ListSubheader
              sx={{
                lineHeight: '18px',
                marginTop: '0px',
                marginBottom: '0px',
                backgroundColor: '#000000',
                textTransform: 'capitalize',
                py: '4px',
              }}
            >
                #{' '}{key}
            </ListSubheader>
            <Box>
              {grouped[key].map((eachgroup, index) => (
                <ButtonBase
                  key={`card-${index}`}
                  sx={{ display: 'contents' }}
                  onClick={() => handleClick(eachgroup)}
                >
                  <LLContactCard
                    contact={eachgroup}
                    hideCloseButton={true}
                    key={index}
                    isLoading={isLoading}
                  />
                </ButtonBase>
              ))}
            </Box>
          </List>
        ))
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height:'100%',
            backgroundColor:'#000000',
          }}>
          <CardMedia sx={{ width:'154px', height:'120px', margin:'50px auto 0', }} image={EmptyAddress} />
          <Typography
            variant="overline"
            sx={{ lineHeight: '1', textAlign: 'center', color:'#5E5E5E', marginTop:'5px', fontSize:'16px' }}
          >
            {chrome.i18n.getMessage('Search_to_find_more_users')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AddressBookList;
