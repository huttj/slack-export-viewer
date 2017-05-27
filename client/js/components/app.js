import React, { Component } from 'react';

import SideMenu from './sidemenu';
import Main from './main';



export default class App extends Component {
  render() {

    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'row', alignItems: 'top' }}>
        <SideMenu />
        <Main />
      </div>
    );
  }
}