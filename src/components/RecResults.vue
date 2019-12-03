<template>
<div>
<nav>
  <h4 class="nav__link--backward"><router-link to='/recsettings'>back</router-link></h4>
</nav>
<SeedList />
<h1>New tracks</h1>
<ul v-if="seed_count>0">
  <li v-for="track in this.track_results" :key="track.id">
    <SongDisplay :song="track" />
  </li>
</ul>
<p v-else>This recommends you new music based on music you like already. <router-link to="/search">Pick some music you like first</router-link>.</p>
</div>
</template>

<script>
import axios from 'axios'
import axiosRetry from 'axios-retry'
import { mapState, mapGetters } from 'vuex'
import SongDisplay from './SongDisplay.vue'
import SeedList from './SeedList.vue'

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay })

export default {
  name: 'RecSettings',
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
    }),
    ...mapGetters([
      'seed_count',
    ])
  },
  created() {
    if(this.seed_count) {
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
        this.track_results = response.data.tracks
      })
      .catch(error => {
        console.log(error)
      })
    }
  },
  data () {
    return {
      track_results: []
    }
  }
}
</script>
