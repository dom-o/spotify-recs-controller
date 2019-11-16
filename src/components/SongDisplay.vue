<template lang="html">
<div class="checkbox">
  <a
    :href="uriToUrl(song.uri)"
    target="_blank" rel="noopener noreferrer"
    class="wrapper--row"
  >
    <Thumbnail
      class="thumbnail--big"
      :image_source="song.album.images[song.album.images.length-1]
        ? song.album.images[song.album.images.length-1].url
        : null"
      :name="song.name"
    />
    <section class="wrapper--col"><strong>{{ song.name }}</strong> <span>{{ getArtistList(song.artists) }}</span></section>
  </a>
  <audio class="song__audio" controls :src="song.preview_url"></audio>
</div>
</template>

<style lang="css" scoped>
.thumbnail--big{
  width:4.5rem;
  height:4.5rem;
}
.checkbox {
  flex-flow: row nowrap;
  justify-content: flex-start;
  margin: 0rem 1rem;
  border: 0;
}
.wrapper--col {
  justify-content: center;
}
.wrapper--row {
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items:center;
  flex-grow: 1;
}
.song__audio {
  margin-left: auto;
  width: 35%;
}
</style>

<script>
import Thumbnail from './Thumbnail.vue'

export default {
  name: 'SongDisplay',
  components: {
    Thumbnail,
  },
  props: {
    song: Object,
  },
  data () {
    return {

    }
  },
  methods: {
    uriToUrl: function(uri) {
      return uri.replace(/:/g, '/').replace('spotify', 'https://open.spotify.com')
    },
    getArtistList: function(artists) {
      return artists.map(artist => artist.name).join(', ')
    },
  },
}
</script>
