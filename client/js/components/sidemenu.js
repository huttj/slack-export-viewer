import React, { Component } from 'react';
import { observer } from 'mobx-react';

import Store from '../store';
import { colors } from '../constants';
import commas from '../util/commas'

@observer
export default class SideMenu extends Component {
  render() {

    const channels = Store.channels.map(channel => <ChannelItem channel={channel}/>);

    const users = Store.users.map(user => <UserItem user={user}/>);


    return (
      <div style={{ flex: '0 0 300px', width: 300, backgroundColor: colors.primaryDark, display: 'flex', flexDirection: 'column' }}>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ flex: 0, color: colors.icon, fontWeight: '100', padding: 12, margin: 0, boxShadow: '0 0 12px 3px rgba(0,0,0,.15)', backgroundColor: colors.primary, zIndex: 1000 }}>Channels</h3>
          <div style={{ flex: 1, height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>{channels}</div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ flex: 0, color: colors.icon, fontWeight: '100', padding: 12, margin: 0, boxShadow: '0 0 12px 3px rgba(0,0,0,.15)', backgroundColor: colors.primary, zIndex: 1000 }}>Users</h3>
          <div style={{ flex: 1, height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>{users}</div>
        </div>

      </div>
    );
  }
}


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
        style={{textDecoration: 'none'}}
        key={channel.id}
        onClick={() => {
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
        style={{textDecoration: 'none'}}
        key={user.name}
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