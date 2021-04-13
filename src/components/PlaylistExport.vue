<template lang="html">
<div>
<nav class="nav__container">
  <h4><router-link to="/results">back to tracks</router-link></h4>
  <h4><router-link to="/search?new=true">start a new search</router-link></h4>
</nav>
<h1>Save to playlist</h1>
<div v-if="song_recs.length>0&&seed_count>0">
  <p v-if="loading">..loading</p>
  <template v-else>
    <template v-if="!logged_in">
      <template v-if="login_error">
        <p>
          There was an error while logging in. Wait a bit and then try to log in again.
        </p>
        <p>
          {{ login_error }}
        </p>
      </template>
      <a :href="getLoginLink()">Log in</a> to Spotify.
    </template>
    <template v-else>
      <button style="float:right;" @click="logOut">log out of Spotify</button>
      <form @submit.prevent="processForm">
        <label>Name your playlist:
        <input v-model="playlist_name" required type="text"></label>
        <input style="display:block; margin-top:1rem;" type="submit" value="create playlist">
      </form>

      <p v-if="playlist_success">Playlist "{{this.created_playlist}}" was created. <a :href="this.playlist_url">Listen</a> to it!</p>
      <template v-else-if="playlist_failure">
        <p>
          There was a server error. Check your Spotify account, and see if the playlist is there and in what state; sometimes it gets created but adding the songs fails. If you want to try again, wait a bit and then click 'create playlist' again.
        </p>
        <p>
          {{ playlist_failure }}
        </p>
      </template>
    </template>
  </template>
</div>
<p v-else>There's no songs to add to this playlist. <router-link to="/search">Add some first</router-link>.</p>
</div>
</template>

<style lang="css" scoped>
</style>

<script>
import axios from 'axios'
import axiosRetry from 'axios-retry'
import { mapState, mapGetters } from 'vuex'

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay })

export default {
  name: 'PlaylistExport',
  computed: {
    ...mapState({
      song_recs: state => state.song_recs,
      access_token: state => state.access_token,
      callback_state: state => state.callback_state,
      login_error: state => state.login_error
    }),
    ...mapGetters([
      'seed_count',
    ])
  },
  created() {
    this.$store.commit('retrieveState')
    this.checkLoggedIn()
  },
  methods: {
    randomString: function(len) {
      let str = ''
      let charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
      for (var i=0; i<len; i++) {
        str += charSet[Math.floor(Math.random() * charSet.length)]
      }
      return str
    },
    getLoginLink: function () {
      const scope = 'playlist-modify-public user-read-email'
      const state = this.randomString(16)
      this.$store.commit('setCallbackState', state)
      return "https://accounts.spotify.com/authorize" +
      "?client_id="+ process.env.VUE_APP_SPOTIFY_CLIENT_ID +
      "&response_type=token" +
      "&redirect_uri=" + encodeURIComponent(process.env.VUE_APP_CLIENT_URL)+'/callback' +
      "&scope=" + encodeURIComponent(scope) +
      '&show_dialog=true' +
      '&state=' + state
    },
    checkLoggedIn: function() {
      if(this.access_token) {
        axios.get(this.base_url+ '/me', {
          headers: {
            'Authorization': 'Bearer '+ this.access_token
          }
        }).then( () => {
          this.logged_in = true
          this.loading = false
        }).catch(error => {
          console.log('Login check; server returned:', error)
          this.logged_in = false
          this.loading = false
        })
      } else {
        this.logged_in = false
        this.loading = false
      }
    },
    logOut: function() {
      this.logged_in = false
      this.$store.commit('clearAccessToken')
    },
    processForm: function () {
      const uris = this.song_recs.map(song => song.uri)
      const name = this.playlist_name ? this.playlist_name : 'recs-controller-export'
      axios.get(this.base_url+ '/me', {
        headers: {
          'Authorization': 'Bearer '+ this.access_token
        }
      }).then(response => {
        console.log('user data aquired, creating playlist now')
        const user_id = response.data.id
        return axios.post(this.base_url+ '/users/'+user_id+'/playlists', JSON.stringify({name: name}), {
          headers: {
            'Authorization': 'Bearer '+ this.access_token,
            'Content-Type': 'application/json',
          },
        })
      }).then(response => {
        console.log('playlist created, adding tracks now')
        const playlist_id = response.data.id
        this.playlist_url = response.data.external_urls.spotify
        return axios.post(this.base_url+ '/playlists/'+playlist_id+'/tracks', JSON.stringify({uris:uris}), {
          headers: {
            'Authorization': 'Bearer '+ this.access_token,
            'Content-Type': 'application/json',
          },
        })
      }).then(response => {
        console.log(response)
        this.playlist_failure = null
        this.created_playlist = name
        this.playlist_success = true
      }).catch(error => {
        console.log(error)
        this.playlist_failure = error
        this.playlist_success = false
      })
    },
    getSongIds: function () {
      return this.song_recs.map(song => song.uri)
    }
  },
  data() {
    return {
      base_url: 'https://api.spotify.com/v1',
      logged_in: false,
      loading: true,
      playlist_name: "",
      created_playlist: "",
      playlist_url: "",
      playlist_success: false,
      playlist_failure: null,
    }
  }
}
</script>
