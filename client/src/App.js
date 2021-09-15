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
      if (!response.item) {
        this.setState({
          nowPlaying: { name: 'None' }
        });
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

  async getSongID() {
    const songName = this.state.nowPlaying.name;
    const parsedSongName = songName
      .replace('Bonus Track', '')
      .replace('Radio Edit', '');

    const geniusApiUrl = `https://api.genius.com/search?q=${parsedSongName}
      ${this.state.nowPlaying.artist}&access_token=${geniusToken}`;

    try {
      const geniusResponse = await fetch(geniusApiUrl, { method: 'GET' });
      const songInfo = await geniusResponse.json();
      if (songInfo.response.hits[0]) {
        // get url from first hit and scrape the HTML
        const geniusUrl = songInfo.response.hits[0].result.url;
        const lyricsInfo = await this.scrapeLyrics(geniusUrl);
        this.setState({
          nowPlaying: {
            ...this.state.nowPlaying,
            lyrics: lyricsInfo.lyrics
          }
        });
      } else {
        // no search results
        this.setState({
          nowPlaying: {
            ...this.state.nowPlaying,
            lyrics: '[no lyrics found]'
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async scrapeLyrics(geniusUrl) {
    try {
      const scrapeResponse = await fetch('/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: geniusUrl })
      });
      return scrapeResponse.json();
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    return (
      <div className="App">
        {!this.state.loggedIn && (
          <a href="http://localhost:8888" className="btn btn-green">
            Log in with Spotify
          </a>
        )}
        {this.state.loggedIn && (
          <div>
            <button
              onClick={() => this.getNowPlaying()}
              className="btn btn-green"
            >
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
