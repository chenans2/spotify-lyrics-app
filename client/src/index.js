import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import spotifyLogo from './images/spotify_logo.png';
import geniusLogo from './images/genius_logo.png';
import registerServiceWorker from './registerServiceWorker';

// render our React component to the 'root div' (i.e. entry point)
ReactDOM.render(
  <div>
    <h1>Spotify Lyrics App</h1>
    <h3>
      This app uses the implicit grant authorization flow to authenticate users
      and get user data.
    </h3>
    <App />
    <div class="credits">
      <h3>APIs Used</h3>
      <img class="logo" src={spotifyLogo} alt="spotify" />
      <img class="logo" src={geniusLogo} alt="genius" />
    </div>
  </div>,
  document.getElementById('root')
);
registerServiceWorker();
