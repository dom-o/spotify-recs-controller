<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import SearchBar from './components/SearchBar.vue'
export default {
  name: 'app',
  components: {
    SearchBar
  }
}
</script>

<style>
@import "https://cdnjs.cloudflare.com/ajax/libs/normalize/3.0.3/normalize.min.css";
@import "./assets/css/style.css";
</style>
