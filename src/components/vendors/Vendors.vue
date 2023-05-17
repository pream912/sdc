<template>
    <v-container>
        <v-row class="pa-3">
            <v-btn color="green" @click="addVendor">Add Vendor</v-btn>
            <!-- <v-dialog v-model="dialog" persistent max-width="750px">
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
                        <v-btn :loading="loading" @click="createVendor" color="green">Save</v-btn>
                        <v-btn color="red" @click="dialog = false">Cancel</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog> -->
        </v-row>
        <add-vendors-vue ref="addven"></add-vendors-vue>
        <v-row>
            <v-col cols="4">
                <v-text-field filled label="Search" v-model="search" append-icon="mdi-magnify"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-data-table
                :headers="headers"
                :search="search"
                :items="vendors">
                    <template v-slot:[`item.actions`]="{ item }">
                        <v-icon
                            small
                            color="orange"
                            class="mr-2"
                            v-if="isAdmin"
                            @click="editVendor(item)"
                        >
                            mdi-pencil
                        </v-icon>
                        <v-icon
                            small
                            color="red"
                            class="mr-2"
                            @click="deleteVen(item)"
                            v-if="isAdmin"
                        >
                            mdi-delete
                        </v-icon>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <v-row>
            <v-dialog v-model="delVenDialog" max-width="600">
                <v-card>
                    <v-card-title>Are you sure to delete the customer record?</v-card-title>
                    <v-card-actions>
                        <v-btn @click="deleteVendor" color="green">Yes</v-btn>
                        <v-btn @click="delVenDialog = false" color="red">No</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
    </v-container>
</template>

<script>
import {supabase} from '../../supabase'
import AddVendorsVue from './AddVendors.vue'
export default {
    data: () => ({
        dialog: false,
        delVenDialog: false,
        headers: [
            {text: 'ID', value: 'id'},
            {text: 'Name', value: 'name'},
            {text: 'Phone', value: 'phone'},
            {text: 'Actions', value: 'actions'}
        ],
        name: null,
        phone: null,
        address: null,
        email: null,
        website: null,
        loading: false, 
        search: '',
        selectedVen: {}
    }),
    methods: {

        addVendor() {
            this.$refs.addven.open()
        },

        editVendor(item) {
            this.$refs.addven.edit(item)
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
                    this.getVendors()
                    this.close()
                    this.loading = false
                }
                if(res.error) {
                    this.$store.dispatch('createAlert',{type: 'error', message: res.error.message})
                    this.loading = false
                }
            })
        },

        deleteVen(item) {
            this.delVenDialog = true
            this.selectedVen = item
        },

        deleteVendor() {
            supabase.from('vendors').update({deleted: true}).match({id: this.selectedVen.id})
            .then(() => {
                this.$store.dispatch('createAlert',{type: 'info', message: 'Vendor Deleted'})
                this.$store.dispatch('getVendors')
                this.delVenDialog = false
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
            let vendors = this.$store.getters.loadedVendors
            let filtVen = vendors.filter((item) => {
                return item.deleted == false
            })
            return filtVen
        },
        isAdmin() {
            return this.$store.getters.isAdmin
        }
    },

    components: {
        AddVendorsVue
    },

    mounted() {
        if(this.vendors.length <= 0) {
            this.getVendors()
        }
    }
}
</script>