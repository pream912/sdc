<template>
    <v-container>
        <v-row>
            <add-customer-vue ref="addcus"></add-customer-vue>
            <v-col cols="12">
                <v-dialog
                v-model="dialog"
                fullscreen
                hide-overlay
                transition="dialog-bottom-transition">
                    <v-card>
                        <v-dialog v-model="loading"  hide-overlay persistent width="300">
                            <v-card color="transparent">
                                <v-card-text>
                                    Loading...
                                    <v-progress-linear
                                    color="lime"
                                    indeterminate
                                    reverse
                                    ></v-progress-linear>
                                </v-card-text>
                            </v-card>
                        </v-dialog>
                        <v-toolbar>
                            <v-btn @click="clear" small icon>
                                <v-icon class="red--text">mdi-close</v-icon>
                            </v-btn>
                            {{vendor}}
                            <v-spacer></v-spacer>
                            <v-btn v-if="!invEditing" :loading="loading" color="green" @click="saveInv">Save</v-btn>
                            <v-btn v-else color="blue" :loading="loading" @click="updateInv">Update</v-btn>
                        </v-toolbar>
                        <v-card-text>
                            <v-row class="pa-3">
                                <v-col cols="5">
                                    <v-autocomplete v-on:keyup="keyEvent" outlined label="Customer name" item-value="id" v-model="cid" item-text="name" :items="customers">
                                        <template v-slot:item="data">
                                            <template>
                                                <v-list-item-content>
                                                    <v-list-item-title v-html="data.item.name"></v-list-item-title>
                                                    <v-list-item-subtitle v-html="data.item.regno"></v-list-item-subtitle>
                                                </v-list-item-content>
                                            </template>
                                        </template>
                                    </v-autocomplete>
                                </v-col>
                                <v-col cols="5">
                                    <v-autocomplete v-on:keyup="keyEvent" outlined label="Reg number" item-value="id" v-model="cid" item-text="regno" :items="customers">
                                        <template v-slot:item="data">
                                            <template>
                                                <v-list-item-content>
                                                    <v-list-item-title v-html="data.item.regno"></v-list-item-title>
                                                    <v-list-item-subtitle v-html="data.item.name"></v-list-item-subtitle>
                                                </v-list-item-content>
                                            </template>
                                        </template>
                                    </v-autocomplete>
                                </v-col>
                                <v-col cols="2">
                                    <v-btn @click="addCustomer" color="green">Add customer</v-btn>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="famount" readonly outlined label="Amount"></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field :rules="numRule" v-model="ramount" outlined label="Amount recieved"></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-select :items="paymentmodes" outlined v-model="mop" label="Mode of payment"></v-select>
                                </v-col>
                                <v-col cols="6">
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
                                        label="Invoice date"
                                        v-on="on"
                                        
                                        readonly
                                        ></v-text-field>
                                        </template>
                                        <v-date-picker @input="dmenu = false" v-model="idate"></v-date-picker>
                                    </v-menu>
                                </v-col>
                            </v-row>
                            <v-row lazy-validation class="pa-3">
                                <v-col cols="12">
                                    <v-btn @click="dialog1 = true" color="green">Add item</v-btn>
                                </v-col>
                                <v-col cols="12">
                                    <v-dialog v-model="dialog1" max-width="700">
                                        <v-card>
                                            <v-card-title>New Item</v-card-title>
                                            <v-card-text>
                                                <v-row>
                                                    <v-col cols="3">
                                                        <v-autocomplete @change="getRate" label="Service name" outlined item-value="id" v-model="sid" item-text="name" :items="services"></v-autocomplete>
                                                    </v-col>
                                                    <v-col cols="3">
                                                        <v-text-field outlined label="Description" v-model="description"></v-text-field>
                                                    </v-col>
                                                    <v-col cols="3">
                                                        <v-text-field  outlined label="Quantity" v-model="qt"></v-text-field>
                                                    </v-col>
                                                    <v-col cols="3">
                                                        <v-text-field outlined label="Rate" v-model="rate"></v-text-field>
                                                    </v-col>
                                                    <v-col cols="3">
                                                    </v-col>
                                                    <v-col cols="3">
                                                    </v-col>
                                                    <v-col cols="3">
                                                    </v-col>
                                                    <v-col cols="3">
                                                        <v-text-field readonly outlined label="Amount" v-model="amount"></v-text-field>
                                                    </v-col>
                                                </v-row>
                                            </v-card-text>
                                            <v-card-actions>
                                                <v-spacer></v-spacer>
                                                <v-btn v-if="itemEditing" @click="updateItem" color="green">Update</v-btn>
                                                <v-btn v-else @click="addItem" color="green">Ok</v-btn>
                                                <v-btn @click="clearItemData" color="red">Cancel</v-btn>
                                            </v-card-actions>
                                        </v-card>
                                    </v-dialog>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12">
                                    <v-data-table
                                    :headers="headers"
                                    :items="items">
                                        <template v-slot:[`item.vendor`]="{ item }">
                                            {{getVname(item.vendor)}}
                                        </template> 
                                        <template v-slot:[`item.actions`]="{ item }">
                                            <v-btn @click="editItem(item)" icon small>
                                                <v-icon
                                                    small
                                                    color="orange"
                                                    class="mr-2"
                                                >
                                                    mdi-pencil
                                                </v-icon>
                                            </v-btn>
                                            <v-btn @click="deleteItem(item)" icon small>
                                                <v-icon
                                                    small
                                                    color="red"
                                                    class="mr-2"
                                                >
                                                    mdi-delete
                                                </v-icon>
                                            </v-btn>
                                        </template>
                                    </v-data-table>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-spacer></v-spacer>
                                <v-col cols="4">
                                    <v-text-field readonly outlined label="Total amount" v-model="tamount"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-spacer></v-spacer>
                                <v-col cols="4">
                                    <v-text-field outlined label="Discount" v-model="discount"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-spacer></v-spacer>
                                <v-col v-if="discount" cols="4">
                                    <v-text-field outlined label="Final amount" v-model="famount"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-dialog>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import AddCustomerVue from '../customers/AddCustomer.vue'
import {supabase} from '../../supabase'
export default {
    data: () => ({
        loading: false,
        dialog: false,
        dialog1: false,
        id: null,
        ramount: null,
        dmenu: false,
        idate: null,
        itemValidate: true,
        reqRule: [v => !!v || 'This field is required'],
        numRule: [
            v => !!v || 'This field is required',
            v => /^\d+(\.\d{1,2})?$/.test(v) || 'Enter valid amount',
        ],
        paymentmodes: ['Cash', 'Online', 'Credit'],
        mop: null,
        items: [],
        headers: [
            {text: 'Service', value: 'name'},
            {text: 'Description', value: 'description'},
            {text: 'Quantity', value: 'qt'},
            {text: 'Rate', value: 'rate'},
            {text: 'Amount', value: 'amount'},
            {text: 'Actions', value: 'actions'},
        ],
        phone: null,
        cid: null,
        name: null,
        svc: null,
        pnr: null,
        passname: null,
        from: null,
        to: null,
        fmenu: false,
        tmenu: false,
        tramenu: false,
        tradate: null,
        remenu: false,
        redate: null,
        fdate: null,
        tdate: null,
        vendor: null,
        country: null,
        category: null,
        attraction: null,
        pa: null,
        sa: null,
        vendorPayment: ['Paid online', 'Outstanding'],
        vps: null,
        vrno: '',
        snack: false,
        scolor: '',
        stext: '',
        itemEditing: false,
        invEditing: false,
        itemIdex: null,
        selectedInv: {},
        sid: null,
        description: null,
        qt: 1,
        rate: null,
        discount: null,
    }),

    methods: {
        keyEvent(e) {
            if(e.ctrlKey && e.key == 'q') {
               this.addCustomer()
            }
        },  
        addCustomer() {
            this.$refs.addcus.open()
        },
        open() {
            this.dialog = true
        },
        getRate() {
            this.rate = this.$store.getters.loadedService(this.sid).price
        },
        getName(cid) {
            return this.$store.getters.loadedCustomer(cid).name
        },
        getSname(service) {
            return this.$store.getters.loadedService(service).name
        },
        editInv(inv) {
            let date = new Date(+inv.idate)
            this.invEditing = true
            this.id = inv.id
            this.dialog = true
            this.cid = inv.cid
            this.idate = date.toISOString().substr(0,10)
            this.ramount = this.checkAmount(inv.payments)
            this.discount = inv.discount
            this.items = inv.items
        },
        printInvoice(inv) {
            var pdfMake = require('pdfmake/build/pdfmake.js')
            if (pdfMake.vfs == undefined){
                var pdfFonts = require('pdfmake/build/vfs_fonts.js')
                pdfMake.vfs = pdfFonts.pdfMake.vfs
            }
            const logo = null

            let customer = this.$store.getters.loadedCustomer(inv.cid)

            let billContent = []
            billContent.push([{text: 'Sno.', alignment: 'center', fontSize: 10, bold: true}, {text: 'Particulars', fontSize: 10, alignment: 'left', bold: true}, {text: 'Amount($)', alignment: 'center', bold: true, fontSize: 10}])
            let items = inv.items
            let payments = inv.payments
            let tamount = 0
            let particulars = ''
            let bamount = 0
            for(let i in items) {
                if(items[i].svc == 'Air tickets') {
                    if(items[i].redate) {
                        particulars = `${items[i].svc} (${items[i].from} - ${items[i].to}) (Date: ${items[i].tradate}) (Return: ${items[i].redate}) (PNR: ${items[i].pnr}) (Name: ${items[i].passname})`
                    } else {
                        particulars = `${items[i].svc} (${items[i].from} - ${items[i].to}) (Date: ${items[i].tradate}) (PNR: ${items[i].pnr}) (Name: ${items[i].passname})`
                    }
                }
                if(items[i].svc == 'Bus tickets') {
                    if(items[i].redate) {
                        particulars = `${items[i].svc} (${items[i].from} - ${items[i].to}) (Date: ${items[i].tradate}) (Return: ${items[i].redate}) (PNR: ${items[i].pnr}) (Name: ${items[i].passname})`
                    } else {
                        particulars = `${items[i].svc} (${items[i].from} - ${items[i].to}) (Date: ${items[i].tradate}) (PNR: ${items[i].pnr}) (Name: ${items[i].passname})`
                    }
                }
                if(items[i].svc == 'Documents') {
                    particulars = `${items[i].svc} (${items[i].category})`
                }
                if(items[i].svc == 'Visa') {
                    particulars = `${items[i].svc} (${items[i].country}) (Name: ${items[i].passname})`
                }
                if(items[i].svc == 'Hotel booking') {
                    particulars = `${items[i].svc} (${items[i].fdate} to ${items[i].tdate})`
                } 
                if(items[i].svc == 'Inbound tour'){
                    particulars = `${items[i].svc} (${items[i].attraction})`
                }
                if(items[i].svc == 'Outbound tour'){
                    particulars = `${items[i].svc} (${items[i].country})`
                }
                billContent.push([{text: +i + 1, alignment: 'center', fontSize: 10}, {text: particulars, fontSize: 10, alignment: 'left'}, {text: items[i].sa, alignment: 'right', fontSize: 10}])
                tamount = +tamount + +items[i].sa
            }
            bamount = +tamount - +this.checkAmount(payments)
            billContent.push(
                [{},{text: 'Total amount(A):', alignment: 'right', fontSize: 10, bold: true}, {text: tamount, alignment: 'right', fontSize: 10, bold: true}],
                [{},{text: 'Amount recieved on', alignment: 'right', fontSize: 10, bold: true}, {}]
            )
            for(let i in payments) {
                if(+payments[i].ramount != 0) {
                    billContent.push([{},{text: payments[i].date, alignment: 'right', fontSize: 10}, {text: payments[i].ramount, alignment: 'right', fontSize: 10}])
                }
            }
            billContent.push([{},{text: 'Total amount recieved(B):', alignment: 'right', fontSize: 10, bold: true}, {text: this.checkAmount(payments), alignment: 'right', fontSize: 10, bold: true}],
            [{},{text: 'Balance amount (A - B)', alignment: 'right', fontSize: 10, bold: true}, {text: bamount, alignment: 'right', fontSize: 10, bold: true}])
            let content = [
                {
                    columns: [{width: 60, image: logo, fit: [150,150]},
                    {stack: [
                        'Thanjai Tours & Travels Pte ltd,',
                        'No. 84 Dunlop Street,',
                        'Singapore 209411.',
                        'Tel: 63415565',
                        'WhatsApp: 86565786',
                        'Email: info@thanjaitours.com',
                        'TA No.: 02122'
                    ], alignment: 'right', fontSize:10
                    },]
                },
                {
                    canvas: [ { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 } ]
                },
                {
                    columns: [{width: '100%', text: 'INVOICE', bold: true, alignment: 'center', margin: 5}]
                },
                {
                    layout: 'noBorders',
                    table: {
                        widths: [100, '*'],
                        body: [
                            [{text: 'Customer name:', fontSize: 10}, {text: customer.name, fontSize: 10}],
                            [{text: 'Address', fontSize: 10}, {text: customer.address, fontSize: 10}],
                            [{text: 'Phone', fontSize: 10}, {text: customer.phone, fontSize: 10}],
                            [{text: 'Invoice No.:', fontSize: 10}, {text: `0000${inv.id}`, fontSize: 10}],
                            [{text: 'Invoice date:', fontSize: 10}, {text: this.toLocalDate(inv.idate), fontSize: 10}]
                        ]
                    }
                },
                {
                    layout: 'lightHorizontalLines',
                    style: 'tableStyle',
                    table: {
                        widths: [40, '*', 100],
                        headerRows: 1,
                        body: billContent
                    }
                },
                {
                    canvas: [ { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 } ]
                },
                {
                    columns: [{
                        stack: [
                            'Terms & conditions:',
                            'CHEQUE TO BE CROSSED & MAKE PAYABLE TO THANJAI TOURS & TRAVELS PTE LTD',
                            'This is a computer generated invoice, no signature is required'
                        ], margin: 20, fontSize:10
                    }]
                },
                {
                    columns: [{
                        stack: [
                            'Bank Account Details:',
                            'Thanjai Tours & Travels Pte Ltd',
                            'Ocbc Current Account: 521-881-789-001',
                            'DBS current Account: 011-904-546-9',
                            'Paynow: UEN 201105122K'
                        ], margin: 20, fontSize:10
                    }]
                }
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

        addItem() {
            const item = {
                name: this.getSname(this.sid),
                sid: this.sid,
                description: this.description,
                qt: this.qt,
                rate: this.rate,
                amount: this.amount,
            }
            if(this.itemValidate) {
                this.items.push(item)
                this.clearItemData()
            } else {
                this.snack = true
                this.scolor = 'error'
                this.stext = 'All fields are required'
            }
        },

        editItem(item) {
            this.itemIdex = this.items.indexOf(item)
            this.sid = item.sid
            this.qt = item.qt
            this.description = item.description
            this.rate = item.rate
            this.itemEditing = true
            this.dialog1 = true
        },

        updateItem() {
            this.items.splice(this.itemIdex, 1)
            const item = {
                name: this.getSname(this.sid),
                sid: this.sid,
                description: this.description,
                qt: this.qt,
                rate: this.rate,
                amount: this.amount,
            }
            if(this.itemValidate) {
                this.items.push(item)
                this.clearItemData()
            } else {
                this.snack = true
                this.scolor = 'error'
                this.stext = 'All fields are required'
            }
        },

        deleteItem(item) {
            let index = this.items.indexOf(item)
            this.items.splice(index, 1)
        },

        clearItemData() {
            this.sid = null
            this.qt = 1
            this.description = null
            this.rate = null
            this.itemEditing = false
            this.itemIdex = null
            this.dialog1 = false
        },

        async saveInv() {
            this.loading = true
            const payment = [{
                date: this.idate,
                mop: this.mop,
                ramount: this.ramount
            }]
            const inv = {
                cid: this.cid,
                idate: new Date(this.idate).getTime(),
                amount: this.famount,
                createdby: this.user.id,
                payments: payment,
                discount: this.discount,
                items: this.items
            }
            const { data, error } = await supabase.from('invoices').insert([
                inv
            ])
            if(data.length > 0) {
                this.printInvoice(data[0])
                this.clear()
                this.$store.dispatch('createAlert',{type: 'success', message: 'Invoice created'})
            }
            if(error) {
                this.$store.dispatch('createAlert',{type: 'error', message: error.message})
                console.log(error);
                this.clear()
            }
            // .then((res) => {
            //     if(res.data) {
            //         this.printInvoice(res.data[0])
            //         this.clear()
            //         this.$store.dispatch('createAlert',{type: 'success', message: 'Invoice created'})
            //     }
            //     if(res.error) {
            //         this.$store.dispatch('createAlert',{type: 'error', message: res.error.message})
            //     }
            // })
        },

        updateInv() {
            const inv = {
                cid: this.cid,
                idate: new Date(this.idate).getTime(),
                amount: this.amount,
                updatedBy: this.user.id,
                items: this.items
            }
            supabase.from('invoices').update(inv).eq('id', this.id)
            .then((res) => {
                if(res.data) {
                    this.$store.dispatch('createAlert',{type: 'info', message: 'Invoice updated!'})
                    this.$store.dispatch('getInvoices')
                    this.clear()
                }
                if(res.error) {
                    this.$store.dispatch('createAlert',{type: 'error', message: res.error.message})
                }
            })
        },

        toLocalDate(date) {
            return new Date(+date).toLocaleDateString('en-IN')
        },

        checkAmount(payments) {
            let tamount = 0
            for(let i in payments) {
                tamount = tamount + +payments[i].ramount
            }
            return tamount
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

        updatePayment() {
            let items = this.selectedInv.payments
            let payments = [
                ...items,
                {date: this.idate, mop: this.mop, ramount: this.ramount}
            ]
            supabase.from('invoices').update({payments: payments}).match({id: this.selectedInv.id})
            .then(() => {
                this.$store.dispatch('getInvoices')
                this.clearPaydata()
            })
        },

        clearPaydata() {
            this.addPaymentDialog = false
            this.idate = null
            this.mop = null
            this.ramount = null
        },

        clear() {
            this.loading = false
            this.invEditing = false
            this.dialog = false
            this.dialog1 = false
            this.addPaymentDialog = false
            this.ramount = null
            this.dmenu = false
            this.idate = null
            this.itemValidate = true
            this.mop = null
            this.items = []
            this.phone = null
            this.cid = null
            this.name = null
            this.svc = null
            this.pnr = null
            this.from = null
            this.to = null
            this.fmenu = false
            this.tmenu = false
            this.tramenu = false
            this.tradate = null
            this.redate = null
            this.fdate = null
            this.tdate = null
            this.vendor = null
            this.country = null
            this.attraction = null
            this.pa = null
            this.sa = null
            this.vps = null
            this.snack = false
            this.itemEditing = false
            this.itemIdex = null
            this.selectedInv = {}
        }
    },

    computed: {
        alert () {
            return this.$store.getters.loadedAlert
        },

        amount () {
            return +this.qt * +this.rate
        },
        
        invs() {
            return this.$store.getters.loadedInvoices
        },

        user() {
            return supabase.auth.user()
        },

        customers() {
            let customers = this.$store.getters.loadedCustomers
            let filtCus = customers.filter((item) => {
                return item.deleted == false
            })
            return filtCus
        },

        services() {
            let services = this.$store.getters.loadedServices
            let filtSer = services.filter((item) => {
                return item.deleted == false
            })
            return filtSer
        },

        tamount() {
            let amount = 0
            let items = this.items
            for(let i in items) {
                amount = +amount + +items[i].amount
            }  
            return amount
        },

        famount() {
            return +this.tamount - +this.discount
        }
    },

    components: {
        AddCustomerVue
    }
}
</script>