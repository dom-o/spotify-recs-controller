<template lang="html">
  <div>
    ..loading
  </div>
</template>

<style lang="css" scoped>
</style>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Callback',
  computed: {
    ...mapState({
      callback_state: state => state.callback_state
    })
  },
  created() {
    this.$store.commit('retrieveState')
    if(this.$route.hash) {
      const hash = this.$route.hash.substr(1).split('&').reduce((acc, el) => {
        let splits = el.split('=')
        acc[splits[0]] = splits[1]
        return acc
      }, {});
      if(hash.state === null || hash.state != this.callback_state) {
        this.$store.commit('setLoginError', Error('State mismatch'))
      } else {
        if(hash.access_token && hash.token_type==='Bearer') {
          this.$store.commit('setAccessToken', hash.access_token)
          this.$store.commit('setLoginError', null)
        }
      }
    } else if(Object.entries(this.$route.query).length > 0) {
      if(this.$route.query.state === null || this.$route.query.state != this.callback_state) {
        this.$store.commit('setLoginError', Error('State mismatch'))
      } else if(this.$route.query.error) {
        this.$store.commit('setLoginError', Error(this.$route.query.error))
      }
    }
    this.$router.push({ path: 'export' })
  }
}

</script>
