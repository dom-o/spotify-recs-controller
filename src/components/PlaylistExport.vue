<template lang="html">
<div>
<nav>
  <h4 class="nav__link--backward"><router-link to="/results">back</router-link></h4>
  <h4 class="nav__link--forward"><router-link to="/search?new=true">new search</router-link></h4>
</nav>
<div>

<!-- check to see if you're already logged in before displaying this -->
<template v-if="!loggedIn">
  <a href="http://localhost:3000/login">First, log in to Spotify.</a>
</template>

<!-- also don't show this until you ARE logged in -->
<template v-else>
  <form @submit.prevent="processForm">
    <input v-model="playlist_name" required type="text">
    <input type="submit" value="create playlist">
  </form>
  <p v-if="playlist_success">Playlist "{{this.playlist_name}}" successfully created.</p>

  <!-- expound upon this error message -->
  <p v-if="playlist_failure">Error creating playlist.</p>
</template>
</div>
</div>
</template>

<style lang="css" scoped>
</style>

<script>
import axios from 'axios'
import { mapState } from 'vuex'

export default {
  name: 'PlaylistExport',
  computed: {
    ...mapState({
      song_recs: state => state.song_recs,
      access_token: state => state.user_access_token,
      refresh_token: state => state.user_refresh_token
    }),
  },
  created() {
    if (this.$route.query) {
      this.$store.commit('setUserAccessToken', this.$route.query.access_token)
      this.$store.commit('setUserRefreshToken', this.$route.query.refresh_token)
      if (this.access_token && this.refresh_token) {
        this.loggedIn = true
      }
    }
    if (!this.song_recs.length) {
      this.$store.commit('retrieveData')
    }
  },
  methods: {
    checkLoggedIn: function() {
      if(this.access_token) {
        axios.get('https://api.spotify.com/v1/me', {
          headers: { 'Authorization': 'Bearer '+ this.access_token },
        }).then( response => { return true })
        .catch( error => {
          //check that the error was the right code
          return false
        })
      }

      if(this.refresh_token) {
        axios.get('http://localhost:3000/refresh', {
          params: {refresh_token:this.refresh_token}
        }).then( response => {
          this.access_token = response.data.access_token
          return true
        }).catch( error => {
          //check error was the right code
          return false
        })
      }
      return false
    },
    processForm: function () {
      axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': 'Bearer '+ this.access_token
        },
      }).then( response => {
        const user_id = response.data.id
        const name = this.playlist_name ? this.playlist_name : 'recs-controller-export'
        axios.post("https://api.spotify.com/v1/users/"+user_id+"/playlists", JSON.stringify({name: name}), {
          // data: {
          //   // description: 'exported by spotify recs controller'//eventually put useful data here?
          // },
          headers: {
            'Authorization': 'Bearer '+ this.access_token,
            'Content-Type': 'application/json',
          },
        }).then( response => {
          const playlist_id = response.data.id
          axios.post('https://api.spotify.com/v1/playlists/'+playlist_id+'/tracks', JSON.stringify({uris:this.getSongIds()}), {
            // params: { 'uris':this.getSongIds() },
            headers: {
              'Authorization': 'Bearer '+ this.access_token,
              'Content-Type': 'application/json',
            },
          }).then(response => {
            this.playlist_success = true
            console.log(response.data)
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
      loggedIn: this.checkLoggedIn()
    }
  }
}
</script>
