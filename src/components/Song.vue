<template lang="html">
  <label
    :for="song.id"
    :class="{
      'checkbox': true,
      '--unchecked': !seed_songs.some(el => el.id == song.id),
      '--checked': seed_songs.some(el => el.id == song.id)
    }"
  >
    <BaseCheckbox
      :id="song.id"
      :checked="seed_songs.some(el => el.id == song.id)"
      :disabled="seed_count>=5 && !seed_songs.some(el => el.id == song.id)"
      @toggle="$emit('toggle', {seed:song, type:'Song', toggle:$event})"
    />
    <Thumbnail
      :image_source="song.album.images[0]
        ? song.album.images[0].url
        : null"
      :name="song.name"
    />
      {{ song.name }} - {{ getArtistList(song.artists) }}
  </label>
</template>

<script>
import BaseCheckbox from './BaseCheckbox.vue'
import Thumbnail from './Thumbnail.vue'

export default {
  name: 'Song',
  components: {
    BaseCheckbox,
    Thumbnail,
  },
  props: {
    song: Object,
    seed_songs: Array,
    seed_count: Number,
  },
  methods: {
    getArtistList: function(artists) {
      return artists.map(artist => artist.name).join(', ')
    },
  },
}
</script>
