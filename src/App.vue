<template>
  <div>
  <header>Back to <a href="https://domonicmilesi.com/">domonicmilesi.com</a></header>
  <div id="app">

    <router-view></router-view>
  </div>
</div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
@import "https://cdnjs.cloudflare.com/ajax/libs/normalize/3.0.3/normalize.min.css";
@import "./assets/css/style.css";
</style>
