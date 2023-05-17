<template>
    <v-container>
        <v-row class="pa-3">
            <v-dialog v-model="dialog" persistent max-width="750px">
                <v-card>
                    <v-card-title>Vendor details</v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="6">
                                <v-text-field v-model="name" label="Name"></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-text-field v-model="phone" label="Phone"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="email" label="Email"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="website" label="Website"></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-textarea v-model="address" label="Address"></v-textarea>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn v-if="editing" :loading="loading" @click="updateVendor" color="blue">Update</v-btn>
                        <v-btn v-else :loading="loading" @click="createVendor" color="green">Save</v-btn>
                        <v-btn color="red" @click="dialog = false">Cancel</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
    </v-container>
</template>

<script>
import {supabase} from '../../supabase'
export default {
    data: () => ({
        dialog: false,
        name: null,
        phone: null,
        address: null,
        email: null,
        website: null,
        loading: false, 
        search: '',
        id: null,
        editing: false
    }),
    methods: {
        open() {
            this.dialog = true
        },
        edit(item) {
            this.name = item.name
            this.phone = item.phone
            this.address = item.address
            this.email = item.email
            this.id = item.id
            this.website = item.website
            this.editing = true
            this.dialog = true
        },
        createVendor() {
            this.loading = true
            const vendor = {
                name: this.name,
                phone: this.phone,
                address: this.address,
                email: this.email,
                website: this.website,
                createdby: this.user.id
            }
            supabase.from('vendors').insert([
                vendor
            ])
            .then((res) => {
                if(res.data) {
                    this.$store.dispatch('createAlert',{type: 'success', message: 'Vendor created'})
                    this.$store.dispatch('getInvoices')
                    this.close()
                    this.loading = false
                }
                if(res.error) {
                    this.$store.dispatch('createAlert',{type: 'error', message: res.error.message})
                    this.loading = false
                }
            })
        },

        updateVendor() {
            this.loading = true
            const vendor = {
                name: this.name,
                phone: this.phone,
                address: this.address,
                email: this.email,
                website: this.website,
                createdby: this.user.id
            }
            supabase.from('vendors').update(vendor).eq('id', this.id)
            .then((res) => {
                if(res.data) {
                    this.$store.dispatch('createAlert',{type: 'info', message: 'Vendor updated'})
                    this.$store.dispatch('getInvoices')
                    this.close()
                    this.loading = false
                }
                if(res.error) {
                    this.$store.dispatch('createAlert',{type: 'error', message: res.error.message})
                    this.loading = false
                }
            })
        },
        close() {
            this.name = null
            this.phone = null
            this.address = null
            this.email = null
            this.website = null
            this.dialog = null
        },

        getVendors() {
            this.$store.dispatch('getVendors')
        }
    }, 
    computed: {
        user() {
            return supabase.auth.user()
        },
        vendors() {
            return this.$store.getters.loadedVendors
        }
    },

    mounted() {
        if(this.vendors.length <= 0) {
            this.getVendors()
        }
    }
}
</script>