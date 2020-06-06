recresults has link to export playlist
click link
server logs in if not already logged in
server sends access/refresh token to frontend via redirect to playlist export
playlist export has form to set name for playlist, link back to results, link to restart whole process (clear seeds/options/recs) and return to \search

<template lang="html">
<div>
  <form @submit.prevent="processForm">
    <input v-model="playlist_name" required type="text">
    <input type="submit" value="create playlist">
  </form>
  <p v-if="this.playlist_success">Playlist "{{this.playlist_name}}" successfully created.</p>
  <p v-if="this.playlist_failure">Error creating playlist.</p>

  <router-link to="/results">back to results</router-link>
  <router-link to="/search">new search</router-link>
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
      song_recs: state => state.song_recs
    })
  },
  created() {
    if (this.$route.query) {
      this.access_token = this.$route.query.access_token
      this.refresh_token = this.$route.query.refresh_token
    }
    if (!this.song_recs.length) {
      this.$store.commit('retrieveData', '')
    }
  },
  methods: {
    processForm: function () {
      axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': 'Bearer '+ this.access_token
        },
      })
      .then( response => {
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
        })
        .then( response => {
          const playlist_id = response.data.id
          axios.post('https://api.spotify.com/v1/playlists/'+playlist_id+'/tracks', JSON.stringify({uris:this.getSongIds()}), {
            // params: { 'uris':this.getSongIds() },
            headers: {
              'Authorization': 'Bearer '+ this.access_token,
              'Content-Type': 'application/json',
            },
          })
          .then(response => {
            this.playlist_success = true
            console.log(response.data)
          })
          .catch(error => {
            console.log(error)
            this.playlist_failure = true
          })
        })
        .catch(error => {
          console.log(error)
          this.playlist_failure = true
        })
      })
      .catch(error => {
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
      access_token: null,
      refresh_token: null,
      playlist_success: false,
      playlist_failure: false,
    }
  }
}
</script>
