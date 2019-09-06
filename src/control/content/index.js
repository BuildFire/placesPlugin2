import React from 'react';
import { render } from 'react-dom';
import Content from './content';

const container = document.getElementById('mount');

function renderApp() {
  render(<Content />, container);
}

// Setup HMR re-rendering
if (module.hot) {
  module.hot.accept();
  module.hot.accept('./content', renderApp);
}

// Initial render
renderApp();
