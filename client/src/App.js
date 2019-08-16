import React, { Component } from 'react';
import './App.css';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();
const geniusToken =
  'eWe3uIGKXdVBtpadavJVTtdlf5apZ8ED4_nee_Ke47TvRjdjGSPdchAZ5ZtladkJ';

var name;
var albumArt;

class App extends Component {
  constructor() {
    super();
    const params = this.getHashParams();
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      loggedIn: token ? true : false,
      nowPlaying: { name: 'Not Checked', albumArt: '' }
    };
  }

  getHashParams() {
    var hashParams = {};
    var e,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    e = r.exec(q);
    while (e) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
      e = r.exec(q);
    }
    return hashParams;
  }

  getNowPlaying() {
    spotifyApi.getMyCurrentPlaybackState().then(response => {
      console.log('Currently playing: ' + response.item.name);
      name = response.item.name;
      albumArt = response.item.album.images[0].url;
      this.setState({
        nowPlaying: {
          name: name,
          albumArt: albumArt
        }
      });
      this.getSongID();
    });
  }

  getSongID() {
    const song = this.state.nowPlaying.name;
    var geniusApiUrl =
      'https://api.genius.com/search?q=' +
      song +
      '&access_token=' +
      geniusToken;
    fetch(geniusApiUrl, {
      method: 'GET'
    })
      .then(response => {
        if (response.ok) return response.text();
        throw new Error('Could not get json ...');
      })
      .then(json => {
        var songInfo = JSON.parse(json);
        //console.log(songInfo.response.hits[0].result);
        var geniusUrl = songInfo.response.hits[0].result.url;
        console.log('url: ' + geniusUrl);
        fetch('/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url: geniusUrl })
        })
          .then(htmlResponse => {
            if (htmlResponse.ok) return htmlResponse.json();
            throw new Error('Could not get HTML ...');
          })
          .then(value => {
            console.log(value.lyrics);
            this.setState({
              nowPlaying: {
                name: name,
                albumArt: albumArt,
                lyrics: value.lyrics
              }
            });
          });
      });
  }

  render() {
    return (
      <div className="App">
        {!this.state.loggedIn && (
          <a href="http://localhost:8888" class="btn btn-green">
            Log in with Spotify
          </a>
        )}
        {this.state.loggedIn && (
          <div>
            <button onClick={() => this.getNowPlaying()} class="btn btn-green">
              Check Now Playing
            </button>
            <p>Now Playing: {this.state.nowPlaying.name}</p>
            <div>
              <img
                class="albumart"
                src={this.state.nowPlaying.albumArt}
                style={{ height: 200 }}
              />
            </div>
            <h3>Lyrics</h3>
            <pre>{this.state.nowPlaying.lyrics}</pre>
          </div>
        )}
      </div>
    );
  }
}

export default App;
