<template lang="html">
<div>
<nav class="nav__container">
  <h4><router-link to="/results">back to tracks</router-link></h4>
  <h4><router-link to="/search?new=true">start a new search</router-link></h4>
</nav>
<h1>Save to playlist</h1>
<div>
  <SlotDisplay v-if="song_recs.length===0 || seed_count===0">
    <p>There's no songs to add to this playlist. <router-link to="/search">Add some first</router-link>.</p>
  </SlotDisplay>
  <SlotDisplay v-else-if="!logged_in">
    <p> {{ login_message }} </p>
    <template :v-slot="aux"><a :href="getLoginLink()">Log in</a> to Spotify.</template>
  </SlotDisplay>
  <SlotDisplay v-else-if="logged_in">
    <button style="float:right;" @click="logOut">log out of Spotify</button>
    <form @submit.prevent="processForm">
      <label>Name your playlist:
      <input v-model="playlist_name" required type="text"></label>
      <input style="display:block; margin-top:1rem;" type="submit" value="create playlist">
    </form>
    <template v-if="playlist_success" :v-slot="aux"><p>Playlist "{{this.created_playlist}}" was created. <a :href="this.playlist_url">Listen</a> to it!</p></template>
    <template v-else :v-slot="aux"><p> {{ playlist_message }} </p></template>
  </SlotDisplay>
</div>
</div>
</template>

<style lang="css" scoped>
</style>

<script>
import axios from 'axios'
import axiosRetry from 'axios-retry'
import { mapState, mapGetters } from 'vuex'
import SlotDisplay from './SlotDisplay.vue'

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay })

export default {
  name: 'PlaylistExport',
  components: {
    SlotDisplay
  },
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
        }).catch(error => {
          console.log('Login check; server returned:', error)
          this.logged_in = false
          this.login_message = ''
        })
      } else {
        this.logged_in = false
        this.login_message = this.login_error ? this.login_error : ''
        this.$store.commit('setLoginError', null)
      }
    },
    logOut: function() {
      this.logged_in = false
      this.$store.commit('clearAccessToken')
    },
    processForm: function () {
      this.playlist_success = false
      const uris = this.song_recs.map(song => song.uri)
      const name = this.playlist_name ? this.playlist_name : 'recs-controller-export'
      axios.get(this.base_url+ '/me', {
        headers: {
          'Authorization': 'Bearer '+ this.access_token
        }
      }).then(response => {
        const user_id = response.data.id
        return axios.post(this.base_url+ '/users/'+user_id+'/playlists', JSON.stringify({name: name}), {
          headers: {
            'Authorization': 'Bearer '+ this.access_token,
            'Content-Type': 'application/json',
          },
        })
      }).then(response => {
        const playlist_id = response.data.id
        this.playlist_url = response.data.external_urls.spotify
        return axios.post(this.base_url+ '/playlists/'+playlist_id+'/tracks', JSON.stringify({uris:uris}), {
          headers: {
            'Authorization': 'Bearer '+ this.access_token,
            'Content-Type': 'application/json',
          },
        })
      }).then( () => {
        this.playlist_success = true
        this.created_playlist = name
      }).catch(error => {
        console.log(error)
        if(error.response.status === 401) {
          this.logged_in = false
          this.login_message = "Your login expired. Try logging in again."
        } else {
          this.playlist_message = "There was an error creating your playlist. If you want to try again, wait a bit and then click 'create playlist' again, and if that doesn't work, click 'log out of spotify' and log back in."
        }
      })
    },
    getSongIds: function () {
      return this.song_recs.map(song => song.uri)
    }
  },
  data() {
    return {
      base_url: 'https://api.spotify.com/v1',
      login_message: "",
      playlist_message: "",
      playlist_success: false,
      logged_in: false,
      playlist_name: "",
      created_playlist: "",
      playlist_url: "",
    }
  }
}
</script>
