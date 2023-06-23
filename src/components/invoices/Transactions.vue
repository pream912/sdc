<template>
    <v-container>
        <v-row>
            <v-col cols="4">
                <v-select @change="dateFilters" value="Current month" filled label="Duration" v-model="duration" :items="duraList"></v-select>
            </v-col>
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
            <v-col cols="4">
                <v-card elevation="5">
                    <v-card-text>
                        <v-row>
                            <v-col cols="12">
                                <h3>Payments recieved</h3>
                            </v-col>
                            <v-col cols="12">
                                <h1 class="green--text">₹{{ decimalRound(totalRecieved) }}</h1>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-data-table
                :headers="invheader"
                :search="search"
                :items="filtInvs">
                    <template v-slot:[`item.date`]="{ item }">
                        {{toLocalDate(item.date)}}
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
    </v-container>
</template>

<script>
import {supabase} from '../../supabase'
export default {
    data: () => ({
        duraList: ['Current month', 'Last 7 days', 'All', 'Select range'],
        dialog: false,
        duration: 'Select range',
        delInvDialog: false,
        search: null,
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
            {text: 'Reg no.', value: 'regno', filterable: true},
            {text: 'Name.', value: 'cname'},
            {text: 'Receipt date.', value: 'date'},
            {text: 'Amount', value: 'ramount', filterable: false},
            {text: 'Mode of payment', value: 'mop', filterable: false},
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
            let pays = []
            const invs = this.invs
            for(let i in invs) {
                let trans = invs[i].payments
                for(let j in trans) {
                    pays.push({
                        invno: invs[i].invno,
                        cname: this.getName(invs[i].cid),
                        regno: this.getRegno(invs[i].cid),
                        ...trans[j]
                    })
                }
            }
            pays.sort((a,b) => a.date-b.date)
            
            if(this.duration == 'All'){
                this.filtInvs = pays
            } 
            else {
                this.filtInvs = pays.filter((item) => {
                    return item.date >= this.frange  && item.date < this.trange
                })
            }
        },
        getRegno(cid) {
            return this.$store.getters.loadedCustomer(cid).regno
        },

        decimalRound(n) {
            let round = Math.round((n + Number.EPSILON) * 100) / 100
            let num = round.toFixed(2)
            let x = num.toString();
            let deciPoints = x.substring(x.length - 3);
            let woDeciPoints = x.substring(0, x.length - 3);
            let lastThree = woDeciPoints.substring(woDeciPoints.length - 3);
            let otherNumbers = woDeciPoints.substring(0, woDeciPoints.length - 3);
            if (otherNumbers != '')
                lastThree = ',' + lastThree;
            let res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + deciPoints
            return res
        },
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

        totalRecieved() {
            let invs = this.filtInvs 
            let total = 0
            for(let i in invs) {
                total = +total + +invs[i].ramount
            }
            return +total
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

    mounted() {
        this.dateFilters()
    }
}
</script>