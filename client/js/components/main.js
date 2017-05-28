import React, { Component } from 'react';
import { observer } from 'mobx-react';

import Message from './message';
import Search  from './search';

import Store   from '../store';
import { colors } from '../constants';
import commas from '../util/commas';

@observer
export default class Main extends Component {

  componentDidUpdate() {
    if (this.refs.container && Store.display && Store.display.length === 1 && Store.scrollPos) {
      this.refs.container.scrollTop = Store.scrollPos;
    }
  }

  onScroll() {
    Store.scrollPos = this.refs.container.scrollTop ? this.refs.container.scrollTop : Store.scrollPos ;
  }

  render() {

    let inner = null;
    if (Store.isLoading) {
      inner = (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: colors.primarySuperLight }}>
          <h1 style={{ flex: 1, textAlign: 'center', marginBottom: '15%', color: colors.primaryDark, textShadow: '0 0 3px rgba(255, 255, 255, 0.75)' }}>Loading!</h1>
        </div>
      );
    } else if (Store.display) {
      inner = Store.display && Store.display.map(c => <Channel channel={c}/>)
    }

    return (
      <div style={{ flex: 1, width: 0, flexDirection: 'column', display: 'flex', zIndex: 2000 }}>
        <Search/>
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', wordBreak: 'word' }} ref="container" onScroll={_=>this.onScroll()}>
          {inner}
        </div>
      </div>
    );
  }
}

class Channel extends Component {

  loadMore(e) {
    e.preventDefault();
    e.stopPropagation();

    const {channel} = this.props;

    switch (channel.type) {
      case 'user':
        return Store.loadUser(channel, true);
      case 'channel':
        return Store.loadChannel(channel, true);
      case 'search':
        return Store.search(channel.channel);
      default:
        return;
    }
  }

  render() {
    const { channel } = this.props;
    const {messages = []} = channel;

    const postfix = channel.count === 1 ? '' : 's';
    const count = commas(channel.count) + ' message' + postfix;

    console.log(channel);

    let purpose = null;
    if (channel.purpose && channel.purpose.value) {
      purpose = (
        <p style={{margin: 12, marginTop: 4, marginBottom: 6, color: colors.textLight, fontSize: 16}}>
          {channel.purpose.value}
        </p>
      );
    }

    if (!purpose && channel.topic && channel.topic.value) {
      purpose = (
        <p style={{margin: 12, marginTop: 4, marginBottom: 6, color: colors.textLight, fontSize: 16}}>
          {channel.topic.value}
        </p>
      );
    }

    if (!purpose && channel.real_name) {
      purpose = (
        <p style={{margin: 12, marginTop: 4, marginBottom: 6, color: colors.textLight, fontSize: 16}}>
          {channel.real_name}
        </p>
      );
    }

    let loadMore;
    if (messages.length < channel.count) {
      const remaining = channel.count - messages.length;
      const postfix = remaining === 1 ? '' : 's';
      const loadMoreText = channel.type === 'search' ? `View ${remaining} more result${postfix} in ${channel.channel}` : `Load more (${commas(remaining)} remaining)`;
      loadMore = (
        <p style={{ margin: 20, marginBottom: 24, textAlign: 'center' }}>
          <a href={'#'+channel.name} onClick={e=>this.loadMore(e)}>{loadMoreText}</a>
        </p>
      );
    }

    return (
      <div style={{width: '100%', overflowX: 'hidden'}} key={channel.name || channel.channel}>
        <h1 style={{
          margin: 12,
          marginBottom: 4,
          color: colors.primaryDark,
          fontWeight: '100'
        }}>{channel.name || channel.channel}</h1>
        { purpose }
        <p style={{margin: 12, marginTop: 4, marginBottom: 12, color: colors.textLight, fontSize: 12}}>{count}</p>
        { messages.map((msg, i) => <Message channel={ msg.channel || channel.name || channel.channel} message={msg} i={i}/>) }
        { loadMore }
      </div>
    );
  }
}

