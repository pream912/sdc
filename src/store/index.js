import Vue from 'vue'
import Vuex from 'vuex'
import {supabase} from '../supabase'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        isAdmin: false,
        alert: {alert: false},
        loggedIn: false,
        userProfile: null,
        customers: [],
        services: [],
        invoices: [],
        allinvoices: [],
        users: [],
        footer: null
    },

    getters: {
        loggedIn (state) {
            return state.loggedIn
        },
        isAdmin (state) {
            return state.isAdmin
        },
        userProfile (state) {
            return state.userProfile
        },
        loadedAlert (state) {
            return state.alert
        },
        loadedCustomers (state) {
            return state.customers
        },
        loadedCustomer (state) {
            return (customerId) => {
                return state.customers.find((customer) => {
                    return customer.id === customerId
                })
            }
        },
        loadedServices (state) {
            return state.services
        },
        loadedService (state) {
            return (serviceId) => {
                return state.services.find((service) => {
                    return service.id === serviceId
                })
            }
        },
        loadedInvoices (state) {
            return state.invoices
        },
        allLoadedInvoices (state) {
            return state.allinvoices
        },
        loadedUsers (state) {
            return state.users
        },
        loadedFooter (state) {
            return state.footer
        }
    },

    mutations: {
        setAlert (state, payload) {
            state.alert = payload
        },
        SET_LOGGED_IN(state, payload) {
            state.loggedIn = payload;
        },
        SET_IS_ADMIN(state, payload) {
            state.isAdmin = payload;
        },
        SET_PROFILE (state, payload) {
            state.userProfile = payload
        },
        SET_CUSTOMERS (state, payload) {
            state.customers = payload
        },
        SET_SERVICES (state, payload) {
            state.services = payload
        },
        SET_INVS (state, payload) {
            state.invoices = payload
        },
        SET_ALLINVS (state, payload) {
            state.allinvoices = payload
        },
        SET_USERS (state, payload) {
            state.users = payload
        },
        SET_FOOTER (state, payload) {
            state.footer = payload
        },
    },
    actions: {
        async getCustomers ({commit, dispatch}) {
            const { data, error } = await supabase.from('customers').select('*')
            if(data) {
                commit('SET_CUSTOMERS', data)
            }
            if(error) {
                dispatch('createAlert',{type: 'error', message: error.message})
            }
        },

        async getFooter ({commit, dispatch}) {
            const { data, error } = await supabase.from('footer').select('*')
            if(data) {
                commit('SET_FOOTER', data[0].message)
            }
            if(error) {
                dispatch('createAlert',{type: 'error', message: error.message})
            }
        },

        async getServices ({commit, dispatch}) {
            const { data, error } = await supabase.from('services').select('*')
            if(data) {
                commit('SET_SERVICES', data)
            }
            if(error) {
                dispatch('createAlert',{type: 'error', message: error.message})
            }
        },

        async getInvoices ({commit, dispatch, getters}) {
            // if(getters.isAdmin) {
            //     const { data, error } = await supabase.from('invoices').select('*')
            //     if(data) {
            //         commit('SET_INVS', data)
            //     }
            //     if(error) {
            //         dispatch('createAlert',{type: 'error', message: error.message})
            //     }
            // } else {
            //     const user = supabase.auth.user()
            //     const uid = user.id
            //     const { data, error } = await supabase.from('invoices').select('*').eq('createdby', uid)
            //     if(data) {
            //         commit('SET_INVS', data)
            //     }
            //     if(error) {
            //         dispatch('createAlert',{type: 'error', message: error.message})
            //     }
            // }
            const { data, error } = await supabase.from('invoices').select('*').order('id', { ascending: false })
            if(data) {
                commit('SET_ALLINVS', data)
                if(getters.isAdmin) {
                    commit('SET_INVS', data)
                } else {
                    const user = supabase.auth.user()
                    const uid = user.id
                    let filtInvs = data.filter((item) => {
                        return item.createdby == uid && item.deleted != true
                    })
                    commit('SET_INVS', filtInvs)
                }
            }
            if(error) {
                dispatch('createAlert',{type: 'error', message: error.message})
            }
        },

        async getAllInvoices ({commit, dispatch}) {
            const { data, error } = await supabase.from('invoices').select('*')
            if(data) {
                let filtInvs = data.filter((item) => {
                    return item.deleted != true
                })
                commit('SET_ALLINVS', filtInvs)
            }
            if(error) {
                dispatch('createAlert',{type: 'error', message: error.message})
            }
        },

        async getUsers ({commit, dispatch}) {
            const { data, error } = await supabase.from('users').select('*')
            if(data) {
                commit('SET_USERS', data)
            }
            if(error) {
                dispatch('createAlert',{type: 'error', message: error.message})
            }
        },

        createAlert ({commit}, payload) {
            const data = {
                alert: true,
                type: payload.type,
                message: payload.message
            }
            commit('setAlert', data)
            setTimeout(() => {
                commit('setAlert', {alert: false})
            }, 3000);
        },
    },
    modules: {
    }
})
