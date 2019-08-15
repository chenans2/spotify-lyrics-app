/**
 * Implicit Grant oAuth2 flow to authenticate against Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#implicit_grant_flow
 */

const express = require('express'); // Express web server framework
const bodyParser = require('body-parser');

const app = express();
const port = 8888;

app.use(bodyParser.json()); // support json encoded bodies
app.use(express.static(__dirname + '/public'));

// import the /routes folder to access to every API route
require('./routes')(app);

console.log('Listening on port ' + port);
app.listen(port);
