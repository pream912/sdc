<template>
    <v-container>
        <v-row class="pa-3">
            <v-dialog v-model="dialog" persistent max-width="750px">
                <v-card>
                    <v-card-title>Service details</v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="6">
                                <v-text-field v-model="name" label="Service Name"></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-text-field v-model="price" label="Price"></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-text-field v-model="description" label="Description"></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-checkbox v-model="med_included" label="Medicines Included"></v-checkbox>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn v-if="editing" :loading="loading" @click="updateService" color="blue">Update</v-btn>
                        <v-btn v-else :loading="loading" @click="createService" color="green">Save</v-btn>
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
        price: null,
        description: null,
        loading: false, 
        search: '',
        id: null,
        editing: false,
        med_included: false
    }),
    methods: {
        open() {
            this.dialog = true
        },
        edit(item) {
            this.name = item.name
            this.price = item.price
            this.description = item.description
            this.med_included = item.med_included
            this.editing = true
            this.dialog = true
            this.id = item.id
        },
        createService() {
            this.loading = true
            const service = {
                name: this.name,
                price: this.price,
                description: this.description,
                med_included: this.med_included,
                createdby: this.user.id
            }
            supabase.from('services').insert([
                service
            ])
            .then((res) => {
                if(res.data) {
                    this.$store.dispatch('createAlert',{type: 'success', message: 'Service created'})
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

        updateService() {
            this.loading = true
            const service = {
                name: this.name,
                price: +this.price,
                description: this.description,
                med_included: this.med_included
            }
            console.log(service);
            supabase.from('services').update(service).eq('id', this.id)
            .then((res) => {
                if(res.data) {
                    this.$store.dispatch('createAlert',{type: 'info', message: 'Service updated'})
                    this.$store.dispatch('getInvoices')
                    this.close()
                    this.loading = false
                }
                if(res.error) {
                    this.$store.dispatch('createAlert',{type: 'error', message: res.error.message})
                    this.loading = false
                    console.log(res.error);
                }
            })
        },
        close() {
            this.name = null
            this.price = null
            this.description = null
            this.med_included = false
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
            return this.$store.getters.loadedServices
        }
    },

    mounted() {
        if(this.services.length <= 0) {
            this.getServices()
        }
    }
}
</script>