import React, { useState, Component } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import Store from '../store';
import { colors } from '../constants';
import commas from '../util/commas'

import SearchInput from './SearchInput';

const Search = styled(SearchInput)`
  flex: 0;
  padding: 8px;
`;


const Wrapper = styled('div')`
  flex: 0 0 300px;
  width: 300px;
  background-color: ${colors.primaryDark};
  display: flex;
  flex-direction: column;
`;

const Section = styled('div')`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 50%;
`;

const SectionTitle = styled('h3')`
  flex: 0;
  color: ${colors.icon};
  font-weight: 100;
  padding: 12px;
  margin: 0;
  box-shadow: 0 0 12px 3px rgba(0,0,0,.15);
  background-color: ${colors.primary};
  z-index: 1000;
`;

const SectionInner = styled('div')`
  flex: 1;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
`;


function needle(str1, str2) {
  return str1.toLowerCase().includes(str2);
}


export default observer(function SideMenu(props) {


  const [channelFilter, setChannelFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  const channelFilterLower = channelFilter.toLowerCase();
  const userFilterLower = userFilter.toLowerCase();

  const channels = Store.channels
    .filter(c => !channelFilter || needle(c.name, channelFilterLower))
    .map(channel => <ChannelItem channel={channel} key={channel.name} />);

  const users = Store.users
    .filter(u => !userFilter || needle(u.name, userFilterLower))
    .map(user => <UserItem user={user} key={user.name} />);


  return (
    <Wrapper>

      <Section>
        <SectionTitle>Channels</SectionTitle>
        <Search placeholder="Search channels" value={channelFilter} onChange={e => setChannelFilter(e.target.value)} />
        <SectionInner>{channels}</SectionInner>
      </Section>

      <Section>
        <SectionTitle>Users</SectionTitle>
        <Search placeholder="Search users" value={userFilter} onChange={e => setUserFilter(e.target.value)} />
        <SectionInner>{users}</SectionInner>
      </Section>

    </Wrapper>
  );
});



@observer
class ChannelItem extends Component {

  render() {

    const { channel } = this.props;

    const isSelected = Store.isSelected(channel);

    if (isSelected && Store.selectedMessage) {
      this.refs.self.scrollIntoView();
    }

    let count = '';
    if (channel.count) {
      count = count = <em style={{ fontSize: 11, color: isSelected ? colors.primarySuperDark : colors.primaryLight }}>{commas(channel.count)}&nbsp;message{channel.count === 1 ? '' : 's'}</em>;
    }

    return (
      <a
        href={'#' + channel.name}
        style={{ textDecoration: 'none' }}
        onClick={() => {
          Store.scrollPos = 0;
          Store.selectedMessage = null;
          Store.loadChannel(channel);
        }}
        ref="self"
      >
        <div style={{
          color: 'white',
          padding: '8px 12px',
          backgroundColor: isSelected ? colors.accent : ''
        }}>
          <p style={{ margin: 0, fontSize: 14, color: isSelected ? colors.text : 'white' }}>{channel.name}</p>
          {count}
        </div>
      </a>
    )
  }
}

@observer
class UserItem extends Component {

  render() {

    const { user } = this.props;

    // const isSelected = false; //Store.isSelected(user);
    const isSelected = Store.isSelected(user);

    // if (isSelected && Store.selectedMessage) {
    //   this.refs.self.scrollIntoView();
    // }

    let count = '';
    if (user.count) {
      count = count = <em style={{ fontSize: 11, color: isSelected ? colors.primarySuperDark : colors.primaryLight }}>{commas(user.count)}&nbsp;message{user.count === 1 ? '' : 's'}</em>;
    }

    return (
      <a
        href={'#' + user.name}
        style={{ textDecoration: 'none' }}
        onClick={() => {
          Store.selectedMessage = null;
          Store.loadUser(user);
        }}
        ref="self"
      >
        <div style={{
          color: 'white',
          padding: '6px 12px',
          backgroundColor: isSelected ? colors.accent : ''
        }}>
          <p style={{ margin: 0, fontSize: 14, color: isSelected ? colors.text : 'white' }}>{user.name}</p>
          {count}
        </div>
      </a>
    )
  }
}