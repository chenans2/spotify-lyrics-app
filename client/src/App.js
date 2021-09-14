import React, { Component } from 'react';
import './App.css';
import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();
const geniusToken =
  'eWe3uIGKXdVBtpadavJVTtdlf5apZ8ED4_nee_Ke47TvRjdjGSPdchAZ5ZtladkJ';

class App extends Component {
  constructor() {
    super();
    const params = this.getHashParams();
    const token = params.access_token;

    if (token) {
      spotifyApi.setAccessToken(token);
    }

    this.state = {
      loggedIn: !!token,
      nowPlaying: { name: 'None', albumArt: '', artist: '' }
    };
  }

  getHashParams() {
    const hashParams = {};
    const r = /([^&;=]+)=?([^&;]*)/g;
    const q = window.location.hash.substring(1);
    let e = r.exec(q);
    while (e) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
      e = r.exec(q);
    }
    return hashParams;
  }

  getNowPlaying() {
    spotifyApi.getMyCurrentPlaybackState().then((response) => {
      if (response.item === undefined) {
        this.setState({ nowPlaying: { name: 'None' } });
      } else {
        this.setState({
          nowPlaying: {
            name: response.item.name,
            albumArt: response.item.album.images[0].url,
            artist: response.item.artists[0].name
          }
        });
        this.getSongID();
      }
    });
  }

  getSongID() {
    const song = this.state.nowPlaying.name;
    const parsedSong = song
      .replace('Bonus Track', '')
      .replace('Radio Edit', '');
    const geniusApiUrl = `https://api.genius.com/search?q=${parsedSong}
      ${this.state.nowPlaying.artist}&access_token=${geniusToken}`;

    fetch(geniusApiUrl, { method: 'GET' })
      .then((response) => {
        if (response.ok) return response.text();
        throw new Error('Could not get json ...');
      })
      .then((json) => {
        const songInfo = JSON.parse(json);
        if (songInfo.response.hits[0] === undefined) {
          // no search results
          this.setState({
            nowPlaying: {
              ...this.state.nowPlaying,
              lyrics: '[no lyrics found]'
            }
          });
        } else {
          // get url from first hit and scrape the HTML
          const geniusUrl = songInfo.response.hits[0].result.url;
          fetch('/scrape', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: geniusUrl })
          })
            .then((htmlResponse) => {
              if (htmlResponse.ok) return htmlResponse.json();
              throw new Error('Could not get HTML ...');
            })
            .then((value) => {
              this.setState({
                nowPlaying: {
                  ...this.state.nowPlaying,
                  lyrics: value.lyrics
                }
              });
            });
        }
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
                  alt="albumart"
                />
                <h3>Lyrics</h3>
                <pre>{this.state.nowPlaying.lyrics}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default App;
