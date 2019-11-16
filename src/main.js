import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import 'es6-promise/auto'
import App from './App.vue'
import store from './store'
import SearchBar from './components/SearchBar.vue'
import RecSettings from './components/RecSettings.vue'
import RecResults from './components/RecResults.vue'
import GenreSearch from './components/GenreSearch.vue'
import GeneralSearch from './components/GeneralSearch.vue'

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
  { path: '/recsettings', component:RecSettings },
  { path: '/results', component:RecResults }
]

const router = new VueRouter({
  routes
})

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
