<template lang="html">
  <div class="thumbnail__container">
    <img v-if="this.image_source"
      ref="image"
      :class="{
        'thumbnail__image': true,
        'thumbnail__image--wide': wide,
        'thumbnail__image--high': !wide
      }"
      :src="this.image_source"
      :alt="'Display image for '+ name"
    />
  </div>
</template>

<style lang="css" scoped>
.thumbnail__container {
  width: 2.75rem;
  height: 2.75rem;
  display:flex;
  flex: 0 0 auto;
  justify-content:center;
  overflow:hidden;
  background-color: lightgrey;
  margin: 0.25rem 1rem 0.25rem 0.5rem;
  border-radius:5px;
}
.thumbnail__image {
  flex:none;
  display: block;
}
.thumbnail__image--high {
  width: 100%;
}
.thumbnail__image--wide {
  height: 100%;
}
.placeholder--thumbnail {
  width:100%;
  height:100%;
  display:inline-block;
  background-color: lightgrey;
}
</style>

<script>
export default {
  name: 'Thumbnail',
  props: {
    image_source: String,
    name: String,
  },
  mounted() {
    if(this.$refs.image) {
      this.wide = this.$refs.image.naturalHeight < this.$refs.image.naturalWidth
    }
  },
  data() {
    return {
      wide: null
    }
  },
}
</script>
