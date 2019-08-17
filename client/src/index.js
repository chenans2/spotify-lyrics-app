import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import spotify_logo from './images/spotify_logo.png';
import genius_logo from './images/genius_logo.png';
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
      <img class="logo" src={spotify_logo} alt="spotify" />
      <img class="logo" src={genius_logo} alt="genius" />
    </div>
  </div>,
  document.getElementById('root')
);
registerServiceWorker();
