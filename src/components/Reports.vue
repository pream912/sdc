<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <h2>Reports</h2>
            </v-col>
        </v-row>
        <v-row v-if="isAdmin">
            <v-col cols="12">
                <v-autocomplete :disabled="sall" @change="staffSelected" label="Select staff" :items="users" v-model="uid" item-value="uid" item-text="name" ></v-autocomplete>
                <v-checkbox label="Select all" v-model="sall"></v-checkbox>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <h3>Customer wise data</h3>
            </v-col>
            <v-col cols="12">
                <v-data-table
                :headers="cheaders"
                :items="citems"></v-data-table>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <h3>Vendor wise data</h3>
            </v-col>
            <v-col cols="12">
                <v-data-table
                :headers="vheaders"
                :items="vitems"></v-data-table>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    data: () => ({
        invoices: [],
        uid: null,
        sall: false,
        cheaders: [
            {text: 'Customer name', value: 'name'},
            {text: 'Sale($)', value: 'amount'},
            {text: 'Pending amount($)', value: 'pamount'}
        ],
        vheaders: [
            {text: 'Vendor name', value: 'name'},
            {text: 'Amount($)', value: 'amount'},
        ],
        citems: [],
        vitems: []
    }),

    methods: {
        amount(items) {
            let amount = 0
            for(let i in items) {
                amount = +amount + +items[i].sa
            }  
            return amount
        },

        checkAmount(payments) {
            let tamount = 0
            for(let i in payments) {
                tamount = tamount + +payments[i].ramount
            }
            return tamount
        },

        checkPurchase(items) {
            let amount = 0
            for(let i in items) {
                amount = +amount + +items[i].pa
            }  
            return amount
        },

        venWisePurchase(items, id) {
            let amount = 0
            for(let i in items) {
                if(items[i].vendor == id) {
                    amount = +amount + +items[i].pa
                }
            }
            return amount
        },

        staffSelected() {
            this.invoices = this.loadedInv.filter((item) => {
                return item.createdby == this.uid
            })
            this.calcCustomerData()
            this.calcVendorData()
        },

        selectedAll() {
            if (this.sall) {
                this.invoices = this.loadedInv
                this.calcCustomerData()
                this.calcVendorData()
            } else {
                this.staffSelected()
            }
        },

        getName(cid) {
            return this.$store.getters.loadedCustomer(cid).name
        },

        getVname(vendor) {
            return this.$store.getters.loadedVendor(vendor).name
        },

        calcCustomerData() {
            let cdata = []
            let invs = this.invoices
            let cus = this.customers
            let cid = null
            for(let i in cus) {
                let tamount = 0
                let pamount = 0
                cid = cus[i].id
                for(let j in invs) {
                    if(invs[j].cid == cid) {
                        tamount = +tamount + +this.amount(invs[j].items)
                        pamount = +pamount + +this.checkAmount(invs[j].payments)
                    }
                }
                let pendingamount = +tamount - +pamount
                cdata.push({
                    name: this.getName(cid),
                    amount: tamount,
                    pamount: pendingamount
                })
            }
            this.citems = cdata
        },

        calcVendorData() {
            let vdata = []
            let invs = this.invoices
            let ven = this.vendors
            let vid = null
            for(let i in ven) {
                let tamount = 0
                vid = ven[i].id
                for(let j in invs){
                    let items = invs[j].items
                    tamount = +tamount + +this.venWisePurchase(items, vid)
                }
                vdata.push({
                    name: this.getVname(vid),
                    amount: tamount
                })
            }
            this.vitems = vdata
        }
    },

    computed: {
        users() {
            return this.$store.getters.loadedUsers
        },

        loadedInv() {
            return this.$store.getters.loadedInvoices
        },

        customers() {
            return this.$store.getters.loadedCustomers
        },

        vendors() {
            return this.$store.getters.loadedVendors
        },

        isAdmin() {
            return this.$store.getters.isAdmin
        }
    },

    mounted() {
        if(!this.isAdmin) {
            this.invoices = this.loadedInv
            this.calcCustomerData()
            this.calcVendorData()
        }
    }
}
</script>