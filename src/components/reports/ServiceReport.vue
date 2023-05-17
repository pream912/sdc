<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <h2>Report</h2>
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
            <v-col cols="4">
                <v-btn v-if="items.length > 0" small color="green" @click="JSONToCSVConvertor(items, `invreports`)">Export data</v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-data-table
                :headers="headers"
                :search="search"
                :items="items">
                    <template v-slot:[`item.tpurchase`]="{ item }">
                        {{ Math.round(item.tpurchase * 100) / 100 }}
                    </template> 
                    <template v-slot:[`item.tprofit`]="{ item }">
                        {{ Math.round(item.tprofit * 100) / 100 }}
                    </template> 
                    <template v-slot:[`item.tmargin`]="{ item }">
                        {{ Math.round(item.tmargin * 100) / 100 }}
                    </template> 
                </v-data-table>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    data: () => ({
        headers: [
            {text: 'Service', value: 'service'},
            {text: 'Purchase amount($)', value: 'tpurchase'},
            {text: 'Sale amount($)', value: 'tsale'},
            {text: 'Profit($)', value: 'tprofit'},
            {text: 'Margin(%)', value: 'tmargin'},
        ],
        duraList: ['Current month', 'Last 7 days', 'All', 'Select range'],
        duration: 'Current month',
        filtInvs: [],
        fmenu: false,
        tmenu: false,
        fdate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        tdate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
        frange: null,
        trange: null,
        items: [],
        search: '',
        uid: null,
        sall: true
    }),
    methods: {
        getData() {
            let items = this.filtInvs
            let atitems = []
            let btitems = []
            let docitems = []
            let visaitems = []
            let hbitems = []
            let obtitems = []
            let ibtitems = []

            let pitems = []

            for(let i in items) {
                let list = items[i].items
                for(let j in list) {
                    if(list[j].svc == 'Air tickets') {
                        atitems.push(list[j])
                    }
                    if(list[j].svc == 'Bus tickets') {
                        btitems.push(list[j])
                    }
                    if(list[j].svc == 'Documents') {
                        docitems.push(list[j])
                    }
                    if(list[j].svc == 'Visa') {
                        visaitems.push(list[j])
                    }
                    if(list[j].svc == 'Hotel booking') {
                        hbitems.push(list[j])
                    }
                    if(list[j].svc == 'Inbound tour') {
                        ibtitems.push(list[j])
                    }
                    if(list[j].svc == 'Outbound tour') {
                        obtitems.push(list[j])
                    }
                }
            }
            let atprofit = +this.sales(atitems) - +this.purchases(atitems)
            let btprofit = +this.sales(btitems) - +this.purchases(btitems)
            let docprofit = +this.sales(docitems) - +this.purchases(docitems)
            let visaprofit = +this.sales(visaitems) - +this.purchases(visaitems)
            let hbprofit = +this.sales(hbitems) - +this.purchases(hbitems)
            let ibprofit = +this.sales(ibtitems) - +this.purchases(ibtitems)
            let obtprofit = +this.sales(obtitems) - +this.purchases(obtitems)

            pitems.push({
                service: 'Air tickets',
                tsale: this.sales(atitems),
                tpurchase: this.purchases(atitems),
                tprofit: +this.sales(atitems) - +this.purchases(atitems),
                tmargin: this.purchases(atitems) != 0 ? (+atprofit / +this.purchases(atitems)) * 100 : 0
            })

            pitems.push({
                service: 'Bus tickets',
                tsale: this.sales(btitems),
                tpurchase: this.purchases(btitems),
                tprofit: +this.sales(btitems) - +this.purchases(btitems),
                tmargin: this.purchases(btitems) != 0 ? (+btprofit / +this.purchases(btitems)) * 100 : 0
            })

            pitems.push({
                service: 'Visa',
                tsale: this.sales(visaitems),
                tpurchase: this.purchases(visaitems),
                tprofit: +this.sales(visaitems) - +this.purchases(visaitems),
                tmargin: this.purchases(visaitems) != 0 ? (+visaprofit / +this.purchases(visaitems)) * 100 : 0
            })

            pitems.push({
                service: 'Documents',
                tsale: this.sales(docitems),
                tpurchase: this.purchases(docitems),
                tprofit: +this.sales(docitems) - +this.purchases(docitems),
                tmargin: this.purchases(docitems) != 0 ? (+docprofit / +this.purchases(docitems)) * 100 : 0
            })

            pitems.push({
                service: 'Hotel booking',
                tsale: this.sales(hbitems),
                tpurchase: this.purchases(hbitems),
                tprofit: +this.sales(hbitems) - +this.purchases(hbitems),
                tmargin: this.purchases(hbitems) != 0 ? (+hbprofit / +this.purchases(hbitems)) * 100 : 0
            })

            pitems.push({
                service: 'Inbound tour',
                tsale: this.sales(ibtitems),
                tpurchase: this.purchases(ibtitems),
                tprofit: +this.sales(ibtitems) - +this.purchases(ibtitems),
                tmargin: this.purchases(ibtitems) != 0 ? (+ibprofit / +this.purchases(ibtitems)) * 100 : 0
            })

            pitems.push({
                service: 'Outbound tour',
                tsale: this.sales(obtitems),
                tpurchase: this.purchases(obtitems),
                tprofit: +this.sales(obtitems) - +this.purchases(obtitems),
                tmargin: this.purchases(obtitems) != 0 ? (+obtprofit / +this.purchases(obtitems)) * 100 : 0
            })


            this.items = pitems
        },

        purchases(items) {
            let pamount = 0
            for(let i in items) {
                pamount = +pamount + +items[i].pa
            }  
            return +pamount 
        },

        sales(items) {
            let amount = 0
            for(let i in items) {
                amount = +amount + +items[i].sa
            }  
            return +amount 
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
    },

    mounted() {
        this.applyFilters()
    }
}
</script>