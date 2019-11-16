<template lang="html">
  <div style="clear: both;">
    <h1>Seeds ({{ seed_count }}/5)</h1>
    <ul v-if="seed_count >0" class="seed__list">
      <li v-for="song in this.seed_songs"  :key="song.id" class="seed__container">
        <div class="checkbox seed">
          <Thumbnail
            :image_source="song.album.images[0]
              ? song.album.images[0].url
              : null"
            :name="song.name"
          />
            {{ song.name }} - {{ getArtistList(song.artists) }}
        </div>
      </li>
      <li v-for="artist in this.seed_artists"  :key="artist.id" class="seed__container">
        <div class="checkbox seed">
          <Thumbnail
            :image_source=
              "artist.images[0] ?
              artist.images[0].url
              : null"
            :name="artist.name"
          />
          {{ artist.name }}
        </div>
      </li>
      <li v-for="genre in this.seed_genres" :key="genre" class="seed__container">
        <div class="checkbox seed genre">
          {{ genre }}
        </div>
      </li>
    </ul>
    <template v-else>
      <section class="seed">The seeds you pick will show up here.</section>
    </template>
  </div>
</template>

<style lang="css" scoped>
.genre {
  justify-content: center;
}
.seed__list{
  display:flex;
  flex-flow: row nowrap;
  overflow-x:auto;
}
.seed__container {
  width: 30%;
  flex: 0 0 auto;
  margin: 0rem 0.2rem;
}
.seed {
  height: 3.25rem;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  padding: 0.25rem 0.25rem;
}
</style>

<script>
import { mapGetters, mapState } from 'vuex'
import Thumbnail from './Thumbnail.vue'

export default {
  name: 'SeedList',
  components: {
    Thumbnail,
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
  props: {},
  methods: {
    getArtistList: function(artists) {
      return artists.map(artist => artist.name).join(', ')
    },
  },
}
</script>
