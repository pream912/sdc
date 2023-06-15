<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <h2>Dashboard</h2>
            </v-col>
            <v-col cols="4">
                <v-select @change="dateFilters" value="Current month" filled label="Duration" v-model="duration" :items="duraList"></v-select>
            </v-col>
            <v-col cols="4"></v-col>
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
        <v-row v-if="totalSales == 0" align="center" justify="center">
            <v-col cols="12">
                <v-progress-circular
                indeterminate
                color="green"
                ></v-progress-circular>
            </v-col>
        </v-row>
        <v-row v-else>
            <v-col cols="4">
                <v-card elevation="5">
                    <v-card-text>
                        <v-row align-content="center" justify="center">
                            <v-col cols="12">
                                <h3>Total Invoice</h3>
                            </v-col>
                            <v-col cols="12">
                                <h1 class="green--text">  {{ filtInvs.length }}  </h1>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="4">
                <v-card elevation="5">
                    <v-card-text>
                        <v-row align-content="center" justify="center">
                            <v-col cols="12">
                                <h3>Total Income</h3>
                            </v-col>
                            <v-col cols="12">
                                <h1 class="green--text">₹{{ decimalRound(totalSales) }}</h1>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="4">
                <v-card elevation="5">
                    <v-card-text>
                        <v-row align-content="center" justify="center">
                            <v-col cols="12">
                                <h3>Amount Recieved</h3>
                            </v-col>
                            <v-col cols="12">
                                <h1 class="green--text">₹{{ decimalRound(recievedPayment) }}</h1>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="4">
                <v-card elevation="5">
                    <v-card-text>
                        <v-row>
                            <v-col cols="12">
                                <h3>Pending payments</h3>
                            </v-col>
                            <v-col cols="12">
                                <h1 class="red--text">₹{{ decimalRound(pendingAmount) }}</h1>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="4">
                <v-text-field filled label="Search" v-model="search" append-icon="mdi-magnify"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-data-table
                :headers="invheader"
                :search="search"
                :items="fitems">
                    <template v-slot:[`item.idate`]="{ item }">
                        {{toLocalDate(item.idate)}}
                    </template>
                    <template v-slot:[`item.regno`]="{ item }">
                        {{getRegno(item.cid)}}
                    </template>
                    <template v-slot:[`item.name`]="{ item }">
                        {{getName(item.cid)}}
                    </template>
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
                        <!-- <v-btn small v-if="isAdmin" icon @click="editInv(item)">
                            <v-icon color="orange">mdi-pencil</v-icon>
                        </v-btn> -->
                        <!-- <v-btn small v-if="isAdmin" icon @click="resetPayment(item.id)">
                            <v-icon color="orange">mdi-currency-usd-off</v-icon>
                        </v-btn> -->
                        <!-- <v-btn small icon v-if="!item.isCanceled">
                            <v-icon @click="deleteInv(item)" color="red">mdi-delete</v-icon>
                        </v-btn> -->
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
            <add-invoice-vue ref="addinv"></add-invoice-vue>
        </v-row>
    </v-container>
</template>

<script>
import AddInvoiceVue from './invoices/AddInvoice.vue'
import {supabase} from '../supabase'
export default {
    data: () => ({
        date: new Date().toISOString().substr(0, 7),
        invheader: [
            {text: 'Invoice no.', value: 'invno'},
            {text: 'Reg no.', value: 'regno'},
            {text: 'Name', value: 'name'},
            {text: 'Invoice date.', value: 'idate'},
            {text: 'Invoice amount($)', value: 'amount'},
            {text: 'Balance due($)', value: 'ramount'},
            {text: 'Actions', value: 'actions'},
        ],
        search: '',
        menu: false,
        modal: false,
        duraList: ['Current month', 'Last 7 days', 'All', 'Select range'],
        duration: 'Current month',
        fmenu: false,
        tmenu: false,
        fdate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        tdate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        frange: null,
        trange: null,
        addPaymentDialog: false,
        ramount: null,
        dmenu: false,
        idate: null,
        selectedInv: null,
        paymentmodes: ['Bank Transfer', 'Cash', 'Cheque', 'Credit Card', 'Debit Card', 'G-Pay', 'Paytm', 'PhonePe'],
        mop: null,
    }),

    methods: {

        toLocalDate(date) {
            return new Date(+date).toLocaleDateString('en-IN')
        },

        getRegno(cid) {
            return this.$store.getters.loadedCustomer(cid).regno
        },

        getName(cid) {
            return this.$store.getters.loadedCustomer(cid).name
        },

        balAmount(payments, amount){
            let tamount = 0
            for(let i in payments) {
                tamount = tamount + +payments[i].ramount
            }
            return +amount - +tamount
        },

        printInvoice(inv) {
           this.$refs.addinv.printInvoice(inv)
        },

        amount(items) {
            let amount = 0
            for(let i in items) {
                amount = +amount + +items[i].amount
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

        addPayment(item) {
            this.addPaymentDialog = true
            this.selectedInv = item
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

        clearPaydata() {
            this.addPaymentDialog = false
            this.idate = null
            this.mop = null
            this.ramount = null
        },
    },

    computed: {
        invoices() {
            let invs = this.$store.getters.allLoadedInvoices
            return invs.filter((item) => {
                return item.isCanceled != true
            })
        },

        filtInvs() {
            let invs = this.invoices
            if(this.duration == 'All') {
                return invs
            }
            else {
                return invs.filter((item) => {
                    return item.idate >= this.frange  && item.idate < this.trange
                })
            }
        },

        totalSales() {
            let inv = this.filtInvs
            if(this.filtInvs) {
                let tsale = 0 
                for(let i in inv) {
                    tsale = +tsale + +this.amount(inv[i].items)
                }
                return tsale
            }else return 0
        },

        totalPurchase() {
            let inv = this.filtInvs
            if(this.filtInvs) {
                let tpurchase = 0 
                for(let i in inv) {
                    tpurchase = +tpurchase + +this.checkPurchase(inv[i].items)
                }
                return Math.round(tpurchase * 100) / 100
            }else return 0
        },

        pendingAmount() {
            let inv = this.filtInvs
            var tsale = 0
            let payments = 0
            if(this.filtInvs) {
                for(let i in inv) {
                    tsale = +tsale + +this.amount(inv[i].items)
                    payments = +payments + +this.checkAmount(inv[i].payments)
                }
                return +tsale - +payments
            } else return 0
        },

        recievedPayment () {
            let inv = this.filtInvs
            let payments = 0
            if(this.filtInvs) {
                for(let i in inv) {
                    payments = +payments + +this.checkAmount(inv[i].payments)
                }
                return +payments
            } else return 0
        },

        profit() {
            let sale = this.totalSales
            let purchase = this.totalPurchase
            let profit = +sale - +purchase
            return Math.round(profit * 100) / 100
        },

        margin() {
            let sale = this.totalSales
            let purchase = this.totalPurchase
            let profit = +sale - +purchase
            let margin = (+profit / +purchase) * 100
            return Math.round(margin * 100) / 100
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
            if(this.duration == 'All'){
                return invs
            } 
            else {
                return invs.filter((item) => {
                    return item.idate >= this.frange  && item.idate < this.trange
                })
            }
        },

        // amount() {
        //     let amount = 0
        //     let items = this.items
        //     for(let i in items) {
        //         amount = +amount + +items[i].sa
        //     }  
        //     return amount
        // }
    },

    components: {
        AddInvoiceVue,
    },

    mounted() {
        this.dateFilters()
    }
}
</script>