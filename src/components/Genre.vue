<template lang="html">
  <label
    :for="genre"
    :class="{
      'checkbox': true,
      '--unchecked': !seed_genres.includes(genre),
      '--checked': seed_genres.includes(genre)
    }"
  >
    <BaseCheckbox
      class="checkbox__check"
      :id="genre"
      :checked="seed_genres.includes(genre)"
      :disabled="seed_count>=5 && !seed_genres.includes(genre)"
      @toggle="$emit('toggle', {seed:genre, type:'Genre', toggle:$event})"
    />
    {{genre}}
  </label>
</template>

<style lang="css" scoped>
.checkbox {
  flex-flow: row wrap;
  justify-content:center;
  align-content: center;
  padding: 0.3rem 0.35rem;
  width: auto;
}
.checkbox__check {
  margin-right: 0.25rem;
}
</style>

<script>
import BaseCheckbox from './BaseCheckbox.vue'
import Thumbnail from './Thumbnail.vue'

export default {
  name: 'Genre',
  components: {
    BaseCheckbox,
    Thumbnail,
  },
  props: {
    genre: String,
    seed_genres: Array,
    seed_count: Number,
  },
}
</script>
