<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <h2>Vendors report</h2>
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
                </v-data-table>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    data:() => ({
        headers: [
            {text: 'Vendor name', value: 'name'},
            {text: 'Amount($)', value: 'amount'},
            {text: 'Outstanding amount($)', value: 'due'},
        ],
        duraList: ['Current month', 'Last 7 days', 'Select range'],
        duration: 'Current month',
        filtInvs: [],
        fmenu: false,
        tmenu: false,
        fdate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        tdate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        frange: null,
        trange: null,
        tprofit: 0,
        items: [],
        search: '',
        uid: null,
        sall: true
    }),

    methods: {
        getData() {
            let vdata = []
            let invs = this.filtInvs
            let ven = this.vendors
            let vid = null
            for(let i in ven) {
                let tamount = 0
                let tpamount = 0
                vid = ven[i].id
                for(let j in invs){
                    let items = invs[j].items
                    tamount = +tamount + +this.venWisePurchase(items, vid)
                    tpamount = +tpamount + +this.venPayment(items, vid)
                }
                let due = +tamount - +tpamount
                vdata.push({
                    name: this.getVname(vid),
                    amount: Math.round(tamount * 100) / 100,
                    due: Math.round(due * 100) / 100
                })
            }
            this.items = vdata
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
            let vendors = this.$store.getters.loadedVendors
            let filtVen = vendors.filter((item) => {
                return item.deleted == false
            })
            return filtVen
        },
    },
    mounted() {
        this.applyFilters()
    }
}
</script>