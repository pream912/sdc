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
    </v-container>
</template>

<script>
export default {
    data: () => ({
        date: new Date().toISOString().substr(0, 7),
        menu: false,
        modal: false,
        duraList: ['Current month', 'Last 7 days', 'All', 'Select range'],
        duration: 'Current month',
        filtInvs: [],
        fmenu: false,
        tmenu: false,
        fdate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        tdate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        frange: null,
        trange: null,
    }),

    methods: {
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
            const invs = this.invoices
            if(invs.length == 0) {
                setInterval(() => {
                    this.dateFilters()
                }, 1000)
            } 
            else {
                if(this.duration == 'All') {
                    this.filtInvs = invs
                }
                else {
                    this.filtInvs = invs.filter((item) => {
                        return item.idate >= this.frange  && item.idate < this.trange
                    })
                }
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
    },

    computed: {
        invoices() {
            return this.$store.getters.loadedInvoices
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
        }
    },

    mounted() {
        this.dateFilters()
    }
}
</script>