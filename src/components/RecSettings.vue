<template>
<div>
<nav>
  <h4 class="nav__link--backward"><router-link to='/search' >back</router-link></h4>
  <h4 class="nav__link--forward"><router-link to='/results' >next</router-link></h4>
</nav>
<SeedList />
<h1>Tracklist settings</h1>
<p>
  Here you can fine-tune the recommendations you'll get. If you set instrumentalness to less than 0.35, for example, you probably won't be recommended any instrumental tracks. You could also set valence high if you want more cheery tracks.
</p>
<form v-if="seed_count>0" @submit.prevent="processForm">
  <div v-for="feature in audio_features" class="wrapper--col">
    <label :for="feature.name">
      <h2>
        <input type="checkbox"
          :id="feature.name"
          :checked="feature.on"
          @change="mutate('toggleAudioFeature', feature.name, $event.target.checked)"
        >
        {{ feature.display_name }}
      </h2>
    </label>
    <section class="wrapper--row">
      <select
        :key="feature.name+'compareOption'"
        :value="feature.compareOption"
        @change="mutate('changeCompareOption', feature.name, $event.target.value)"
        :disabled="!feature.on"
      >
        <option :key="'exactly'" :value="'exactly'">exactly</option>
        <option :key="'between'" :value="'between'">between</option>
        <option :key="'more'" :value="'more'">more than</option>
        <option :key="'less'" :value="'less'">less than</option>
      </select>
      <input
        :key="feature.name+'num'"
        type="number"
        step="any"
        :max="feature.max"
        :min="feature.min"
        :value="feature.number"
        @change="mutate('changeFeatureNumber', feature.name, $event.target.value)"
        :disabled="!feature.on"
      >
      <template v-if="feature.compareOption==='between'">
        &nbsp;and&nbsp;
        <input
          :key="feature.name+'range'"
          type="number"
          step="any"
          :max="feature.max"
          :min="feature.min"
          :value="feature.number2"
          @change="mutate('changeSecondFeatureNumber', feature.name, $event.target.value)"
          :disabled="!feature.on"
        >
      </template>
    </section>

    <p>{{ feature.description }}</p>

    <table>
      <thead>
        <tr>
          <th v-for="song in seed_songs">{{song.name}}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td v-for="song in seed_songs">
            <template v-if="song_details.length">
              {{ getFeatureValue(song, feature, song_details) }}
            </template>
            <template v-else>
              ..loading
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <input type="submit" value="get new tracks">
</form>
<p v-else>But right now you won't be recommended anything. This finds you new music based on music you like already. <router-link to="/search">Pick some music you like first</router-link>.</p>
</div>
</template>

<style lang='css' scoped>
.wrapper--col {
  margin-bottom: 2rem;
  border-top: 1px solid black;
  padding-top: 0rem;
}
table {
  border-collapse: collapse;
}
th,td {
  text-align: center;
  border: 1px solid black;
}
</style>

<script>
import axios from 'axios'
import axiosRetry from 'axios-retry'
import { mapState, mapGetters } from 'vuex'
import SeedList from './SeedList.vue'

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay })

export default {
  name: 'RecSettings',
  components: {
    SeedList,
  },
  computed: {
    ...mapState({
      seed_songs: state => state.seed_songs,
      audio_features: state => state.audio_features,
    }),
    ...mapGetters([
      'seed_count'
    ]),
  },
  created() {
    if(this.seed_songs.length) {
      this.getSeedData()
    }
  },
  methods: {
    processForm: function() { this.$router.push('results') },
    getFeatureValue: function(song, feature, song_details) {
      const val = song_details.find(e => e.id === song.id)[feature.name]
      if(!val && val != 0) {
        return song[feature.name]
      } else {
        return val
      }
    },
    mutate: function(mutationName, id, data) {
      this.$store.commit(mutationName, {id:id, data:data})
    },
    get_track_seed: function(id) {
      return (this.song_details.find(element => {return element.id===id}))
    },
    getSeedData: function() {
      axios.get('http://localhost:3000/info', {
        params: {
          tracks: this.seed_songs.map(seed => seed.id),
        }
      })
      .then(response => {
        this.song_details = response.data.audio_features
      })
      .catch(error => {
        console.log(error)

      })
    }
  },
  data () {
    return {
      song_details: [],
    }
  }
}
</script>
