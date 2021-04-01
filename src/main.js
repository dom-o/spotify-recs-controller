import Vue from 'vue'
import VueRouter from 'vue-router'
import 'es6-promise/auto'
import App from './App.vue'
import store from './store'
import SearchBar from './components/SearchBar.vue'
import RecSettings from './components/RecSettings.vue'
import RecResults from './components/RecResults.vue'
import GenreSearch from './components/GenreSearch.vue'
import GeneralSearch from './components/GeneralSearch.vue'
import PlaylistExport from './components/PlaylistExport.vue'

Vue.config.productionTip = false
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/search'},
  { path: '/search', component:SearchBar,
    children: [{
      name: 'GeneralSearch',
      path: '',
      component: GeneralSearch
    }, {
      name: 'GenreSearch',
      path: 'genre',
      component: GenreSearch,
      props: true,
    }]
  },
  { path: '/recsettings', name: 'Settings', component: RecSettings },
  { path: '/results', name: 'Results', component: RecResults },
  { path: '/export', name: 'Export', component: PlaylistExport}
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
