import React from 'react';
import { render } from 'react-dom';
import Settings from './Settings';

const container = document.getElementById('mount');

function renderApp() {
  render(<Settings />, container);
}

// Setup HMR re-rendering
if (module.hot) {
  module.hot.accept();
  module.hot.accept('./Settings', renderApp);
}

// Initial render
renderApp();
