<template>
    <v-container>
        <v-row>
            <v-col cols="4">
                <v-text-field filled label="Search" v-model="search" append-icon="mdi-magnify"></v-text-field>
            </v-col>
            <v-col cols="4"></v-col>
            <v-col v-if="duration == 'Select range'" cols="4">
                <v-menu
                    v-model="fmenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                >
                    <template v-slot:activator="{ on }">
                    <v-text-field 
                    filled
                    v-model="fdate"
                    label="From date"
                    v-on="on"
                    readonly
                    ></v-text-field>
                    </template>
                    <v-date-picker @change="dateFilters" v-model="fdate"></v-date-picker>
                </v-menu>
            </v-col>
            <v-col v-if="duration == 'Select range'" cols="4">
                <v-menu
                    v-model="tmenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                >
                    <template v-slot:activator="{ on }">
                    <v-text-field 
                    filled
                    v-model="tdate"
                    label="To date"
                    v-on="on"
                    readonly
                    ></v-text-field>
                    </template>
                    <v-date-picker @change="dateFilters" v-model="tdate"></v-date-picker>
                </v-menu>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-data-table
                :headers="invheader"
                :search="search"
                :items="fitems">
                    <template v-slot:[`item.idate`]="{ item }">
                        {{toLocalDate(item.idate)}}
                    </template>
                    <!-- <template v-slot:[`item.regno`]="{ item }">
                        {{getRegno(item.cid)}}
                    </template>
                    <template v-slot:[`item.name`]="{ item }">
                        {{getName(item.cid)}}
                    </template> -->
                    <template v-slot:[`item.ramount`]="{ item }">
                        <div v-if="balAmount(item.payments, item.amount) != 0" class="red--text">{{balAmount(item.payments, item.amount)}}</div>
                        <div v-else class="green--text">{{balAmount(item.payments, item.amount)}}</div>
                    </template>
                    <template v-slot:[`item.actions`]="{ item }">
                        <v-btn x-small @click="addPayment(item)" v-if="balAmount(item.payments, item.amount) != 0"  color="green">Add payment</v-btn>
                        <!-- <v-btn x-small @click="addVendorPayment(item)" v-if="vBalance(item) != 0"  color="blue">Vendor payment</v-btn> -->
                        <v-btn small icon @click="printInvoice(item)">
                            <v-icon>mdi-open-in-new</v-icon>
                        </v-btn>
                        <v-btn small v-if="isAdmin" icon @click="editInv(item)">
                            <v-icon color="orange">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn small v-if="isAdmin" icon @click="resetPayment(item.id)">
                            <v-icon color="orange">mdi-currency-usd-off</v-icon>
                        </v-btn>
                        <v-btn small icon v-if="!item.isCanceled">
                            <v-icon @click="deleteInv(item)" color="red">mdi-delete</v-icon>
                        </v-btn>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <v-row>
            <v-dialog v-model="addPaymentDialog" max-width="600px" persistent>
                <v-card>
                    <v-card-title>Payment details</v-card-title>
                    <v-card-text>
                        <v-menu
                            v-model="dmenu"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                        >
                            <template v-slot:activator="{ on }">
                            <v-text-field 
                            outlined
                            v-model="idate"
                            label="Date"
                            v-on="on"
                            readonly
                            ></v-text-field>
                            </template>
                            <v-date-picker v-model="idate"></v-date-picker>
                        </v-menu>
                        <v-select :items="paymentmodes" outlined v-model="mop" label="Mode of payment"></v-select>
                        <v-text-field v-model="ramount" outlined label="Amount recieved"></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn @click="updatePayment" color="blue">update</v-btn>
                        <v-btn @click="clearPaydata" color="red">cancel</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
        <v-row>
            <v-dialog v-model="delInvDialog" max-width="600">
                <v-card>
                    <v-card-title>Are you sure to cancel the invoice?</v-card-title>
                    <v-card-actions>
                        <v-btn @click="deleteInvoice" color="green">Yes</v-btn>
                        <v-btn @click="delInvDialog = false" color="">No</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
        <v-row>
            <add-invoice-vue ref="addinv"></add-invoice-vue>
            <add-vendor-payment-vue ref="addvpay"></add-vendor-payment-vue>
        </v-row>
    </v-container>
</template>

<script>
import AddInvoiceVue from './AddInvoice.vue'
import AddVendorPaymentVue from './AddVendorPayment.vue'
import {supabase} from '../../supabase'
export default {
    data: () => ({
        duraList: ['Current month', 'Last 7 days', 'All', 'Select range'],
        dialog: false,
        duration: 'Current month',
        delInvDialog: false,
        search: '',
        dialog1: false,
        id: null,
        addPaymentDialog: false,
        ramount: null,
        dmenu: false,
        idate: null,
        itemValidate: true,
        reqRule: [v => !!v || 'Phone number is required'],
        paymentmodes: ['Bank Transfer', 'Cash', 'Cheque', 'Credit Card', 'Debit Card', 'G-Pay', 'Paytm', 'PhonePe'],
        mop: null,
        items: [],
        invheader: [
            {text: 'Invoice no.', value: 'invno'},
            {text: 'Reg no.', value: 'regno'},
            {text: 'Name.', value: 'name'},
            {text: 'Invoice date.', value: 'idate'},
            {text: 'Invoice amount($)', value: 'amount'},
            {text: 'Balance due($)', value: 'ramount'},
            {text: 'Actions', value: 'actions'},
        ],
        frange: null,
        trange: null,
        phone: null,
        cid: null,
        name: null,
        svc: null,
        pnr: null,
        from: null,
        to: null,
        fmenu: false,
        tmenu: false,
        tramenu: false,
        tradate: null,
        fdate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        tdate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        vendor: null,
        country: null,
        attraction: null,
        pa: null,
        sa: null,
        services: ['Air tickets', 'Visa', 'Hotel booking', 'Inbound tour', 'Outbound tour'],
        vendorPayment: ['Paid online', 'Outstanding'],
        vps: null,
        snack: false,
        scolor: '',
        stext: '',
        itemEditing: false,
        invEditing: false,
        itemIdex: null,
        selectedInv: {},
        filtInvs: [],
    }),

    methods: {
        addInv() {
            this.$refs.addinv.open()
        },
        getName(cid) {
            return this.$store.getters.loadedCustomer(cid).name
        },
        getVname(vendor) {
            return this.$store.getters.loadedVendor(vendor).name
        },
        editInv(inv) {
            this.$refs.addinv.editInv(inv)
        },
        printInvoice(inv) {
           this.$refs.addinv.printInvoice(inv)
        },  

        toLocalDate(date) {
            return new Date(+date).toLocaleDateString('en-IN')
        },

        deleteInv(inv)  {
            this.selectedInv = inv
            this.delInvDialog = true
        },

        checkAmount(payments) {
            let tamount = 0
            for(let i in payments) {
                tamount = tamount + +payments[i].ramount
            }
            return tamount
        },

        vBalance(inv) {
            let pamount = 0
            let paid = 0
            let items = inv.items
            for(let i in items) {
                pamount = +pamount + +items[i].pa
                paid = +paid + +items[i].vps
            }  
            return +pamount - +paid
        },

        balAmount(payments, amount){
            let tamount = 0
            for(let i in payments) {
                tamount = tamount + +payments[i].ramount
            }
            return +amount - +tamount
        },

        addPayment(item) {
            this.addPaymentDialog = true
            this.selectedInv = item
        },

        addVendorPayment(item) {
            this.$refs.addvpay.open(item)
        },

        updatePayment() {
            let items = this.selectedInv.payments
            let payments = [
                ...items,
                {date: new Date(this.idate).getTime(), mop: this.mop, ramount: this.ramount}
            ]
            supabase.from('invoices').update({payments: payments}).match({id: this.selectedInv.id})
            .then(() => {
                this.$store.dispatch('getInvoices')
                this.$store.dispatch('createAlert',{type: 'info', message: 'Invoice updated'})
                this.clearPaydata()
            })
        },

        resetPayment(id) {
            let payments = [
                {date: new Date(this.idate).getTime(), mop: 'online', ramount: '0'}
            ]
            supabase.from('invoices').update({payments: payments}).match({id: id})
            .then(() => {
                this.$store.dispatch('getInvoices')
                this.$store.dispatch('createAlert',{type: 'info', message: 'Invoice updated'})
                this.clearPaydata()
            })
        },

        deleteInvoice() {
            supabase.from('invoices').update({isCanceled: true}).match({id: this.selectedInv.id})
            .then(() => {
                this.$store.dispatch('getInvoices')
                this.$store.dispatch('createAlert',{type: 'info', message: 'Invoice canceled'})
                this.delInvDialog = false
            })
        },

        clearPaydata() {
            this.addPaymentDialog = false
            this.idate = null
            this.mop = null
            this.ramount = null
        },
        dateFilters() {
            this.tmenu = false
            this.fmenu = false
            if(this.duration == 'Current month') {
                let date = new Date()
                let cmonth = date.getMonth()
                date.setDate(1)
                date.setHours(0,0,0,0)
                let nex = new Date()
                nex.setMonth(cmonth + 1)
                nex.setDate(1)
                nex.setHours(0,0,0,0)
                this.frange = date.getTime()
                this.trange = nex.getTime()
            }
            if(this.duration == 'Last 7 days') {
                let date = new Date()
                let fdate = new Date()
                let tdate = new Date()
                let cdate = date.getDate()
                fdate.setDate(cdate - 7)
                fdate.setHours(0,0,0,0)
                tdate.setDate(cdate + 1)
                tdate.setHours(0,0,0,0)
                this.frange = fdate.getTime()
                this.trange = tdate.getTime()
            }
            if(this.duration == 'Select range') {
                this.frange = new Date(this.fdate).getTime()
                let tdate = new Date(this.tdate)
                let day = new Date(this.tdate).getDate()
                tdate.setDate(day + 1)
                tdate.setHours(0,0,0,0)
                this.trange = tdate.getTime()
            }
            // const invs = this.invs
            // if(this.duration == 'All'){
            //     this.filtInvs = invs
            // } 
            // else {
            //     this.filtInvs = invs.filter((item) => {
            //         return item.idate >= this.frange  && item.idate < this.trange
            //     })
            // }
            // this.prepItems()
        },
        getRegno(cid) {
            return this.$store.getters.loadedCustomer(cid).regno
        },
        prepItems() {
            // let fitems = []
            // let items = this.filtInvs
            // for(let i in items) {
            //     let pnr = ''
            //     let passname = ''
            //     let cusname = this.getName(items[i].cid)
            //     let list = items[i].items
            //     for(let j in list) {
            //         if(list[j].pnr) {
            //             pnr = pnr + list[j].pnr + ' '
            //         }
            //         if(list[j].passname) {
            //             passname = passname + list[j].passname + ''
            //         }
            //     }
            //     fitems.push({
            //         ...items[i],
            //         pnr: pnr,
            //         cusname: cusname,
            //         passname: passname
            //     })
            // }
            this.fitems = this.filtInvs
        }
    },

    computed: {
        isAdmin() {
            return this.$store.getters.isAdmin
        },
        user() {
            return supabase.auth.user()
        },

        customers() {
            return this.$store.getters.loadedCustomers
        },

        vendors() {
            return this.$store.getters.loadedVendors
        },

        invs() {
            let invs = this.$store.getters.allLoadedInvoices
            return invs.filter((item) => {
                return item.isCanceled != true
            })
        },

        fitems() {
            const invs = this.invs
            let finv = []
            for(let i in invs) {
                if(+this.balAmount(invs[i].payments, invs[i].amount) != 0) {
                    finv.push({
                        regno: this.getRegno(invs[i].cid),
                        name: this.getName(invs[i].cid),
                        ...invs[i]
                    })
                }
            }
            return finv
        },

        amount() {
            let amount = 0
            let items = this.items
            for(let i in items) {
                amount = +amount + +items[i].sa
            }  
            return amount
        }
    },

    components: {
        AddInvoiceVue,
        AddVendorPaymentVue
    },

    mounted() {
        this.dateFilters()
    }
}
</script>