import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

// render our React component to the 'root div' (i.e. entry point)
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
