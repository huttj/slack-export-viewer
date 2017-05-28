import React, { Component } from 'react';
import { observer } from 'mobx-react';

import Message from './message';
import Search  from './search';

import Store   from '../store';
import { colors } from '../constants';
import commas from '../util/commas';

@observer
export default class Main extends Component {
  render() {

    let inner = null;
    if (Store.isLoading) {
      inner = (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: colors.primarySuperLight }}>
          <h1 style={{ flex: 1, textAlign: 'center', marginBottom: '15%', color: colors.primaryDark, textShadow: '0 0 3px rgba(255, 255, 255, 0.75)' }}>Loading!</h1>
        </div>
      );
    } else if (Store.display) {
      inner = Store.display && Store.display.map(renderChannel)
    }

    return (
      <div style={{ flex: 1, width: 0, flexDirection: 'column', display: 'flex', zIndex: 2000 }}>
        <Search/>
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', wordBreak: 'word' }}>
          {inner}
        </div>
      </div>
    );
  }
}

function renderChannel(channel) {
  const { messages=[] } = channel;

  const postfix = messages.length === 1 ? '' : 's';
  const count = commas(messages.length) + ' message' + postfix;

  console.log(channel);

  let purpose = null;
  if (channel.purpose && channel.purpose.value) {
    purpose = (
      <p style={{  margin: 12, marginTop:    4, marginBottom: 6, color: colors.textLight, fontSize: 16 }}>
        {channel.purpose.value}
      </p>
    );
  }

  if (!purpose && channel.topic && channel.topic.value) {
    purpose = (
      <p style={{  margin: 12, marginTop:    4, marginBottom: 6, color: colors.textLight, fontSize: 16 }}>
        {channel.topic.value}
      </p>
    );
  }

  if (!purpose && channel.real_name) {
    purpose = (
      <p style={{  margin: 12, marginTop:    4, marginBottom: 6, color: colors.textLight, fontSize: 16 }}>
        {channel.real_name}
      </p>
    );
  }

  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      <h1 style={{ margin: 12, marginBottom: 4, color: colors.primaryDark, fontWeight: '100' }}>{channel.name || channel.channel}</h1>
      { purpose }
      <p style={{  margin: 12, marginTop:    4, marginBottom: 12, color: colors.textLight, fontSize: 12 }}>{count}</p>
      { messages.map((msg, i) => <Message channel={ msg.channel || channel.name || channel.channel} message={msg} i={i} />) }
    </div>
  );
}

