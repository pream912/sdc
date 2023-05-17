<template>
    <v-container>
        <v-row class="pa-3">
            <v-dialog v-model="dialog" persistent max-width="750px">
                <v-card>
                    <v-card-title>Customer details</v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="6">
                                <v-text-field v-model="name" label="Name"></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-text-field v-model="phone" label="Phone"></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-text-field @input="getDateOfBirthFromAge(age)" v-model="age" label="Age"></v-text-field>
                            </v-col>
                            <v-col cols="6">
                                <v-select :items="genderlist" v-model="gender"></v-select>
                            </v-col>
                            <v-col cols="12">
                                <v-menu
                                    v-model="menu"
                                    :close-on-content-click="false"
                                    :nudge-right="40"
                                    transition="scale-transition"
                                    offset-y
                                    min-width="auto"
                                >
                                    <template v-slot:activator="{ on, attrs }">
                                    <v-text-field
                                        v-model="dob"
                                        label="Date of birth"
                                        prepend-icon="mdi-calendar"
                                        readonly
                                        v-bind="attrs"
                                        v-on="on"
                                    ></v-text-field>
                                    </template>
                                    <v-date-picker
                                    v-model="dob"
                                    @input="calculateAge(dob)"
                                    ></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="12">
                                <v-textarea v-model="address" label="Address"></v-textarea>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn v-if="editing" @click="updateCustomer" color="blue">Update</v-btn>
                        <v-btn v-else :loading="loading" @click="createCustomer" color="green">Save</v-btn>
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
        age: null,
        dob: null,
        gender: null,
        loading: false,
        editing: false,
        id: null,
        genderlist: ['Male', 'Female'],
        menu: false
    }),
    methods: {
        open() {
            this.dialog = true
        },

        edit(item) {
            this.name = item.name
            this.phone = item.phone
            this.address = item.address
            this.dob = item.dob
            this.gender = item.gender
            this.id = item.id
            this.editing = true
            this.dialog = true
            this.calculateAge(this.dob)
        },

        calculateAge(dob) {
            this.menu = false
            const birthDate = new Date(dob)
            const now = new Date();
            const diffInMs = now.getTime() - birthDate.getTime();
            const ageDate = new Date(diffInMs);
            this.age = Math.abs(ageDate.getUTCFullYear() - 1970);
        },

        getDateOfBirthFromAge(age) {
            const now = new Date();
            const currentYear = now.getFullYear();
            const birthYear = currentYear - age;
            const birthMonth = now.getMonth() + 1; // add 1 because getMonth() returns a zero-based index
            const birthDay = now.getDate();
            //return { year: birthYear, month: birthMonth, day: birthDay };
            this.dob = `${birthYear}-${birthMonth}-${birthDay}`
        },

        createCustomer() {
            this.loading = true
            const customer = {
                name: this.name,
                phone: this.phone,
                address: this.address,
                dob: this.dob,
                gender: this.gender,
                createdby: this.user.id,
                deleted: false
            }
            supabase.from('customers').insert([
                customer
            ])
            .then((res) => {
                if(res.data) {
                    this.$store.dispatch('createAlert',{type: 'success', message: 'Customer created'})
                    this.close()
                    this.$store.dispatch('getCustomers')
                    this.loading = false
                }
                if(res.error) {
                    this.$store.dispatch('createAlert',{type: 'error', message: res.error.message})
                    this.loading = false
                }
            })
        },

        updateCustomer() {
            this.loading = true
            const customer = {
                name: this.name,
                phone: this.phone,
                address: this.address,
                dob: this.dob,
                gender: this.gender,
                createdby: this.user.id
            }
            supabase.from('customers').update(customer).eq('id', this.id)
            .then((res) => {
                if(res.data) {
                    this.$store.dispatch('createAlert',{type: 'info', message: 'Customer updated'})
                    this.close()
                    this.$store.dispatch('getCustomers')
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
            this.dob = null
            this.age = null
            this.gender = null
            this.id = null
            this.editing = false
            this.dialog = null
        },
    },
    computed: {
        user() {
            return supabase.auth.user()
        },
    },
}
</script>