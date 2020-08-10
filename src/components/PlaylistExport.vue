<template lang="html">
<div>
<nav>
  <h4 class="nav__link--backward"><router-link to="/results">back</router-link></h4>
  <h4 class="nav__link--forward"><router-link to="/search?new=true">new search</router-link></h4>
</nav>

<div v-if="song_recs.length>0">
  <template v-if="!loggedIn">
    <a href="http://localhost:3000/login">First, log in to Spotify.</a>
  </template>

  <!-- also don't show this until you ARE logged in -->
  <template v-else>
    <button @click="logOut">Log out</button>
    <form @submit.prevent="processForm">
      <input v-model="playlist_name" required type="text">
      <input type="submit" value="create playlist">
    </form>
    <p v-if="playlist_success">Playlist "{{this.playlist_name}}" successfully created.</p>

    <!-- expound upon this error message -->
    <p v-if="playlist_failure">Error creating playlist.</p>
  </template>
</div>
<p v-else>There's no songs to add to this playlist. <router-link to="/search">Get some first</router-link></p>
</div>
</template>

<style lang="css" scoped>
</style>

<script>
import axios from 'axios'
import axiosRetry from 'axios-retry'
import { mapState } from 'vuex'

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay })

axios.interceptors.response.use(null, (error) =>{
  let refresh_token = localStorage.getItem('refresh_token')
  
  if(refresh_token && error.config && error.response && error.response.status === 401) {
    refresh_token = JSON.parse(refresh_token)
    return (axios.get('http://localhost:3000/refresh', {
      params: { refresh_token: refresh_token },
    })).then(response => {
      localStorage.setItem('access_token', response.data.access_token)
      error.config.headers['Authorization'] = 'Bearer '+ response.data.access_token
      return axios.request(error.config)
    })
  }
  return Promise.reject(error)
})

export default {
  name: 'PlaylistExport',
  computed: {
    ...mapState({
      song_recs: state => state.song_recs,
      access_token: state => state.access_token,
      refresh_token: state => state.refresh_token
    }),
    loggedIn: function() {
      return this.access_token && this.refresh_token
    }
  },
  created() {
    if (this.$route.query && this.$route.query.access_token && this.$route.query.refresh_token) {
      this.$store.commit('retrieveState')
      this.$store.commit('setAccessToken', this.$route.query.access_token)
      this.$store.commit('setRefreshToken', this.$route.query.refresh_token)
    } else if (!this.access_token || !this.refresh_token) {
      this.$store.commit('retrieveAuthState')
    }
  },
  methods: {
    logOut: function() {
      this.$store.commit('resetAuthState')
    },
    processForm: function () {
      this.$store.commit('retrieveAuthState')
      axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': 'Bearer '+ this.access_token
        },
      }).then( response => {
        const user_id = response.data.id
        const name = this.playlist_name ? this.playlist_name : 'recs-controller-export'
        axios.post("https://api.spotify.com/v1/users/"+user_id+"/playlists", JSON.stringify({name: name}), {
          headers: {
            'Authorization': 'Bearer '+ this.access_token,
            'Content-Type': 'application/json',
          },
        }).then( response => {
          const playlist_id = response.data.id
          axios.post('https://api.spotify.com/v1/playlists/'+playlist_id+'/tracks', JSON.stringify({uris:this.getSongIds()}), {
            headers: {
              'Authorization': 'Bearer '+ this.access_token,
              'Content-Type': 'application/json',
            },
          }).then(response => {
            this.playlist_success = true
          }).catch(error => {
            console.log(error)
            this.playlist_failure = true
          })
        }).catch(error => {
          console.log(error)
          this.playlist_failure = true
        })
      }).catch(error => {
        console.log(error)
        this.playlist_failure = true
      })
    },
    getSongIds: function () {
      return this.song_recs.map(song => song.uri)
    }
  },
  data() {
    return {
      playlist_name: "",
      playlist_success: false,
      playlist_failure: false,
    }
  }
}
</script>
