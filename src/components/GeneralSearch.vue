<template lang="html">
<div>
  <form @submit.prevent="processForm" class="search__form">
    <input v-model="query" type="text" class="search__input">
    <input type="submit" value="search" class="search__button--submit">
  </form>
  <p v-if="no_results">
    There are no results for "{{display_query}}". Try searching something else?
  </p>
  <template v-else-if="server_error">
    <p>
      Something went wrong getting search results from the server. Wait a bit and then try the search again.
    </p>
    <p>
      {{server_error}}
    </p>
  </template>
  <template v-else>
    <h3 v-if="display_query && (artist_results.length || song_results.length)">Results for '{{display_query}}':</h3>
    <ul class="wrapper--col">
      <li v-for="artist in this.artist_results" :key="artist.id">
        <Artist
          :artist="artist"
          :seed_count="seed_count"
          :seed_artists="seed_artists"
          @toggle="toggleSeed($event.seed, $event.type, $event.toggle)"
        />
      </li>
      <li v-for="song in this.song_results" :key="song.id">
        <Song
          :song="song"
          :seed_count="seed_count"
          :seed_songs="seed_songs"
          @toggle="toggleSeed($event.seed, $event.type, $event.toggle)"
        />
      </li>
    </ul>
  </template>
</div>
</template>

<style lang="css" scoped>
.search__form {
  display: flex;
  justify-content: center;
  flex-flow: row wrap;
  margin-bottom: 1rem;
}
.search__input {
  flex: 2 1 85%;
}
.search__button--submit {
  flex: 1 1 15%;
}
</style>

<script>
import axios from 'axios'
import axiosRetry from 'axios-retry'
import { mapGetters, mapState } from 'vuex'
import Artist from './Artist.vue'
import Song from './Song.vue'

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay })

export default {
  name: 'GeneralSearch',
  components: {
    Artist,
    Song,
  },
  computed: {
    ...mapState({
      seed_songs: state => state.seed_songs,
      seed_artists: state => state.seed_artists,
      song_results: state => state.song_results,
      artist_results: state => state.artist_results,
      display_query: state => state.saved_query
    }),
    ...mapGetters([
      'seed_count'
    ])
  },
  methods: {
    processForm: function() {
      this.$store.commit('updateSavedQuery', this.query)
      axios.get('http://localhost:3000/search', {
        params:{
          query: this.query
        }
      })
      .then(response => {
        this.server_error = null
        this.$store.commit('updateSongResults', response.data.tracks.items)
        this.$store.commit('updateArtistResults', response.data.artists.items)
        this.no_results = !response.data.tracks.items.length && !response.data.artists.items.length
      })
      .catch(error => {
        this.server_error = error
        console.log(error)
      })
    },
    toggleSeed: function(seed, type, toggle) {
      if(toggle) {
        this.$store.commit('add'+type, seed)
      } else {
        this.$store.commit('remove'+type, seed)
      }
    },
  },
  data() {
    return {
      query: "",
      no_results: false,
      server_error: null
    }
  },
}
</script>
