import React, { Component } from 'react';
import './App.css';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();
const geniusToken =
  'eWe3uIGKXdVBtpadavJVTtdlf5apZ8ED4_nee_Ke47TvRjdjGSPdchAZ5ZtladkJ';

var name;
var albumArt;
var artist;

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
      nowPlaying: { name: 'None', albumArt: '' }
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
      if (response.item === undefined) {
        this.setState({
          nowPlaying: {
            name: 'None'
          }
        });
      } else {
        console.log('Currently playing: ' + response.item.name);
        name = response.item.name;
        albumArt = response.item.album.images[0].url;
        artist = response.item.artists[0].name;
        this.setState({
          nowPlaying: {
            name: name,
            albumArt: albumArt,
            artist: artist
          }
        });
        this.getSongID();
      }
    });
  }

  getSongID() {
    var song = this.state.nowPlaying.name;
    song = song.replace('Bonus Track', '').replace('Radio Edit', '');
    var geniusApiUrl =
      'https://api.genius.com/search?q=' +
      song +
      ' ' +
      artist +
      '&access_token=' +
      geniusToken;
    console.log(geniusApiUrl);
    fetch(geniusApiUrl, {
      method: 'GET'
    })
      .then(response => {
        if (response.ok) return response.text();
        throw new Error('Could not get json ...');
      })
      .then(json => {
        var songInfo = JSON.parse(json);
        //console.log(songInfo.response.hits);
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
                artist: artist,
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
            <h3>Now Playing: {this.state.nowPlaying.name}</h3>
            {this.state.nowPlaying.name !== 'None' && (
              <div>
                <img
                  class="albumart"
                  src={this.state.nowPlaying.albumArt}
                  style={{ height: 200 }}
                  alt="albumart"
                />
                <h3>Lyrics</h3>
                <pre>{this.state.nowPlaying.lyrics}</pre>
              </div>
            )}
          </div>
        )}
        <h3>APIs Used</h3>
        <img class="logo" src="./images/spotify_logo.png" alt="spotify" />
        <img class="logo" src="./images/genius_logo.png" alt="genius" />
      </div>
    );
  }
}

export default App;
