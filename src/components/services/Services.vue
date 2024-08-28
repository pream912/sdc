<template>
    <v-container>
        <v-row class="pa-3">
            <v-btn color="green" @click="addService">Add Service</v-btn>
        </v-row>
        <add-service-vue ref="addser"></add-service-vue>
        <v-row>
            <v-col cols="4">
                <v-text-field filled label="Search" v-model="search" append-icon="mdi-magnify"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-data-table
                :headers="headers"
                :search="search"
                :items="services">
                    <template v-slot:[`item.actions`]="{ item }">
                        <v-icon
                            small
                            color="orange"
                            class="mr-2"
                            v-if="isAdmin"
                            @click="editService(item)"
                        >
                            mdi-pencil
                        </v-icon>
                        <v-icon
                            small
                            color="red"
                            class="mr-2"
                            @click="deleteSer(item)"
                            v-if="isAdmin"
                        >
                            mdi-delete
                        </v-icon>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <v-row>
            <v-dialog v-model="delSerDialog" max-width="600">
                <v-card>
                    <v-card-title>Are you sure to delete the customer record?</v-card-title>
                    <v-card-actions>
                        <v-btn @click="deleteService" color="green">Yes</v-btn>
                        <v-btn @click="delSerDialog = false" color="red">No</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
    </v-container>
</template>

<script>
import {supabase} from '../../supabase'
import AddServiceVue from './AddService.vue'
export default {
    data: () => ({
        dialog: false,
        delSerDialog: false,
        headers: [
            {text: 'ID', value: 'id'},
            {text: 'Name', value: 'name'},
            {text: 'Medicine Included', value: 'med_included'},
            {text: 'Price (Rs.)', value: 'price'},
            {text: 'Actions', value: 'actions'}
        ],
        name: null,
        phone: null,
        address: null,
        email: null,
        website: null,
        loading: false, 
        search: '',
        selectedSer: {}
    }),
    methods: {

        addService() {
            this.$refs.addser.open()
        },

        editService(item) {
            this.$refs.addser.edit(item)
        },

        createService() {
            this.loading = true
            const service = {
                name: this.name,
                phone: this.phone,
                address: this.address,
                email: this.email,
                website: this.website,
                createdby: this.user.id
            }
            supabase.from('services').insert([
                service
            ])
            .then((res) => {
                if(res.data) {
                    this.$store.dispatch('createAlert',{type: 'success', message: 'Service created'})
                    this.getServices()
                    this.close()
                    this.loading = false
                }
                if(res.error) {
                    this.$store.dispatch('createAlert',{type: 'error', message: res.error.message})
                    this.loading = false
                }
            })
        },

        deleteSer(item) {
            this.delSerDialog = true
            this.selectedSer = item
        },

        deleteService() {
            supabase.from('services').update({deleted: true}).match({id: this.selectedSer.id})
            .then(() => {
                this.$store.dispatch('createAlert',{type: 'info', message: 'Service Deleted'})
                this.$store.dispatch('getServices')
                this.delSerDialog = false
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

        getServices() {
            this.$store.dispatch('getServices')
        }
    }, 
    computed: {
        user() {
            return supabase.auth.user()
        },
        services() {
            let services = this.$store.getters.loadedServices
            let filtSer = services.filter((item) => {
                return item.deleted == false
            })
            return filtSer
        },
        isAdmin() {
            return this.$store.getters.isAdmin
        }
    },

    components: {
        AddServiceVue
    },

    mounted() {
        if(this.services.length <= 0) {
            this.getServices()
        }
    }
}
</script>