<template lang="html">
<ul class="wrapper--row">
  <template v-if="server_error">
    <p>
      There is something wrong with the server. Wait a bit and then refresh the page.
    </p>
    <p>
      {{server_error}}
    </p>
  </template>
  <template v-else>
    <li v-for="genre in genres">
      <Genre
        :genre="genre"
        :seed_count="seed_count"
        :seed_genres="seed_genres"
        @toggle="toggleGenre($event.toggle, $event.seed)"
      />
    </li>
  </template>
</ul>
</template>

<style lang="css" scoped>
.wrapper--row {
  justify-content: center;
}
</style>

<script>
import { mapState, mapGetters } from 'vuex'
import axios from 'axios'
import axiosRetry from 'axios-retry'
import Genre from './Genre.vue'

axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay })

export default {
  name: 'GenreSearch',
  components: {
    Genre,
  },
  computed: {
    ...mapState({
      seed_genres: state => state.seed_genres,
    }),
    ...mapGetters(['seed_count'])
  },
  created() {
    this.getGenres()
  },
  methods: {
    toggleGenre: function(checked, genre) {
      checked ? this.$store.commit('addGenre', genre) : this.$store.commit('removeGenre',genre)
    },
    getGenres: function() {
      axios.get('http://localhost:3000/genres')
      .then(response => {
        this.server_error = null
        this.genres = response.data.genres
      })
      .catch(error => {
        this.server_error = error
        console.log(error)
      })
    },
  },
  data() {
    return {
      genres: [],
      server_error: null,
    }
  }
}
</script>
