import React, { Component } from 'react';
import { observer } from 'mobx-react';

import Store from '../store';

import { colors } from '../constants';

@observer
export default class Search extends Component {
  search(e) {
    e.preventDefault();
    Store.search();
  }
  render() {
    return (
      <form onSubmit={this.search} style={{ boxShadow: '0 3px 12px rgba(0,0,0,.125)', zIndex: 3000, flex: '0 0 40px', height: 40, display: 'flex', flexDirection: 'row', width: '100%' }}>
        <input type="text" placeholder="Search messages" style={{ flex: 1, fontSize: 18, paddingRight: 8, paddingLeft: 8, border: 'none' }} value={Store.searchTerm} onChange={ e => Store.searchTerm = e.target.value} />
        <button style={{ flex: '0 0 80px', width: 80, height: 40, border: 'none', backgroundColor: colors.primaryDark, color: 'white', fontSize: 14 }}>Search</button>
      </form>
    );
  }
}
