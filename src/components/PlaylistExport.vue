<template lang="html">
<div>
<nav>
  <h4 class="nav__link--backward"><router-link to="/results">back</router-link></h4>
  <h4 class="nav__link--forward"><router-link to="/search?new=true">new search</router-link></h4>
</nav>
<div style="clear: both;" v-if="song_recs.length>0">
  <template v-if="!loggedIn">
    <a href="http://localhost:3000/login">Log in</a> to Spotify.
  </template>
  <template v-else>
    <button @click="logOut">Log out</button>
    <form @submit.prevent="processForm">
      <label>Name your playlist:
      <input v-model="playlist_name" required type="text"></label>
      <input type="submit" value="create playlist">
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
</div>
<p style="clear: both;" v-else>There's no songs to add to this playlist. <router-link to="/search">Add some first</router-link>.</p>
</div>
</template>

<style lang="css" scoped>
</style>

<script>
import axios from 'axios'
import axiosRetry from 'axios-retry'
import { mapState } from 'vuex'

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay })

export default {
  name: 'PlaylistExport',
  computed: {
    ...mapState({
      song_recs: state => state.song_recs,
      access_token: state => state.access_token,
      refresh_token: state => state.refresh_token
    }),
  },
  created() {
    this.$store.commit('retrieveState')
    this.checkLoggedIn()
  },
  methods: {
    checkLoggedIn: function() {
      axios.get('http://localhost:3000/isLoggedIn').then(response => {
        this.loggedIn = response.data
      }).catch(error => {
        console.log(error)
        this.loggedIn = false
      })
    },
    logOut: function() {
      this.loggedIn = false
      axios.post('http://localhost:3000/logout')
      .then(response => {
        console.log(response)
      }).catch(error => {
        console.log(error)
      })
    },
    processForm: function () {
      axios.get('http://localhost:3000/playlist', {
        params: {
          uris: this.getSongIds(),
          playlist_name: this.playlist_name
        }
      }).then(response => {
        this.playlist_failure = null
        this.playlist_url = response.data.playlist_url
        this.created_playlist = response.data.playlist_name
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
      loggedIn: false,
      playlist_name: "",
      created_playlist: "",
      playlist_url: "",
      playlist_success: false,
      playlist_failure: null,
    }
  }
}
</script>
