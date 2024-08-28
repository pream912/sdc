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
                            <v-btn v-if="!invEditing" :loading="loading" color="green" @click="presDialog = true">Save</v-btn>
                            <v-btn v-else color="blue" :loading="loading" @click="updateInv">Update</v-btn>
                        </v-toolbar>
                        <v-card-text>
                            <v-row class="pa-3">
                                <v-col cols="3">
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
                                <v-col cols="3">
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
                                <v-col cols="3">
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
                                <v-col cols="2">
                                    <v-btn @click="addCustomer" color="green">Add customer</v-btn>
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
                                <v-col cols="4">
                                    <v-btn @click="treatDialog = true" color="green">Add Treatment Details</v-btn>
                                </v-col>
                                <v-col cols="4">
                                    <v-btn @click="treatViewDialog = true" v-if="treatDetails.length!=0" color="orange">View Treatment Details</v-btn>
                                </v-col>
                                <v-spacer></v-spacer>
                                <v-col cols="4">
                                    <v-text-field readonly outlined label="Total amount" v-model="tamount"></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="4">
                                    <v-btn @click="xrayDialog = true" color="green">Add X-Ray</v-btn>
                                </v-col>
                                <v-col cols="4">
                                    <v-btn @click="xrayViewDialog = true" v-if="xrayDetails.length!=0" color="orange">View X-Ray</v-btn>
                                </v-col>
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
                                <v-col cols="4">
                                    <v-text-field v-model="famount" readonly outlined label="Amount"></v-text-field>
                                </v-col>
                                <v-col cols="4">
                                    <v-text-field :rules="numRule" v-model="ramount" outlined label="Amount recieved"></v-text-field>
                                </v-col>
                                <v-col cols="4">
                                    <v-select :items="paymentmodes" outlined v-model="mop" label="Mode of payment"></v-select>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-dialog>
            </v-col>
        </v-row>
        <v-row>
            <v-dialog v-model="treatDialog" persistent max-width="750px">
                <v-card>
                    <v-card-title>Treatment details</v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="6">
                                <v-menu
                                    v-model="tremenu"
                                    :close-on-content-click="false"
                                    :nudge-right="40"
                                    transition="scale-transition"
                                    offset-y
                                    min-width="290px"
                                >
                                    <template v-slot:activator="{ on }">
                                    <v-text-field 
                                    outlined
                                    v-model="tredate"
                                    label="Treatment date"
                                    v-on="on"
                                    
                                    readonly
                                    ></v-text-field>
                                    </template>
                                    <v-date-picker @input="tremenu = false" v-model="tredate"></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="6">
                                <v-text-field outlined v-model="tredetail" label="Detail"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn v-if="tediting" @click="updateTreatment" color="blue">Update</v-btn>
                        <v-btn v-else @click="addTreatment" color="green">Save</v-btn>
                        <v-btn color="red" @click="clearTreat">Cancel</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
        <v-row>
            <v-dialog v-model="treatViewDialog" max-width="750px">
                <v-card>
                    <v-card-title>Treatment Details</v-card-title>
                    <v-card-text>
                        <v-row v-for="(treat, index) in treatDetails" :key="index">
                            <v-col cols="4">
                                <h4>{{ toLocalDate(treat.date) }}</h4>
                            </v-col>
                            <v-col cols="6">
                                <h4> {{ treat.detail }} </h4>
                            </v-col>
                            <v-col>
                                <v-btn @click="deleteTreat(index)" icon small> <v-icon color="red">mdi-delete</v-icon> </v-btn>
                            </v-col>
                            <v-col>
                                <v-btn @click="editTreat(index)" icon small> <v-icon color="red">mdi-pencil</v-icon> </v-btn>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-row>
        <v-row>
            <v-dialog v-model="xrayDialog" max-width="750px">
                <v-card>
                    <v-card-title>Add details</v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12">
                                <!-- <v-textarea outlined label="Imgae Base64" v-model="imgBase"></v-textarea> -->
                                <v-file-input v-model="file" label="Select X-ray image" accept="image/png, image/jpeg, image/bmp"></v-file-input>
                            </v-col>
                            <v-col>
                                <v-text-field outlined label="Caption" v-model="caption"></v-text-field>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn @click="addXray" color="green">Save</v-btn>
                        <v-btn @click="clearXray" color="red">Cancel</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
        <v-row>
            <v-dialog v-model="xrayViewDialog" max-width="750px">
                <v-card>
                    <v-card-text>
                        <v-row v-for="(xray, index) in xrayDetails" :key="index">
                            <v-col cols="6">
                                <img :src="xray.imgBase" width="300px">
                                <p>{{ xray.caption }}</p>
                            </v-col>
                            <v-col cols="2">
                                <v-btn @click="deleteXray(index)" icon small> <v-icon color="red">mdi-delete</v-icon> </v-btn>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-row>
        <v-row>
            <v-dialog v-model="presDialog" max-width="750px">
                <v-card>
                    <v-card-title>Add Prescription</v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols>
                                <v-autocomplete @change="getBatches" outlined label="Medicine" item-value="id" v-model="mid" item-text="brand_name" :items="meds"> </v-autocomplete>
                            </v-col>
                            <v-col>
                                <v-autocomplete label="Batch" outlined v-model="batch" item-value="batch_no" item-text="batch_no" :items="batches">
                                    <template v-slot:item="data">
                                        <template>
                                            <v-list-item-content>
                                                <v-list-item-title> {{ data.item.batch_no }} </v-list-item-title>
                                                <v-list-item-subtitle> {{ data.item.expiry }} </v-list-item-subtitle>
                                            </v-list-item-content>
                                        </template>
                                    </template>
                                </v-autocomplete>
                            </v-col>
                            <v-col>
                                <v-select :items="['OD','BD','TDS']" outlined v-model="dosage" label="Dosage"></v-select>
                            </v-col>
                            <v-col>
                                <v-text-field outlined label="Days" v-model="days"></v-text-field>
                            </v-col>
                            <v-col> <v-btn @click="addPItem" color="green">Add Item</v-btn>  </v-col>
                        </v-row>
                        <v-divider class="pa-5"></v-divider>
                        <v-row v-for="(item, index) in pitems" :key="item.mid">
                            <v-col>  {{ item.name  }} </v-col>
                            <v-col>  {{ item.qt  }} units </v-col>
                            <v-col> <v-btn @click="clearPItem(index)" icon small> <v-icon color="red">mdi-delete</v-icon> </v-btn> </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn v-if="!medIncluded" @click="saveInv" color="orange">Skip</v-btn>
                        <v-btn v-if="pitems.length" @click="saveInv" color="green">Add Prescription</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
    </v-container>
</template>

<script>
import AddCustomerVue from '../customers/AddCustomer.vue'
import {supabase} from '../../supabase'
export default {
    data: () => ({
        treatDialog: false,
        treatViewDialog: false,
        treatDetails: [],
        tediting: false,
        tredetail: null,
        teIndex: null,
        xrayDetails:[],
        xrayDialog: false,
        xrayViewDialog: false,
        xediting: false,
        imgBase: null,
        caption: null,
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
        paymentmodes: ['Bank Transfer', 'Cash', 'Cheque', 'Credit Card', 'Debit Card', 'G-Pay', 'Paytm', 'PhonePe'],
        mop: 'Cash',
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
        tremenu: false,
        tredate: null,
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
        file: null,
        presDialog: false,
        mid: null,
        dosage: null,
        days: null,
        batches: [],
        pitems: [],
        batch: null
    }),

    methods: {
        keyEvent(e) {
            if(e.ctrlKey && e.key == 'q') {
               this.addCustomer()
            }
        }, 
        getBatches() {
            this.batches = this.$store.getters.loadedMed(this.mid).store
        },
        addPItem() {
            
            let med = this.$store.getters.loadedMed(this.mid)
            let store = med.store
            // let qt = this.dosage === 'OD'?1:2
            let qt = 0
            if(this.dosage == 'OD') {
                qt = 1 * +this.days
            } else if(this.dosage == 'BD') {
                qt = 2 * +this.days
            } else {
                qt = 3 * +this.days
            }
            
            store.sort((a,b) => a.expiry_stamp-b.expiry_stamp)
            let sel_item = store.find((item) => {return item.batch_no == this.batch} )
            let amount = this.decimalRound( (sel_item.mrp / sel_item.pac) * +qt )
            let iamount = (sel_item.mrp / sel_item.pac) * +qt 
            let gst = this.decimalRound( amount - (amount * (100/(100 + +med.gst))) )
            let rate = this.decimalRound(amount * (100/(100 + +med.gst)))
            let sgst = this.decimalRound( +gst / 2)
            let cgst = this.decimalRound( +gst / 2)
            const item = {
                name: med.brand_name,
                mid: this.mid,
                description: this.description,
                qt: qt,
                rate: rate,
                mrp: this.decimalRound(sel_item.mrp / sel_item.pac),
                sgst: sgst,
                cgst: cgst,
                amount: amount,
                hsn: med.hsn,
                batch: sel_item.batch_no,
                expiry: sel_item.expiry,
                iamount: iamount
            }
            this.pitems.push(item)
            this.mid = null
            this.batches = []
            this.days = null
            this.dosage = null
        },

        clearPItem(index) {
            this.pitems.splice(index, 1)
        },

        async savePInv() {
            this.loading = true
            let ta = 0
            for(let i in this.pitems) {
                ta = +ta + +this.pitems[i].iamount
            }
            const payment = [{
                date: new Date(this.idate).getTime(),
                mop: this.mop,
                ramount: ta
            }]
            const inv = {
                cid: this.cid,
                idate: new Date(this.idate).getTime(),
                amount: ta,
                createdby: this.user.id,
                payments: payment,
                discount: this.discount,
                cus_gst: null,
                items: this.pitems,
            }
            console.log(inv);
            
            const { data, error } = await supabase.from('invoices_pharma').insert([
                inv
            ])
            console.log(data, error)
            if(data) {
                this.$store.dispatch('createAlert',{type: 'success', message: 'Pharmacy Invoice created'})
                this.clear()
            }
            if(error) {
                this.$store.dispatch('createAlert',{type: 'error', message: error.message})
                console.log(error.message);
                this.clear()
            }
        },

        addTreatment() {
            this.treatDetails.push({
                date: new Date(this.tredate).getTime(),
                detail: this.tredetail
            })
            this.treatDetails.sort((a,b) => a.date-b.date)
            this.clearTreat()
        },
        deleteTreat(index) {
            this.treatDetails.splice(index, 1)
        },
        editTreat(index) {
            let td = new Date(this.treatDetails[index].date)
            this.tredate = td.toISOString().substr(0,10)
            this.tredetail = this.treatDetails[index].detail
            this.tediting = true
            this.treatDialog = true
            this.teIndex = index
        },
        updateTreatment() {
            this.treatDetails.splice(this.teIndex, 1)
            this.treatDetails.push({
                date: new Date(this.tredate).getTime(),
                detail: this.tredetail
            })
            this.treatDetails.sort((a,b) => a.date-b.date)
            this.clearTreat()
        },
        clearTreat() {
            this.tredate = null
            this.tredetail = null
            this.tediting = false
            this.treatDialog = false
            this.teIndex = null
        },
        async addXray() {
            let base64 = await this.blobToBase64(this.file)
            this.xrayDetails.push({
                imgBase: base64,
                caption: this.caption
            })
            this.clearXray()
        },
        blobToBase64(blob) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        },

        deleteXray(index) {
            this.xrayDetails.splice(index, 1)
        },
        clearXray() {
            this.file = null
            this.caption = null
            this.xrayDialog = false
        },
        addCustomer() {
            this.$refs.addcus.open()
        },
        open() {
            this.idate = new Date().toISOString().substring(0,10)
            this.dialog = true
        },
        getRate() {
            this.rate = this.$store.getters.loadedService(this.sid).price
            this.description = this.$store.getters.loadedService(this.sid).description
        },
        retRate(sid) {
            return this.$store.getters.loadedService(sid).price
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
            inv.treatmentDetails?this.treatDetails = inv.treatmentDetails : this.treatDetails = []
            
        },
        printInvoice(inv) {
            var pdfMake = require('pdfmake/build/pdfmake.js')
            if (pdfMake.vfs == undefined){
                var pdfFonts = require('pdfmake/build/vfs_fonts.js')
                pdfMake.vfs = pdfFonts.pdfMake.vfs
            }
            const logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAAA2CAYAAAAf4R06AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAABABSURBVHhe7Zl5dFRVnsfnD6d7es4s3X3GmZ4zpx1RaI89M61AAAEZFFHWsCmLIIIsIoSdsCNbIJAAsgkCYQ0gYQ+yBQIoEcSg7AiELQEMEEiq3lZbKsl3vr/7qsgGjNAcTtU59eNcqirv3vvu+31+a9XfICJhLRGAYS4RgGEuEYBhLhGAYS4RgGEuEYBhLhGAYS5hCbCkpKTSKC4uhtvrgsO8g1uOG8jJu4jjlw8h4+wOfHPmKzUyzu7E6exM5ObnwO1zoTi4PrBvOErIAxQF5+u3ce76cXx/YR92/rAWKRkLkLQ3HrO2xmLsmq4YkBSNbvMaoO30/8I7k55D4/H/jkFJbTA5pQ9GJXdGk4l/RI1hf4u203h9wh9Rf/Rv8V7iK5iU0hvfEmqhv1BuFLhjeElYAEw/sYkwPsZnqcMxcV0vAvgd6o/6LQ6e2Y4Oia8qOGVH6vcrUFTkt72ruAR5zlwMXNIK9Ub9M3b/+CU+IuwaQ+25UbF/h8FL2+CO86aaH24SFiFUgQjAEDDbM5NRZ/hv8Omabnhj3LPl4NUZ8Q+4dudSORjyPjf/Gj3xOcQsaqHeR0+pWm5d/yXR8Po8DKfhBTEsPFDym4c567tzexDHsCgglOIDXlR2VB/6DPPc9+UB8l9RcRFD5seoO/KfcPX2eSQf+KzS+hNXDpdbFw4SsgBtcEUq/C1Oi8O70/8Hraa8hOErO2D2thFoOPZfMCs1FuNWf1gOgkA5cCq1sh9xvy1Hlqo5e49vxMmrR1Bz2K/KrHsGO46ujXjgXytBcNfvXMa0jf1V7tp6ZDmu511iseFj5VikQp0ATdozFXO2jazkSalHVlQCIY717U+71XXZ7/yNk6gV+5vSddxDKtaIB/4VUlJSDNOtY3l6AtonvKJKf1+hl0DtMOor9OBszg9YtHsS3hj7LGoP//vyXqTGM1iRPkMZgcCQnJlbkI3tR1erECqgYha3wIS1PcutazTuD7jLajcC8HFEFE2FS4/Wbtp/K4Wu2j8THvZ1TvMuMrO+RuLmIWgZVxVRw36twl1Z5VccXWfXZc704Db7wU/Xdue6akjYPAixK9qrtVL4lAUfFftrtI3/M1buS8SNu1fUWcIFZEgAFO/KvLAfb9ILbDjPoMGY36PjjJrs6f5DeU1ZQMFRPTAq/l3ajMs3zyqQsSs60DCOYBjh1WLLUHHuG+P+FWu/mcP5P2HN13PR5bPXVKF0hZ8lIgjI4AhFCQGAJXCYeWg+6YVKyq08Ap5HoDXpiQL3MxYy9VhZlp3XgAATtwxBt7mv4452E/0WNStdGxzcY0xyV+TkZd0Lt8UElq/dwrDl7VWIllDt8poqChQVSbMfOHIISUh4YGbWfjSd+J/Kc0qVXKpwgdXo0z8QRHPmx+nYkbka0VP/pNYs3j1ZNej31hGMNOcSalvHv0QvrsH1wT1LR/1Rv8Mtx3Xbs8p4l3yWlmX48o5qr86zaqP1lJcr9ZahIiEB8Oy1o4RRBccuZ2DhrvHMW91U7pqVOhwbDy9WuXHl/kS8P7MWmk+ugoZjnkWnmVEYmNQK8RtjVMiTPCY93grmsezbWWzUq2Hz4aWY99UYgqjsfdK4S4FzPxFQeVoumk18Xs3v/XljVQGHoguGRAiV6nLosnfRaUYtrMtYoPo4+fpszddzVCsh3570mPsGEjYNxP5TW1DAkOtnSPMTgMtjsp2IR4fE6jh6cb8Kh0VFReqrt8nreiugAqwiwPSTmwiqOHCG8iKYJC+vOzhfFTtbvktSn0NRQsIDRZEWQew4ugYzmLsmUfEJmwcj+cAsZPy0k838z6oytKvDYqVMaS++O78XI1d1xsKd4+Ew7gSULAVHMS7dPIPmcS+onrAh81lZgE0nPQ/d5VRzHyTihbkFOeizoAlz9N0Q9D1bQgKgiCjsGpv1JWlTkJV7Ct5Ct4LkK/Sp8FXo96qfgM7/fIJV41x8zLA2bdMAZN+6oLyuYn4SL0z7MQXvsZ+c+GVPu/0IAJRfKYKwHySyn8zx+wtVcROqBEMKYIGRhxaTX0TNob/Cm2P/TX3b0mlGFEdNtJ76Ml4f+XvVC87eNhK5+dlKsRXBlRWBKD9BdZ5VBy3iXiQ85kKGz03Mq6EaEh9VQgagSFFRMXYfSyltsqns10b8I7qwEkzYPBCHz6XBdGsK2sPABUW+TpN50kpILpUiR/YdT4+U3wB/6T6hLE8ZoPRadr8V/DW8vJQwdHrUNybyw+t35/eo3CbhU+F4LIXba6TguXTzNPNrL7X3jC1D1bcupSDpzfTK4Hv7nPaQf6EqTx2g3++HtmolrOPHVRirhJAKy759ATOpYHVdJjwh/cne0jqIR246vASDklpjyLJ2mL9jLLYfTcYRGsyhn9J4LQlTNvTFdFa9Xp/bPkOIylMFKAr0Xb0CvfHbMNq1Q1FhIStLu6qU8CnXRVvioZK/1OcnLrZHSeEjxiS/xB+5kI4vD87DzK3DEL8hhlXtBOxmAXTj7lX4OEed7UlZ0ROWRwYYtGK/0wH/3bvwez1K2VLiV5SKAOSj98IFGE2bQm8ZDfeVy3B80g9a949gHD4cCFeiYnsERfbxyz2oSAGuhvpcpGAHRa0ruzAgtmHY10Vkvd80UKjZ+VRdU2FTjMbe13UxCwV9+8HZvTs8x34sdx65Z6FlofDWLfg9bjXfflZ7r/uJbTZPXh4ZoHiLvmYNtObNoU2dAmeHjnDy1c2HkYeQoRQkkGm9onj16qey5e8+L7QZM2DuTVd/t5YmwXqtLoxt2+zrgfliJLZSRGElMDO/h6NLFzjbtoPznSYo6NkT2pjR8OTkcK7txeqeXB/8NaH0PMEz+NW8Qhqd0aMnzJEj7M9l7nlvDw5r5QoY1avDty9dnUP2kvmuEyfglOcfPx4FPXrATEuz9+faosBrsLUJDj/PGLy//dmeJ+8fSP0XyCMD9NPytDffhNGhA3x87zp2DFpUFKxrOSiIi4M2fASMlBRo/ftDb9MG7rNnoLVrC23oUCqO8BYvhjZiOPRVq2xlfLkWVt3XYKRuY0Hhh7FjO5y9ekHr8wk858+pR6MKlFFYu3fB7PIBrCZN4Ll5Ew6GYY338OoG3JcuQY+Jgdb3ExjMsZ7bt+EcOQp6bCysw4egdfsQhngTPc8xbhzMF6tCf/tt6CuW03hSoQ0YAL1FC0aGlnD9SI8rLoF7YwrMGjXuAVSwZT330d95W/WoZvJqWPHxcG3ZAuegQdBbt4JOuNb+ffAU5MM5ahQ0nkHPyID+/vuwjmbCzefS+/aF3rs3zK1b1L6PK48MsPBOHozOnWE99xytsBmM7dup/K2wbtyAdeAA9Ga0TCpGe+stGC9Ugc65+usNoP35ZRR5PCjkvAIqyozpfw+gqy49kAA92VdR8F57mJ9/DnP+fGgx/e49nFiqm4oVgK6OnVT1aMRPhcG11t69cEyYAIcoKOMgdAFMgPpqKrdOHTi7dIbWiEZXpQrcck6Gcevd92AOGYJieoGT97LOnYN56FtYzXk2ArYBrq8E0Nq3DzoNUu/YQXlQoaHDEE+dPRvWyeMMvRdhtGoFg8bkY47X1q6FKc9Po7Tq1YU+Zw4KBg+G2S8G1q5d0DjXk5+voszjyKMDdDjgmD4dxiuvKIjm889DGztWhSXPqRPQeSCtTx9YWzbDePVVGEuXwUyYDmfVaigmQL/Ph3zOsQQgc0lZgMb69TCiW8LiQ7uWLlUWWwngB13h6mQD1BYugNG2DXTeX6M1Kws/cRw6c6zv+nVYabsZnundYgxrVkP/y1/g4d+9ApFQTUYFCXWurAswly2DnpgAFz3a6NfPvt/9AK5fB/OtxtB5Bgm5Emo9eXlwX70KYzn3mD8PFo3W4Fnkmrl3DwG+Dk2MvgFBfjoOzp69YDJCub75GlYr1gLXrz09gBLjHTykvnw5tPr1bYhVq8LFBxCAyvomTYKbocGMqgUrNRVWEsNmtQBAhp0HAbSSV8KsWw/unTtgTI2H1rPHwwEmLYHRsT0czGdSbJiEKN5oNGwI3+1bAYB14KbXaCnrYNSsAQ/heX++AZfAlrDO8zgTE6EzDegELQDNhwC0Q349GosAZOFGvcur9sVC6LVr0VjmwRSAnW3js9L3wKIHGqvXQJ82TUUF5wcfwBgxAuamTSqMe/Ls+uFx5DFC6B32cavgnBIHfeNG6LQoCU0mleU9fZIAWyuAnq1bYUTVhovFiUVFa9X+9P8DXJ2sABqNGkGLjoaLhUvwwe4LcMHnMJiztNGjCJGVLD1ecpiWkKAKBgHoIkDv/v0PBujneQYNhNm4MaxTp+BiXn0YQJPPbDZrRg/sqDxQpIjPZDAPajVrwn0zF+aHzLdlAdLz3DQsKaY8mZlwdiXAWjQYnlVnTRAsuh5HHh0gw4VGBXru3rELDrEqWpGEChVCo4MeKADFA4MAxQPdqgrN5xwFUCxawqVUoRJCWfwIEMl/Uiz43B41Rx6tFKDkwI4KoD5xAhVRC/qunfTWniwgWsPHc4lX+VkwiVGJB3pYUAhAnQDdDKGeGwyv9CCDhYvMLRgQA/N/GzKHnYSLVe49gBtYxFSvAa8A5GcxOPcPP8BJyHJOu9oshjcnG9bkSTSg6nAxj5sfdiXATrzGEBrwQAFoz82Bk8ZmftQdvoICeD1edYanCtCoXRs6S2ipQs0N66ExZLnYRlh70qCxgNAZ362NG2i9NVWVZy5aCI1h1puVBS8b+QJWaXrbtvDpmipYpNDQmYM813PgYHWr0QC8Tiec9DAJT5IfCum9kiPNTu/DZEHiunQRzmZN4WTY9LpdjAhsaVq0hJcFgb41Fa4zp6FxT5NnlUrRydZHr1EdRvpeuHN/5j4doQv8hQvhYA41XnqJ+7F6bMlKlO2KjwZkLPoCpuT6devo0fQSFjZ+FibOwUNU8SRzPKy+nQv4fHwO2UPjmeRLCqkFfKapvnUy69WHyRAqRuXjcLAqNeQeGp9RDDg7+ykCNAy2DiwUGEI1VnFOxnLrm4N8QD7Y3LnQmbv0KVOhb9rIPMYqkQ+mb2ZBQwXrK/kwyckq3BhxUwh/AzR6sMH52swZ8LJAMg+x5O/VAxpLcoEkDyYArVOnVQ4xxONlLxYc0op4WQWKZ0hboY0erfKmsT6FeYVVqMyX87Dv1Fjmq3Xz5sLDBl7n2aRCdp1k3k5Phy6tgRQyLNBknrb9q8D7qXAyJPsYPYJn8fGcOo3MOXAQHNPi4aUnWd9m8NyMAl98AX3mTK6Lg8GopMfLGXgvnkVaHTFIiQLSWkjhZe7c9XRDaPAh1Je/HKI8+dsvG/Zce33pa9lRup+9f/CeDx1lzvWg85S9l5pHb1JfXstr8G+B6xU/B1/5373zqNCurpW+qj35Pjjut2fpe7l36VkfVx4ZYERCSyIAw1wiAMNcIgDDXCIAw1wiAMNcIgDDXCIAw1wiAMNcIgDDXCIAw1wiAMNcIgDDXCIAw1qA/wNqS8zjhDlfpAAAAABJRU5ErkJggg=='

            let customer = this.$store.getters.loadedCustomer(inv.cid)

            let billContent = []
            let totalContent = []
            let paymentDetails = []
            let treatmentDetails = []

            billContent.push([
                {text: 'S.No.', alignment: 'center', bold: true, fontSize: 7}, 
                {text: 'Treatment', alignment: 'center', bold: true, fontSize: 7}, 
                {text: 'Description', alignment: 'center', bold: true, fontSize: 7},
                {text: 'Quantity', alignment: 'center', bold: true, fontSize: 7},
                {text: 'Rate', alignment: 'right', bold: true, fontSize: 7},
                {text: 'Amount', alignment: 'right', bold: true, fontSize: 7},
            ])
            let items = inv.items
            let payments = inv.payments
            let treat = inv.treatmentDetails?inv.treatmentDetails:[]
            let tamount = 0
            let bamount = 0
            let tramount = 0

            for(let i in items) {
                billContent.push([
                    {text: +i + 1, alignment: 'center', fontSize: 7}, 
                    {text: this.getSname(items[i].sid), alignment: 'left', fontSize: 7}, 
                    {text: items[i].description, alignment: 'left', fontSize: 7}, 
                    {text: items[i].qt, alignment: 'center', fontSize: 7},
                    {text: this.decimalRound(items[i].rate), alignment: 'right', fontSize: 7},
                    {text: this.decimalRound(+items[i].qt * +items[i].rate), alignment: 'right', fontSize: 7},
                ])
                tamount = +tamount + +items[i].amount
            }
            tramount = +tamount - +inv.discount
            bamount = +tamount - +inv.discount - +this.checkAmount(payments)

            totalContent.push(
                [{},{},{},{},
                    {text:'Gross Total', alignment: 'right', fontSize: 7, bold: true},
                    {text:`₹${this.decimalRound(+tamount)}`, alignment: 'right', fontSize: 7, bold: true}
                ],
                [{},{},{},{},
                    {text:'Discount', alignment: 'right', fontSize: 7, bold: true},
                    {text:`₹${this.decimalRound(+inv.discount)}`, alignment: 'right', fontSize: 7, bold: true}
                ],
                [{},{},{},{},
                    {text:'Total Receivable', alignment: 'right', fontSize: 7, bold: true},
                    {text:`₹${this.decimalRound(+tramount)}`, alignment: 'right', fontSize: 7, bold: true}
                ],
                [{},{},{},{},
                    {text:'Paid', alignment: 'right', fontSize: 7, bold: true},
                    {text:`₹${this.decimalRound(+this.checkAmount(payments))}`, alignment: 'right', fontSize: 7, bold: true}
                ],
                [{},{},{},{},
                    {text:'Balance Due', alignment: 'right', fontSize: 8, bold: true, color: '#d7310e'},
                    {text:`₹${this.decimalRound(+bamount)}`, alignment: 'right', fontSize: 7, bold: true, color: '#d7310e'}
                ],
            )

            paymentDetails.push(
                [{text:'PAYMENT DETAILS', alignment: 'left', fontSize: 9, color: '#d7310e', bold: true, colSpan: 2},{},{}],
                [{},{},{}],
                [{text:'INR(₹) Paid', alignment: 'left', fontSize: 7},{},{}]
            )
            for(let i in payments) {
                if(payments[i].ramount > 0) {
                    paymentDetails.push([
                        {text: `${this.toLocalDate(payments[i].date)} - ₹${this.decimalRound(+payments[i].ramount)} by ${payments[i].mop}`, alignment: 'left', fontSize: 7, colSpan: 3},{},{}
                    ])
                }
            }

            if(treat.length!=0) {
                treatmentDetails.push(
                    [{text:'TREATMENT DETAILS', alignment: 'left', fontSize: 9, color: '#d7310e', bold: true, colSpan: 2},{},{}],
                    [{},{},{}]
                )
                for(let i in treat) {
                    treatmentDetails.push([
                        {text: `${this.toLocalDate(treat[i].date)}`, fontSize: 7, },
                        {text: treat[i].detail, fontSize: 7, colSpan: 2},
                        {}
                    ])
                }
            } else {
                treatmentDetails.push([{},{},{}])
            }



            let content = [
                {
                    columns: [{width: 30, image: logo, fit: [80,80]},
                    {stack: [
                        'SMILE DENTAL CARE',
                        'Dr. Ranjit Chandar B.D.S, F.I.L.D(Malaysia),',
                        'Certified Root Canal Specialist',
                        'Regd No. - 11850',
                    ], alignment: 'right', fontSize:7.5, bold: true
                    },]
                },
                {
                    columns: [{},
                    {
                        width: 280,
                        stack: [
                        'HQ: BASEMENT, JOSHI & JOSHI COMPLEX, KAILASH NAGAR, KATTUR, TRICHY-620019, TN, INDIA',
                        'SRI VIDHYA MEDICALS, GANDHI SALAI, SRIRANGAM, TRICHY, TN, INDIA.',
                        '+91 9489364226 / 0431 2434898 (Srirangam)',
                        '+91 9791765077 / +91 9092465077 / +91 431 2532277',
                    ], alignment: 'right', fontSize:6
                    },]
                },
                {
                    columns: [{},
                    {stack: [
                        'support@smiledentalcaretrichy.com',
                        'www.smiledentalcaretrichy.com',
                        ' '
                    ], alignment: 'right', fontSize:7, bold: true
                    },]
                },
                
                {
                    canvas: [ { type: 'line', x1: 0, y1: 0, x2: 380, y2: 0, lineWidth: 2, lineColor: '#d7310e' } ]
                },
                {
                    columns: [{width: '100%', text: `INVOICE #${inv.invno}`,color: '#d7310e', bold: true, alignment: 'center', margin: 5}]
                },
                {
                    columns: [
                        {
                            stack: [
                                `Bill to:`,
                                `${customer.name}, ${this.calculateAge(customer.dob)}/${customer.gender},`,
                                `${customer.address?customer.address:''}`,
                                `Ph: ${customer.phone}`,
                                ' ',
                            ],fontSize:8, bold: true
                        },
                        {
                            stack: [
                            `SDC Register no.`,
                            `${customer.regno}`
                            ], fontSize:8, bold: true
                        },
                        {
                            stack: [
                            `Date: ${this.toLocalDate(inv.idate)}`,
                            ], fontSize:8, bold: true, alignment: 'right'
                        },
                    ]
                },
                {
                    layout: 'lightHorizontalLines',
                    style: 'tableStyle',
                    table: {
                        widths: [40,'auto','auto','*','*','*'],
                        headerRows: 1,
                        body: billContent
                    }
                },
                {
                    canvas: [ { type: 'line', x1: 0, y1: 0, x2: 380, y2: 0, lineWidth: 1 } ]
                },
                {
                    layout: 'noBorders',
                    style: 'tableStyle',
                    table: {
                        widths: [40,'*','*','*','*','*'],
                        headerRows: 0,
                        body: totalContent
                    }
                },
                {
                    canvas: [ { type: 'line', x1: 0, y1: 0, x2: 380, y2: 0, lineWidth: 2, lineColor: '#d7310e' } ]
                },
                {
                    columns: [
                        {
                            layout: 'noBorders',
                            style: 'tableStyle',
                            table: {
                                widths: ['*','*','*'],
                                headerRows: 0,
                                body: paymentDetails
                            }
                        },
                        {
                            layout: 'noBorders',
                            style: 'tableStyle',
                            table: {
                                widths: ['*','*','*'],
                                headerRows: 0,
                                body: treatmentDetails
                            }
                        },
                    ]
                },
                {
                    columns: [
                    {stack: [
                        ' ',
                        ' ',
                        ' ',
                        ' ',
                        'Authorized Signatory',
                        'Smile Dental Care',
                    ], alignment: 'left', fontSize:7, bold: true
                    },]
                },
            ]

            if(this.xrayDetails.length!=0) {
                content.push(
                    {
                        columns: [{width: 30, image: logo, fit: [80,80]},
                            {stack: [
                                'SMILE DENTAL CARE',
                                'Dr. Ranjit Chandar B.D.S, F.I.L.D(Malaysia),',
                                'Certified Root Canal Specialist',
                                'Regd No. - 11850',
                            ], alignment: 'right', fontSize:8, bold: true
                            },
                        ],pageBreak: 'before'
                    },
                    {
                        columns: [{},
                        {
                            width: 280,
                            stack: [
                            ' ',
                            'HQ: BASEMENT, JOSHI & JOSHI COMPLEX, KAILASH NAGAR, KATTUR, TRICHY-620019, TN, INDIA',
                            'SRI VIDHYA MEDICALS, GANDHI SALAI, SRIRANGAM, TRICHY, TN, INDIA.',
                            '+91 9489364226 / 0431 2434898 (Srirangam)',
                            '+91 9791765077 / +91 9092465077 / +91 431 2532277',
                        ], alignment: 'right', fontSize:6
                        },]
                    },
                    {
                        columns: [{},
                        {stack: [
                            'support@smiledentalcaretrichy.com',
                            'www.smiledentalcaretrichy.com',
                            ' ',
                        ], alignment: 'right', fontSize:7, bold: true
                        },]
                    },
                    
                    {
                        canvas: [ { type: 'line', x1: 0, y1: 0, x2: 380, y2: 0, lineWidth: 2, lineColor: '#d7310e' } ]
                    },
                    {
                        columns: [{width: '100%', text: `INVOICE #${inv.invno}`,color: '#d7310e', bold: true, alignment: 'center', margin: 5}]
                    },
                    {
                        columns: [
                            {
                                stack: [
                                    `Bill to:`,
                                    `${customer.name}, ${this.calculateAge(customer.dob)}/${customer.gender},`,
                                    `${customer.address?customer.address:''}`,
                                    `Ph: ${customer.phone}`,
                                    ' ',
                                ],fontSize:8, bold: true
                            },
                            {
                                stack: [
                                `SDC Register no.`,
                                `${customer.regno}`
                                ], fontSize:8, bold: true
                            },
                            {
                                stack: [
                                `Date: ${this.toLocalDate(inv.idate)}`,
                                ], fontSize:8, bold: true, alignment: 'right'
                            },
                        ]
                    },
                    {
                        canvas: [ { type: 'line', x1: 0, y1: 0, x2: 380, y2: 0, lineWidth: 2, lineColor: '#d7310e' } ]
                    },
                    ' '
                )

                for(let i in this.xrayDetails) {
                    content.push(
                        {image: this.xrayDetails[i].imgBase, fit: [200, 200]}
                    )
                    content.push({text: this.xrayDetails[i].caption, fontSize: 7}, ' ')
                }
            }

            var docDefinition = { 
                watermark: { text: 'SDC', opacity: 0.09, bold: true, italics: false  },
                pageSize: 'A5',
                pageMargins: [ 20, 10, 20, 40 ],
                pageOrientation: 'portrait',
                footer: {
                    columns: [
                        { text: this.footer, alignment: 'center', fontSize: 7, bold: true }
                    ],
                    margin: [ 20, 0, 20, 40 ]
                },
                content: content,
                styles: {
                    table: {
                        fontSize: 7,
                        hLineColor: '#d7310e'
                    },
                    tableStyle: {
                        margin: 0,

                    },
                    title: {
                        fontSize: 20, bold: true
                    },
                } 
            }
            pdfMake.createPdf(docDefinition).open()
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

        calculateAge(dob) {
            const birthDate = new Date(dob)
            const now = new Date();
            const diffInMs = now.getTime() - birthDate.getTime();
            const ageDate = new Date(diffInMs);
            return Math.abs(ageDate.getUTCFullYear() - 1970);
        },

        addItem() {
            const item = {
                name: this.getSname(this.sid),
                sid: this.sid,
                description: this.description,
                qt: this.qt,
                rate: this.rate,
                amount: this.amount,
                med_included: this.$store.getters.loadedService(this.sid).med_included
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
                med_included: this.$store.getters.loadedService(this.sid).med_included
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
                date: new Date(this.idate).getTime(),
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
                items: this.items,
                treatmentDetails: this.treatDetails
            }
            const { data, error } = await supabase.from('invoices').insert([
                inv
            ])
            if(data.length > 0) {
                this.printInvoice(data[0])
                if(this.pitems.length) {
                    this.savePInv()
                } else {
                this.clear()
                this.$store.dispatch('createAlert',{type: 'success', message: 'Invoice created'})
                }
            }
            if(error) {
                this.$store.dispatch('createAlert',{type: 'error', message: error.message})
                console.log(error);
                this.clear()
            }
        },

        updateInv() {
            const inv = {
                cid: this.cid,
                idate: new Date(this.idate).getTime(),
                amount: this.famount,
                updatedby: this.user.id,
                discount: this.discount,
                items: this.items,
                treatmentDetails: this.treatDetails
            }
            supabase.from('invoices').update(inv).eq('id', this.id)
            .then((res) => {
                if(res.data) {
                    this.printInvoice(res.data[0])
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
                {date: new Date(this.idate).getTime(), mop: this.mop, ramount: this.ramount}
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
            this.dosage = null
            this.presDialog = false
            this.pitems = []
        }
    },

    computed: {
        medIncluded() {
            return this.items.some((item) => item.med_included)
        },

        meds() {
            return this.$store.getters.loadedMeds
        },
        alert () {
            return this.$store.getters.loadedAlert
        },

        amount () {
            return +this.qt * +this.rate
        },
        
        invs() {
            return this.$store.getters.loadedInvoices
        },

        footer() {
            return this.$store.getters.loadedFooter
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
