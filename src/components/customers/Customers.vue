<template>
    <v-container>
        <v-row class="pa-3">
            <v-btn color="green" @click="addCustomer">Add customer</v-btn>
        </v-row>
        <add-customer-vue ref="addcus"></add-customer-vue>
        <v-row>
            <v-col cols="4">
                <v-text-field filled label="Search" v-model="search" append-icon="mdi-magnify"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-data-table
                :headers="headers"
                :search="search"
                :items="customers">
                    <template v-slot:[`item.actions`]="{ item }">
                        <v-icon
                            small
                            color="orange"
                            class="mr-2"
                            @click="editCustomer(item)"
                            v-if="isAdmin"
                        >
                            mdi-pencil
                        </v-icon>
                        <v-icon
                            small
                            color="red"
                            class="mr-2"
                            @click="deleteCus(item)"
                            v-if="isAdmin"
                        >
                            mdi-delete
                        </v-icon>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <v-row>
            <v-dialog v-model="delCusDialog" max-width="600">
                <v-card>
                    <v-card-title>Are you sure to delete the customer record?</v-card-title>
                    <v-card-actions>
                        <v-btn @click="deleteCustomer" color="green">Yes</v-btn>
                        <v-btn @click="delCusDialog = false" color="red">No</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
    </v-container>
</template>

<script>
import {supabase} from '../../supabase'
import AddCustomerVue from './AddCustomer.vue'
export default {
    data: () => ({
        dialog: false,
        delCusDialog: false,
        headers: [
            {text: 'Reg No.', value: 'regno'},
            {text: 'Name', value: 'name'},
            {text: 'Phone', value: 'phone'},
            {text: 'Actions', value: 'actions'}
        ],
        name: null,
        phone: null,
        address: null,
        email: null,
        loading: false,
        search: '',
        selectedCus: {}
    }),
    methods: {
        addCustomer() {
            this.$refs.addcus.open()
        },

        editCustomer(item) {
            this.$refs.addcus.edit(item)
        },

        deleteCus(item) {
            this.delCusDialog = true
            this.selectedCus = item
        },

        deleteCustomer() {
            supabase.from('customers').update({deleted: true}).match({id: this.selectedCus.id})
            .then(() => {
                this.$store.dispatch('createAlert',{type: 'info', message: 'Customer Deleted'})
                this.$store.dispatch('getCustomers')
                this.delCusDialog = false
            })
        },

        createCustomer() {
            this.loading = true
            const customer = {
                name: this.name,
                phone: this.phone,
                address: this.address,
                email: this.email,
                createdby: this.user.id
            }
            supabase.from('customers').insert([
                customer
            ])
            .then((res) => {
                if(res.data) {
                    this.$store.dispatch('createAlert',{type: 'success', message: 'Customer created'})
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
            this.dialog = null
        },

        getCustomers() {
            this.$store.dispatch('getCustomers')
        }
    },
    computed: {
        user() {
            return supabase.auth.user()
        },
        customers() {
            let customers = this.$store.getters.loadedCustomers
            let filtCus = customers.filter((item) => {
                return item.deleted == false
            })
            return filtCus
        },
        isAdmin() {
            return this.$store.getters.isAdmin
        }
    },

    components: {
        AddCustomerVue
    },

    mounted() {
        if(this.customers.length <= 0) {
            this.getCustomers()
        }
    }
}
</script>