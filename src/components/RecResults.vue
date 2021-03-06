<template lang="html">
<div>
<nav>
  <h4 class="nav__link--backward"><router-link to="/recsettings">back to settings</router-link></h4>
  <h4 class="nav__link--forward"><router-link to="/export">save these songs to a new playlist</router-link></h4>
  <router-link to="/search?new=true">new search</router-link>
</nav>
<SeedList />
<h1>New tracks</h1>
<template v-if="seed_count>0">
  <template v-if="server_error">
    <label>
      <p>There is something wrong with the server. Wait a bit and then click this button.</p>
      <button v-on:click="getRecData">reload recommendations</button>
    </label>
    <p>
      {{server_error}}
    </p>
  </template>
  <ul v-else-if="track_recs.length>0">
    <button v-on:click="getRecData">reload recommendations</button>
    <li v-for="track in this.track_recs" :key="track.id">
      <SongDisplay :song="track" />
    </li>
  </ul>
  <p v-else>Unfortunately Spotify couldn't recommend anything based on your parameters. You could <router-link to="/recsettings">change</router-link> them, or <label>ask Spotify to try again. <button v-on:click="getRecData">reload recommendations</button></label></p>
</template>
<p v-else>This recommends you new music based on music you like already. <router-link to="/search">Pick some music you like first</router-link>.</p>
</div>
</template>

<style lang="css" scoped>
h1 {
  margin-bottom: 0.2rem;
}
</style>

<script>
import axios from 'axios'
import axiosRetry from 'axios-retry'
import { mapState, mapGetters } from 'vuex'
import SongDisplay from './SongDisplay.vue'
import SeedList from './SeedList.vue'

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay })

export default {
  name: 'RecResults',
  components: {
    SongDisplay,
    SeedList,
  },
  computed: {
    ...mapState({
      seed_artists: state => state.seed_artists,
      seed_genres: state => state.seed_genres,
      seed_songs: state => state.seed_songs,
      audio_features: state => state.audio_features,
      track_recs: state => state.song_recs,
      seed_params_changed: state => state.seed_params_changed,
    }),
    ...mapGetters([
      'seed_count',
    ])
  },
  created() {
    this.$store.commit('retrieveState')
    if((this.seed_count>0 && this.track_recs.length === 0) || (this.seed_params_changed)) {
      this.getRecData()
    }
  },
  methods: {
    getRecData: function() {
      const params = {
        seed_tracks: this.seed_songs.map(seed => seed.id),
        seed_artists: this.seed_artists.map(seed => seed.id),
        seed_genres: this.seed_genres,
        limit: 20
      }

      for(const i in this.audio_features) {
        let feature = this.audio_features[i]
        if(feature.on) {
          if(feature.compareOption==='exactly') {
            params['target_'+feature.name]= parseFloat(feature.number)
          } else if(feature.compareOption==='less') {
            params['max_'+feature.name]= parseFloat(feature.number)
          } else if(feature.compareOption==='more') {
            params['min_'+feature.name]= parseFloat(feature.number)
          } else if(feature.compareOption==='between') {
            params['min_'+feature.name]= Math.min(feature.number, feature.number2)
            params['max_'+feature.name]= Math.max(feature.number, feature.number2)
          }
        }
      }

      axios.get('http://localhost:3000/rec', { params: params })
      .then(response => {
        this.server_error = null
        this.track_results = response.data.tracks
        this.$store.commit('updateSongRecs', response.data.tracks)
      })
      .catch(error => {
        this.server_error = error
        console.log(error)
      })
    }
  },
  data () {
    return {
      server_error: null
    }
  }
}
</script>
