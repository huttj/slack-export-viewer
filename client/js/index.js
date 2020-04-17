import React from 'react';
import ReactDOM from 'react-dom';
// import { AppContainer } from 'react-hot-loader';

import App from './components/app';

// AppContainer is a necessary wrapper component for HMR

const render = () => ReactDOM.render(<App/>, document.getElementById('root'));

render();

// document.body.addEventListener('click', ()=>render(App));

// // Hot Module Replacement API
if (module.hot) {
  module.hot.accept(render);
}