import React from 'react';
import { render } from 'react-dom';
import Content from './Content';

const container = document.getElementById('mount');

function renderApp() {
  render(<Content />, container);
}

// Setup HMR re-rendering
if (module.hot) {
  module.hot.accept();
  module.hot.accept('./Content', renderApp);
}

// Initial render
renderApp();
