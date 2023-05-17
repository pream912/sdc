<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <h2>Customers report</h2>
            </v-col>
            <v-col cols="6">
                <v-autocomplete :disabled="sall" @change="applyFilters" label="Select staff" :items="users" v-model="uid" item-value="uid" item-text="name" ></v-autocomplete>
            </v-col>
            <v-col cols="6"><v-checkbox label="Select all" @change="applyFilters" v-model="sall"></v-checkbox></v-col>
            <v-col cols="4">
                <v-select @change="applyFilters" value="Current month" filled label="Duration" v-model="duration" :items="duraList"></v-select>
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
                    <v-date-picker @change="applyFilters" v-model="fdate"></v-date-picker>
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
                    <v-date-picker @change="applyFilters" v-model="tdate"></v-date-picker>
                </v-menu>
            </v-col>
            <v-col cols="4"></v-col>
        </v-row>
        <v-row>
            <v-col cols="4">
                <v-text-field filled label="Search" v-model="search" append-icon="mdi-magnify"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-data-table
                :headers="headers"
                :search="search"
                :items="items">
                    <template v-slot:[`item.name`]="{ item }">
                        <a href="#" @click.prevent="getMoreData(item.cid)"> {{item.name}} </a>
                    </template> 
                </v-data-table>
            </v-col>
        </v-row>
        <v-row class="ma-10">
            <v-divider></v-divider>
        </v-row>
        <v-row>
            <v-col v-if="items1.length > 0" cols="3">
                <v-text-field filled label="Search" v-model="search1" append-icon="mdi-magnify"></v-text-field>
            </v-col>
            <v-col v-if="items1.length > 0" cols="3">
                <v-btn small color="green" @click="JSONToCSVConvertor(items1, `customereport`)">Export data</v-btn>
            </v-col>
            <v-col v-if="items1.length > 0" cols="3">
                <v-card elevation="5">
                    <v-card-text>
                        <v-row align-content="center" justify="center">
                            <v-col cols="12">
                                <h3>Total amount</h3>
                            </v-col>
                            <v-col cols="12">
                                <h1 class="green--text">${{totalAmount}}</h1>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col v-if="items1.length > 0" cols="3">
                <v-card elevation="5">
                    <v-card-text>
                        <v-row align-content="center" justify="center">
                            <v-col cols="12">
                                <h3>Outstanding balance</h3>
                            </v-col>
                            <v-col cols="12">
                                <h1 class="red--text">${{outstanding}}</h1>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col v-if="items1.length > 0" cols="12">
                <v-data-table
                :headers="headers1"
                :search="search1"
                :items="items1">
                </v-data-table>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    data: () => ({
        headers: [
            {text: 'Customer name', value: 'name'},
            {text: 'Sale($)', value: 'amount'},
            {text: 'Outstanding amount($)', value: 'pamount'}
        ],
        totalAmount: 0,
        outstanding: 0,
        headers1: [
            {text: 'Invoice No.', value: 'invno'},
            {text: 'Invoice date', value: 'invdate'},
            {text: 'Customer name', value: 'cusname'},
            {text: 'Passanger name', value: 'passname'},
            {text: 'PNR', value: 'pnr'},
            {text: 'Invoice amount($)', value: 'amount'},
            {text: 'Outstanding amount($)', value: 'balance'},
        ],
        duraList: ['Current month', 'Last 7 days', 'All', 'Select range'],
        duration: 'Current month',
        filtInvs: [],
        cid: null,
        fmenu: false,
        tmenu: false,
        fdate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        tdate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        frange: null,
        trange: null,
        tprofit: 0,
        items: [],
        items1: [],
        search: '',
        search1: '',
        uid: null,
        sall: true
    }),

    methods: {
        getData() {
            let cdata = []
            let invs = this.filtInvs
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
                    cid: cid,
                    name: this.getName(cid),
                    amount: tamount,
                    pamount: pendingamount
                })
            }
            this.items = cdata
        },

        getMoreData(cid) {
            let dat = []
            let totalAmount = 0
            let totalBalance = 0
            let invs = this.filtInvs.filter((item) => {
                return item.cid == cid
            })
            for(let i in invs) {
                let pnr = ''
                let passname = ''
                let list = invs[i].items
                let balance = +invs[i].amount - +this.checkAmount(invs[i].payments)
                totalAmount = +totalAmount + +invs[i].amount
                totalBalance = +totalBalance + balance

                for(let j in list) {
                    if(list[j].pnr) {
                        pnr = pnr + list[j].pnr + ' '
                    }
                    if(list[j].passname) {
                        passname = passname + list[j].passname + ''
                    }
                }
                dat.push({
                    invno: invs[i].id,
                    invdate: this.toLocalDate(invs[i].idate),
                    cusname: this.$store.getters.loadedCustomer(invs[i].cid).name,
                    passname: passname,
                    pnr: pnr,
                    amount: invs[i].amount,
                    balance: balance
                })
            }
            this.items1 = dat
            this.totalAmount = totalAmount
            this.outstanding = totalBalance
        },

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

        toLocalDate(date) {
            return new Date(+date).toLocaleDateString('en-IN')
        },

        getName(cid) {
            return this.$store.getters.loadedCustomer(cid).name
        },

        staffSelected() {
            this.invoices = this.loadedInv.filter((item) => {
                return item.createdby == this.uid
            })
        },

        applyFilters() {
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
            let invoices = []
            if(this.sall) {
                invoices = invs
            } else {
                invoices = invs.filter((item) => {
                    return item.createdby == this.uid
                })
            }
            if(this.duration == 'All') {
                this.filtInvs = invoices
            }
            else {
                this.filtInvs = invoices.filter((item) => {
                    return item.idate >= this.frange  && item.idate < this.trange
                })
            }      
            this.getData()
        },
        JSONToCSVConvertor(JSONData, ReportTitle) {
            var ShowLabel = Object.keys(this.items1[0])

            //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
            var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
            var CSV = '';
            //This condition will generate the Label/Header
            if (ShowLabel) {
                var row = "";

                //This loop will extract the label from 1st index of on array
                for (var index in arrData[0]) {
                    //Now convert each value to string and comma-seprated
                    row += index + ',';
                }
                row = row.slice(0, -1);
                //append Label row with line break
                CSV += row + '\r\n';
            }

            //1st loop is to extract each row
            for (var i = 0; i < arrData.length; i++) {
                row = "";
                //2nd loop will extract each column and convert it in string comma-seprated
                for (index in arrData[i]) {
                    row += '"' + arrData[i][index] + '",';
                }
                row.slice(0, row.length - 1);
                //add a line break after each row
                CSV += row + '\r\n';
            }

            if (CSV == '') {
                alert("Invalid data");
                return;
            }

            //this trick will generate a temp "a" tag
            var link = document.createElement("a");
            link.id = "lnkDwnldLnk";

            //this part will append the anchor tag and remove it after automatic click
            document.body.appendChild(link);

            var csv = CSV;
            //var blob = new Blob([csv], { type: 'text/csv' });
            //var csvUrl = window.webkitURL.createObjectURL(blob);
            var filename =  (ReportTitle || 'UserExport') + '.csv';
            link.setAttribute('href', 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURIComponent(csv));
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    },
    computed: {
        invoices() {
            return this.$store.getters.loadedInvoices
        },
        users() {
            return this.$store.getters.loadedUsers
        },
        customers() {
            let customers = this.$store.getters.loadedCustomers
            let filtCus = customers.filter((item) => {
                return item.deleted == false
            })
            return filtCus
        },
    },
    mounted() {
        this.applyFilters()
    }
}
</script>