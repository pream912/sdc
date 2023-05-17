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
        search: '',
        uid: null,
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

        async clearPayment(item) {
            this.item = item
            this.pdialog = true
            console.log(item);
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