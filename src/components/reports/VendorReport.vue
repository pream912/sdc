<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <h2>Vendors report</h2>
            </v-col>
            <v-col cols="6">
                <v-menu
                    v-model="mmenu"
                    :close-on-content-click="true"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="auto"
                >
                    <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        v-model="mdate"
                        filled
                        label="Select month"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                    </template>
                    <v-date-picker @change="applyFilters" v-model="mdate" type="month" no-title></v-date-picker>
                </v-menu>
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
                    <template v-slot:[`item.actions`]="{ item }">
                        <v-btn @click="clearPayment(item)" x-small v-if="item.due > 0"  color="blue">Clear payment</v-btn>
                    </template>
                    <template v-slot:[`item.name`]="{ item }">
                        <a href="#" @click.prevent="getMoreData(item.vid)"> {{item.name}} </a>
                    </template> 
                </v-data-table>
            </v-col>
        </v-row>
        <v-row>
            <v-dialog v-model="pdialog" max-width="400">
                <v-card>
                    <v-card-title>Enter amount</v-card-title>
                    <v-card-text>
                        <v-text-field label="Amount" outlined v-model="payamount"></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn :loading="loading" @click="updatePayment" color="green">Update</v-btn>
                        <v-btn @click="clear" color="red">Cancel</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
        <v-row>
            <v-col v-if="items1.length > 0" cols="3">
                <v-text-field filled label="Search" v-model="search1" append-icon="mdi-magnify"></v-text-field>
            </v-col>
            <v-col v-if="items1.length > 0" cols="3">
                <v-btn small color="green" @click="JSONToCSVConvertor(items1, `vendorreport`)">Export data</v-btn>
                <v-btn class="ml-2" small color="green" @click="getPDF(items1)">Export PDF</v-btn>
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
import {supabase} from '../../supabase'
export default {
    data:() => ({
        pdialog: false,
        loading: false,
        headers: [
            {text: 'Vendor name', value: 'name'},
            {text: 'Amount($)', value: 'amount'},
            {text: 'Outstanding amount($)', value: 'due'},
            {text: 'Actions', value: 'actions'},
        ],
        headers1: [
            {text: 'Invoice No.', value: 'invno'},
            {text: 'Invoice date', value: 'invdate'},
            {text: 'Vendor name', value: 'vendorname'},
            {text: 'Passanger name', value: 'passname'},
            {text: 'PNR', value: 'pnr'},
            {text: 'Purchase amount($)', value: 'pa'},
        ],
        duraList: ['Current month', 'Last 7 days', 'Select range'],
        duration: 'Current month',
        filtInvs: [],
        payamount: null,
        fmenu: false,
        tmenu: false,
        mmenu: false,
        mdate: new Date().toISOString().substr(0, 7),
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
        vid: null,
        totalAmount: 0,
        outstanding: 0,
        sall: true,
        item: {}
    }),

    methods: {
        clear() {
            this.item = {}
            this.payamount = 0 
            this.pdialog = false
            this.loading = false
        },

        getPDF(dat) {
            var pdfMake = require('pdfmake/build/pdfmake.js')
            if (pdfMake.vfs == undefined){
                var pdfFonts = require('pdfmake/build/vfs_fonts.js')
                pdfMake.vfs = pdfFonts.pdfMake.vfs
            }
            let items = []
            items.push(
                [
                    {text: 'Invoice no.', alignment: 'center', bold: true, fontSize: 10}, 
                    {text: 'Invoice date', alignment: 'center', bold: true, fontSize: 10}, 
                    // {text: 'Vendor name', alignment: 'center', bold: true, fontSize: 10},
                    {text: 'Passenger name', alignment: 'center', bold: true, fontSize: 10},
                    {text: 'PNR', alignment: 'center', bold: true, fontSize: 10},
                    {text: 'Purchase amount($)', alignment: 'center', bold: true, fontSize: 10},
                ])

            for(let i in dat) {
                items.push([
                    {text: dat[i].invno, alignment: 'center', fontSize: 10}, 
                    {text: dat[i].invdate, alignment: 'center', fontSize: 10}, 
                    // {text: dat[i].vendorname, alignment: 'center', fontSize: 10}, 
                    {text: dat[i].passname, alignment: 'left', fontSize: 10}, 
                    {text: dat[i].pnr, alignment: 'center', fontSize: 10}, 
                    {text: dat[i].pa, alignment: 'center', fontSize: 10}, 
                ])
            }
            let content = [
                {
                    layout: 'noBorders',
                    table: {
                        widths: [100, '*'],
                        body: [
                            [{text: 'Duration:', fontSize: 10}, {text: this.mdate, fontSize: 10}],
                            [{text: 'Vendor name:', fontSize: 10}, {text: dat[0].vendorname, fontSize: 10}],
                            [{text: 'Total amount:', fontSize: 10}, {text: this.totalAmount, fontSize: 10}],
                            [{text: 'Outstanding amount:', fontSize: 10}, {text: this.outstanding, fontSize: 10}],
                        ]
                    }
                },
                {
                    layout: 'lightHorizontalLines',
                    style: 'tableStyle',
                    table: {
                        widths: [60, 60, 150, 60, 60],
                        headerRows: 1,
                        body: items
                    }
                },
            ]

            var docDefinition = { 
                content: content,
                styles: {
                    table: {
                        fontSize: 10
                    },
                    tableStyle: {
                        margin: 10
                    },
                    title: {
                        fontSize: 20, bold: true
                    },
                } 
            }

            pdfMake.createPdf(docDefinition).open()
        },

        async updatePayment () {
            this.loading = true
            const user = supabase.auth.user()
            const uid = user.id
            let item = this.item
            if(this.payamount <= item.due) {
                const { data, error } = await supabase.from('vpayments').select('*').eq('date', this.mdate).eq('vendor', item.vid)
                if(data.length > 0) {
                    console.log('updating');
                    console.log(this.mdate, item.vid, this.payamount);
                    supabase.from('vpayments').update({amount: +this.payamount + item.paiamount}).eq('id', item.id)
                    .then((res) => {
                        console.log(res.error);
                        console.log(res.data);
                        this.getData()
                        this.clear()
                    })
                } else {
                    console.log('inserting');
                    supabase.from('vpayments').insert([{
                        created_by: uid,
                        updated_by: uid,
                        amount: +this.payamount,
                        vendor: item.vid,
                        date: this.mdate
                    }])
                    .then((res) => {
                        console.log(res.error);
                        console.log(res.data);
                        this.getData()
                        this.clear()
                    })
                }
                if(error) {
                    this.$store.dispatch('createAlert',{type: 'error', message: error.message})
                    this.clear()
                }
            } else {
                this.$store.dispatch('createAlert',{type: 'error', message: 'Enter valid amount!!'})
                this.clear()
            }
        },
        async getData() {
            let vdata = []
            let invs = this.filtInvs
            let ven = this.vendors
            let vid = null
            for(let i in ven) {
                let id = null
                let paiamount = 0
                let tamount = 0
                let tpamount = 0
                vid = ven[i].id
                for(let j in invs){
                    let items = invs[j].items
                    tamount = +tamount + +this.venWisePurchase(items, vid)
                    tpamount = +tpamount + +this.venPayment(items, vid)
                }
                let due = +tamount - +tpamount
                
                if(due > 0) {
                    const { data, error } = await supabase.from('vpayments').select('*').eq('date', this.mdate).eq('vendor', vid)
                    if(error) {
                        this.$store.dispatch('createAlert',{type: 'error', message: error.message})
                    }
                    if(data.length > 0) {
                        due = +due - +data[0].amount
                        id = data[0].id
                        paiamount = +data[0].amount
                    }
                }
                vdata.push({
                    name: this.getVname(vid),
                    amount: Math.round(tamount * 100) / 100,
                    due: Math.round(due * 100) / 100,
                    vid: vid,
                    id: id,
                    paiamount: paiamount
                })
            }
            this.items = vdata
        },

        async getMoreData(vid) {
            let dat = []
            // let totalAmount = 0 
            // let outstanding = 0
            let invs = this.filtInvs
            for(let i in invs) {
                let items = invs[i].items
                for(let j in items) {
                    if(items[j].vendor == vid) {
                        dat.push({
                            invno: invs[i].id,
                            invdate: this.toLocalDate(invs[i].idate),
                            service: items[j].svc,
                            vendor: vid,
                            vendorname: this.getVname(vid),
                            pnr: items[j].pnr==undefined?'-':items[j].pnr,
                            passname: items[j].passname==undefined?'-':items[j].passname,
                            pa: items[j].pa,
                            vps: items[j].vps
                        })
                    }
                }
            }
            this.items1 = dat
            let tamount = this.venWisePurchase(dat, vid)
            let tpamount = +this.venPayment(dat, vid)
            let due = +tamount - +tpamount
            if(due > 0) {
                const { data, error } = await supabase.from('vpayments').select('*').eq('date', this.mdate).eq('vendor', vid)
                if(error) {
                    this.$store.dispatch('createAlert',{type: 'error', message: error.message})
                }
                if(data.length > 0) {
                    due = +due - +data[0].amount
                }
            }
            this.totalAmount = Math.round(tamount * 100) / 100
            this.outstanding = Math.round(due * 100) / 100
        },

        async clearPayment(item) {
            this.item = item
            this.pdialog = true
            //const { data, error } = await supabase.from('vpayments').update('*').eq('date', this.mdate).eq('vendor', vid)
        },

        getVname(vendor) {
            return this.$store.getters.loadedVendor(vendor).name
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

        venPayment(items, id) {
            let amount = 0
            for(let i in items) {
                if(items[i].vendor == id) {
                    amount = +amount + +items[i].vps
                }
            }
            return amount
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

            let date = new Date(this.mdate)
            let cmonth = date.getMonth()
            date.setDate(1)
            date.setHours(0,0,0,0)
            let nex = new Date()
            nex.setMonth(cmonth + 1)
            nex.setDate(1)
            nex.setHours(0,0,0,0)
            this.frange = date.getTime()
            this.trange = nex.getTime()

            const invs = this.invoices
            let invoices = []
            if(this.sall) {
                invoices = invs
            } else {
                invoices = invs.filter((item) => {
                    return item.createdby == this.uid
                })
            }
            
            this.filtInvs = invoices.filter((item) => {
                return item.idate >= this.frange  && item.idate < this.trange
            })
            this.getData()
        },
        JSONToCSVConvertor(JSONData, ReportTitle) {
            var ShowLabel = Object.keys(this.items[0])

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
        vendors() {
            return this.$store.getters.loadedVendors
        },
    },
    mounted() {
        this.applyFilters()
    }
}
</script>