import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import {supabase} from './supabase'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),

  created () {
    supabase.auth.onAuthStateChange((event) => {
      if (event == 'SIGNED_IN') {
          const user = supabase.auth.user()
          store.commit('SET_LOGGED_IN', true)
          store.commit('SET_IS_ADMIN', user.user_metadata.isAdmin)
          store.dispatch('getServices')
          store.dispatch('getCustomers')
          store.dispatch('getInvoices')
          store.dispatch('getUsers')
          store.dispatch('getFooter')
      }
      if (event == 'SIGNED_OUT') {
          store.commit('SET_LOGGED_IN', false)
      }
    })
  }
}).$mount('#app')
