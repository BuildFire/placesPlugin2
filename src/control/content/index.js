import React from 'react';
import { render } from 'react-dom';
import Content from './content';

const container = document.getElementById('mount');

const initGoogleMapsSDK = () => {
  const { apiKeys } = buildfire.getContext();
  const { googleMapKey } = apiKeys;
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = `https://maps.googleapis.com/maps/api/js?libraries=places&key=${
    googleMapKey
  }`;
  script.onload = () => {
    console.info("Successfully loaded Google's Maps SDK.");
  };
  script.onerror = () => {
    buildfire.dialog.alert({
      title: 'Error',
      message: 'Failed to load Google Maps API.',
    });
  };
  window.gm_authFailure = () => {
    buildfire.dialog.alert({
      title: 'Error',
      message: 'Failed to load Google Maps API.',
    });
  };
  document.head.appendChild(script);
};

function renderApp() {

  initGoogleMapsSDK();
  render(<Content />, container);
}

// Setup HMR re-rendering
if (module.hot) {
  module.hot.accept();
  module.hot.accept('./content', renderApp);
}

// Initial render
renderApp();
