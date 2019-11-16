<template lang="html">
  <label
    :for="artist.id"
    :class="{
      'checkbox': true,
      '--unchecked': !seed_artists.some(el => el.id == artist.id),
      '--checked': seed_artists.some(el => el.id == artist.id)
    }"
  >
    <BaseCheckbox
      :id="artist.id"
      :checked="seed_artists.some(el => el.id == artist.id)"
      :disabled="seed_count>=5 && !seed_artists.some(el => el.id == artist.id)"
      @toggle="$emit(
        'toggle',
        {seed:artist, type:'Artist', toggle:$event}
      )"
    />
    <Thumbnail
      :image_source=
        "artist.images[0] ?
        artist.images[0].url
        : null"
      :name="artist.name"
    />
    {{ artist.name }}
  </label>
</template>

<script>
import BaseCheckbox from './BaseCheckbox.vue'
import Thumbnail from './Thumbnail.vue'

export default {
  name: 'Artist',
  components: {
    BaseCheckbox,
    Thumbnail,
  },
  props: {
    artist: Object,
    seed_artists: Array,
    seed_count: Number,
  },
}
</script>
