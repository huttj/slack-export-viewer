import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import SearchInput from './SearchInput';


import Store from '../store';

import { colors } from '../constants';

@observer
export default class Search extends Component {

  search(e) {
    e.preventDefault();
    Store.search();
  }

  componentDidMount() {
    this.onKeyDown = e => {
      const { input } = this.refs;
      if (input !== document.activeElement) {
        input.value = '';
        input.focus();
      }
    };

    // window.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    // window.removeEventListener('keydown', this.onKeyDown);
  }

  render() {
    return (
      <form onSubmit={this.search} style={{ boxShadow: '0 3px 12px rgba(0,0,0,.125)', zIndex: 3000, flex: '0 0 40px', height: 40, display: 'flex', flexDirection: 'row', width: '100%' }}>
        <SearchInput type="text" placeholder="Search messages" value={Store.searchTerm} onChange={ e => Store.searchTerm = e.target.value} ref="input" />
        <button style={{ flex: '0 0 80px', width: 80, height: 40, border: 'none', backgroundColor: colors.primaryDark, color: 'white', fontSize: 14 }}>Search</button>
      </form>
    );
  }
}
