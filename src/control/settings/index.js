import React from 'react';
import { render } from 'react-dom';
import Settings from './settings';

const container = document.getElementById('mount');

function renderApp() {
  render(<Settings />, container);
}

// Setup HMR re-rendering
if (module.hot) {
  module.hot.accept();
  module.hot.accept('./settings', renderApp);
}

// Initial render
renderApp();
