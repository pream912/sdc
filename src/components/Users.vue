<template>
    <v-container>
        <v-row class="pa-3">
            <v-btn color="green" @click="dialog = true">Add User</v-btn>
            <v-dialog v-model="dialog" persistent max-width="750px">
                <v-card>
                    <v-card-title>User details</v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="6">
                                <v-text-field v-model="name" label="Username"></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-text-field v-model="phone" label="Phone"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-checkbox v-model="isAdmin" label="Admin"></v-checkbox>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="email" label="Email"></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-text-field prepend-inner-icon="mdi-lock" v-model="password" type="password" label="Password"></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-text-field prepend-inner-icon="mdi-lock" v-model="rpassword" :rules="passMatch" type="password" label="Repeat Password"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn :loading="loading" @click="createUser" color="green">Save</v-btn>
                        <v-btn color="red" @click="dialog = false">Cancel</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-data-table
                :headers="headers"
                :items="users">
                    <template v-slot:[`item.actions`]="{ item }">
                        <v-icon
                            small
                            color="orange"
                            class="mr-2"
                        >
                            mdi-pencil
                        </v-icon>
                        <v-icon
                            small
                            color="red"
                            class="mr-2"
                        >
                            mdi-delete
                        </v-icon>
                        <v-btn @click="startServer(item)" v-if="item.status == 'Inactive' && item.payment == 'Paid'" color="green" small>Start server</v-btn>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import {supabase} from '../supabase'
export default {
    data: () => ({
        dialog: false,
        headers: [
            {text: 'ID', value: 'id'},
            {text: 'Username', value: 'name'},
            {text: 'Email', value: 'email'},
            {text: 'Actions', value: 'actions'}
        ],
        name: null,
        isAdmin: false,
        phone: null,
        email: null,
        password: null,
        rpassword: null,
        loading: false
    }),
    methods: {
        createUser() {
            this.loading = true
            supabase.auth.signUp(
                {
                    email: this.email,
                    password: this.password,
                },
                {
                data: {
                    name: this.name,
                    phone: this.phone,
                    isAdmin: this.isAdmin,
                    email: this.email
                }
            }).then((data) => {
                let dat = data.user
                let error = data.error
                if(dat) {
                    let uid = dat.id
                    const user = {
                        uid: uid,
                        name: this.name,
                        email: this.email,
                        phone: this.phone,
                        isAdmin: this.isAdmin,
                        isActive: true,
                        createdby: this.user.id
                    }
                    supabase.from('users').insert([
                        user
                    ])
                    .then((res) => {
                        if(res.data) {
                            this.$store.dispatch('createAlert',{type: 'success', message: 'User created'})
                            this.getUsers()
                            this.close()
                            supabase.auth.signOut()
                        }
                        if(res.error) {
                            this.$store.dispatch('createAlert',{type: 'error', message: res.error.message})
                            this.loading = false
                        }
                    })
                }
                if(error) {
                    this.$store.dispatch('createAlert',{type: 'error', message: error.message})
                }
                this.loading = true
            } )
        },

        getUsers() {
            this.$store.dispatch('getUsers')
        },

        close() {
            this.name = null
            this.phone = null
            this.email = null
            this.password = null
            this.rpassword = null
            this.dialog = null
            this.loading = false
        },
    }, 
    computed: {
        user() {
            return supabase.auth.user()
        },
        passMatch () {
            return [v => (!!v && v) === this.password ||'Values do not match']
        },
        users() {
            return this.$store.getters.loadedUsers
        }
    },
}
</script>