<template lang="html">
<div>
<nav>
  <h4 class="nav__link--forward"><router-link to='/recsettings'>next</router-link></h4>
</nav>
<h1 style="clear: both;">Seeds ({{ seed_count }}/5)</h1>
<ul v-if="seed_count>0" class="seed__list">
  <li v-for="song in this.seed_songs"  :key="song.id" class="seed__container">
    <Song class="seed"
      :song="song"
      :seed_count="seed_count"
      :seed_songs="seed_songs"
      @toggle="toggleSeed($event.seed, $event.type, $event.toggle)"
    />
  </li>
  <li v-for="artist in this.seed_artists" :key="artist.id" class="seed__container">
    <Artist class="seed"
      :artist="artist"
      :seed_count="seed_count"
      :seed_artists="seed_artists"
      @toggle="toggleSeed($event.seed, $event.type, $event.toggle)"
    />
  </li>
  <li v-for="genre in this.seed_genres" :key="genre" class="seed__container">
    <Genre class="seed"
      :genre="genre"
      :seed_count="seed_count"
      :seed_genres="seed_genres"
      @toggle="toggleSeed($event.seed, $event.type, $event.toggle)"
    />
  </li>
</ul>
<section v-else class="seed">The seeds you pick will show up here.</section>
<h2><router-link to="/search">search songs/artists</router-link>&nbsp;or&nbsp;<router-link :to="{ name: 'GenreSearch' }">pick genres</router-link></h2>
<router-view class="item--fullrow"></router-view>
</div>
</template>

<style lang='css' scoped>
.item--fullrow {
  flex: 0 1 100%;
}
</style>

<script>
import axios from 'axios'
import axiosRetry from 'axios-retry'
import { mapState, mapGetters } from 'vuex'
import Song from './Song.vue'
import Artist from './Artist.vue'
import Genre from './Genre.vue'

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay })

export default {
  name: 'SearchBar',
  components: {
    Song,
    Artist,
    Genre,
  },
  computed: {
    ...mapState({
      seed_songs: state => state.seed_songs,
      seed_artists: state => state.seed_artists,
      seed_genres: state => state.seed_genres,
    }),
    ...mapGetters([
      'seed_count'
    ]),
  },
  methods: {
    toggleSeed: function(seed, type, toggle) {
      if(toggle) {
        this.$store.commit('add'+type, seed)
      } else {
        this.$store.commit('remove'+type, seed)
      }
    }
  },
  data () {
    return {

    }
  }
}
</script>
