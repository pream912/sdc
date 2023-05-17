<template>
    <v-container>
        <v-row>
            <v-dialog v-model="dialog" max-width="700" persistent>
                <v-card>
                    <v-card-title>Add vendor payment (Invoice No. {{selectedInv.id}})</v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12">
                                <v-data-table
                                :headers="headers"
                                :items="items"
                                hide-default-footer>
                                    <template v-slot:[`item.vendor`]="{ item }">
                                        {{getVname(item.vendor)}}
                                    </template> 
                                    <template v-slot:[`item.actions`]="{ item }">
                                        <v-btn x-small @click="addAmount(item)" color="green">Add amount</v-btn>
                                    </template> 
                                </v-data-table>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="blue" @click="updatePayments">update</v-btn>
                        <v-btn color="red" @click="clear">update</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
        <v-row>
            <v-dialog v-model="addPayDialog" max-width="500" persistent>
                <v-card>
                    <v-card-title>Add payment details</v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="4">
                                <v-text-field label="Purchase Amount" v-model="item.pa" readonly></v-text-field>
                            </v-col>
                            <v-col cols="4">
                                <v-text-field label="Paid Amount" v-model="item.vps"></v-text-field>
                            </v-col>
                            <v-col cols="4">
                                <v-text-field label="Reference no." v-model="item.vrno"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn @click="updateAmount" color="blue">Update</v-btn>
                        <v-btn @click="addPayDialog=false" color="red">Cancel</v-btn>
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
        selectedInv: {},
        dialog: false,
        addPayDialog: false,
        items: [],
        item: {},
        headers: [
            {text: 'Service type', value: 'svc'},
            {text: 'Vendor', value: 'vendor'},
            {text: 'Purchase amount', value: 'pa'},
            {text: 'Paid amount', value: 'vps'},
            {text: 'Reference no.', value: 'vrno'},
            {text: 'Actions', value: 'actions'},
        ],
    }),

    methods: {
        open(inv) {
            this.dialog = true
            this.selectedInv = inv
            this.items = inv.items
        },
        getVname(vendor) {
            return this.$store.getters.loadedVendor(vendor).name
        },
        addAmount(item) {
            this.addPayDialog = true
            this.item = item
        },
        updateAmount() {
            let index = this.items.indexOf(this.item)
            this.items.splice(index, 1)
            this.items.push(this.item)
            this.addPayDialog = false
            this.item = {}
        },
        updatePayments() {
            supabase.from('invoices').update({items: this.items}).match({id: this.selectedInv.id})
            .then(() => {
                this.$store.dispatch('getInvoices')
                this.$store.dispatch('createAlert',{type: 'info', message: 'Invoice updated'})
                this.clear()
            })
        },

        clear() {
            this.dialog = false
            this.addPayDialog = false
            this.selectedInv = {}
            this.items = []
            this.item = {}
        }
    }
}
</script>
