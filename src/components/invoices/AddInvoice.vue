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
                                                    <v-list-item-subtitle v-html="data.item.phone"></v-list-item-subtitle>
                                                </v-list-item-content>
                                            </template>
                                        </template>
                                    </v-autocomplete>
                                </v-col>
                                <v-col cols="5">
                                    <v-autocomplete v-on:keyup="keyEvent" outlined label="Customer number" item-value="id" v-model="cid" item-text="phone" :items="customers">
                                        <template v-slot:item="data">
                                            <template>
                                                <v-list-item-content>
                                                    <v-list-item-title v-html="data.item.phone"></v-list-item-title>
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
                                    <v-text-field v-model="amount" readonly outlined label="Amount"></v-text-field>
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
                                        <v-date-picker v-model="idate"></v-date-picker>
                                    </v-menu>
                                </v-col>
                            </v-row>
                            <v-row lazy-validation class="pa-3">
                                <v-col cols="12">
                                    <v-btn @click="dialog1 = true" color="green">Add item</v-btn>
                                </v-col>
                                <v-col cols="12">
                                    <v-dialog v-model="dialog1" persistent max-width="750px">
                                        <v-form ref="addItem" v-model="itemValidate">
                                            <v-card>
                                                <v-card-text>
                                                    <v-alert :value="alert.alert" :type="alert.type">{{alert.message}}</v-alert>
                                                    <v-select :rules="reqRule" :items="services" v-model="svc" label="Select service"></v-select>
                                                    <v-row v-if="svc == 'Air tickets'">
                                                        <v-col cols="6">
                                                            <v-text-field :rules="reqRule" v-model="from" outlined label="From"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field :rules="reqRule" v-model="to" outlined label="To"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-menu
                                                                v-model="tramenu"
                                                                :close-on-content-click="false"
                                                                :nudge-right="40"
                                                                transition="scale-transition"
                                                                offset-y
                                                                min-width="290px"
                                                            >
                                                                <template v-slot:activator="{ on }">
                                                                <v-text-field 
                                                                outlined
                                                                v-model="tradate"
                                                                label="Travel date"
                                                                v-on="on"
                                                                
                                                                readonly
                                                                ></v-text-field>
                                                                </template>
                                                                <v-date-picker :rules="reqRule" v-model="tradate"></v-date-picker>
                                                            </v-menu>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-menu
                                                                v-model="remenu"
                                                                :close-on-content-click="false"
                                                                :nudge-right="40"
                                                                transition="scale-transition"
                                                                offset-y
                                                                min-width="290px"
                                                            >
                                                                <template v-slot:activator="{ on }">
                                                                <v-text-field 
                                                                outlined
                                                                v-model="redate"
                                                                label="Return date"
                                                                v-on="on"
                                                                
                                                                readonly
                                                                ></v-text-field>
                                                                </template>
                                                                <v-date-picker :rules="reqRule" v-model="redate"></v-date-picker>
                                                            </v-menu>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field @blur="checkPNR(pnr)" :rules="reqRule" v-model="pnr" outlined label="PNR"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field :rules="reqRule" v-model="passname" outlined label="Passenger name"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-autocomplete :rules="reqRule" v-model="vendor" outlined label="Vendor" item-value="id" item-text="name" :items="vendors"></v-autocomplete>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" v-model="pa" outlined label="Purchase amount"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" v-model="sa" outlined label="Sale amount"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" outlined v-model="vps" label="Vendor Payment"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" outlined v-model="vrno" label="Purchase reference no."></v-text-field>
                                                        </v-col>
                                                    </v-row>
                                                    <v-row v-if="svc == 'Bus tickets'">
                                                        <v-col cols="6">
                                                            <v-text-field :rules="reqRule" v-model="from" outlined label="From"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field :rules="reqRule" v-model="to" outlined label="To"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-menu
                                                                v-model="tramenu"
                                                                :close-on-content-click="false"
                                                                :nudge-right="40"
                                                                transition="scale-transition"
                                                                offset-y
                                                                min-width="290px"
                                                            >
                                                                <template v-slot:activator="{ on }">
                                                                <v-text-field 
                                                                outlined
                                                                v-model="tradate"
                                                                label="Travel date"
                                                                v-on="on"
                                                                
                                                                readonly
                                                                ></v-text-field>
                                                                </template>
                                                                <v-date-picker :rules="reqRule" v-model="tradate"></v-date-picker>
                                                            </v-menu>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-menu
                                                                v-model="remenu"
                                                                :close-on-content-click="false"
                                                                :nudge-right="40"
                                                                transition="scale-transition"
                                                                offset-y
                                                                min-width="290px"
                                                            >
                                                                <template v-slot:activator="{ on }">
                                                                <v-text-field 
                                                                outlined
                                                                v-model="redate"
                                                                label="Return date"
                                                                v-on="on"
                                                                
                                                                readonly
                                                                ></v-text-field>
                                                                </template>
                                                                <v-date-picker :rules="reqRule" v-model="redate"></v-date-picker>
                                                            </v-menu>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field @blur="checkPNR(pnr)" :rules="reqRule" v-model="pnr" outlined label="PNR"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field :rules="reqRule" v-model="passname" outlined label="Passenger name"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-autocomplete :rules="reqRule" v-model="vendor" outlined label="Vendor" item-value="id" item-text="name" :items="vendors"></v-autocomplete>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" v-model="pa" outlined label="Purchase amount"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" v-model="sa" outlined label="Sale amount"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" outlined v-model="vps" label="Vendor Payment"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" outlined v-model="vrno" label="Purchase reference no."></v-text-field>
                                                        </v-col>
                                                    </v-row>
                                                    <v-row v-if="svc == 'Visa'">
                                                        <v-col cols="6">
                                                            <v-text-field :rules="reqRule" v-model="country" outlined label="Country"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field :rules="reqRule" v-model="passname" outlined label="Passenger name"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-autocomplete :rules="reqRule" v-model="vendor" outlined label="Vendor" item-value="id" item-text="name" :items="vendors"></v-autocomplete>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" v-model="pa" outlined label="Purchase amount"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" v-model="sa" outlined label="Sale amount"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" outlined v-model="vps" label="Vendor Payment"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" outlined v-model="vrno" label="Purchase reference no."></v-text-field>
                                                        </v-col>
                                                    </v-row>
                                                    <v-row v-if="svc == 'Documents'">
                                                        <v-col cols="6">
                                                            <v-text-field :rules="reqRule" v-model="category" outlined label="Category"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-autocomplete :rules="reqRule" v-model="vendor" outlined label="Vendor" item-value="id" item-text="name" :items="vendors"></v-autocomplete>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" v-model="pa" outlined label="Purchase amount"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" v-model="sa" outlined label="Sale amount"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" outlined v-model="vps" label="Vendor Payment"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" outlined v-model="vrno" label="Purchase reference no."></v-text-field>
                                                        </v-col>
                                                    </v-row>
                                                    <v-row v-if="svc == 'Inbound tour'">
                                                        <v-col cols="6">
                                                            <v-text-field :rules="reqRule" v-model="attraction" outlined label="attraction"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-autocomplete :rules="reqRule" v-model="vendor" outlined label="Vendor" item-value="id" item-text="name" :items="vendors"></v-autocomplete>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" v-model="pa" outlined label="Purchase amount"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" v-model="sa" outlined label="Sale amount"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" outlined v-model="vps" label="Vendor Payment"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" outlined v-model="vrno" label="Purchase reference no."></v-text-field>
                                                        </v-col>
                                                    </v-row>
                                                    <v-row v-if="svc == 'Outbound tour'">
                                                        <v-col cols="6">
                                                            <v-text-field :rules="reqRule" v-model="country" outlined label="Country"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-autocomplete :rules="reqRule" v-model="vendor" outlined label="Vendor" item-value="id" item-text="name" :items="vendors"></v-autocomplete>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" v-model="pa" outlined label="Purchase amount"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" v-model="sa" outlined label="Sale amount"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" outlined v-model="vps" label="Vendor Payment"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" outlined v-model="vrno" label="Purchase reference no."></v-text-field>
                                                        </v-col>
                                                    </v-row>
                                                    <v-row v-if="svc == 'Hotel booking'">
                                                        <v-col cols="6">
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
                                                                outlined
                                                                v-model="fdate"
                                                                label="From"
                                                                v-on="on"
                                                                
                                                                readonly
                                                                ></v-text-field>
                                                                </template>
                                                                <v-date-picker :rules="reqRule" v-model="fdate"></v-date-picker>
                                                            </v-menu>
                                                        </v-col>
                                                        <v-col cols="6">
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
                                                                outlined
                                                                v-model="tdate"
                                                                label="To"
                                                                v-on="on"
                                                                
                                                                readonly
                                                                ></v-text-field>
                                                                </template>
                                                                <v-date-picker :rules="reqRule" v-model="tdate"></v-date-picker>
                                                            </v-menu>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-autocomplete :rules="reqRule" v-model="vendor" outlined label="Vendor" item-value="id" item-text="name" :items="vendors"></v-autocomplete>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" v-model="pa" outlined label="Purchase amount"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" v-model="sa" outlined label="Sale amount"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" :rules="numRule" outlined v-model="vps" label="Vendor Payment"></v-text-field>
                                                        </v-col>
                                                        <v-col cols="6">
                                                            <v-text-field v-on:keyup.enter="addItem" outlined v-model="vrno" label="Purchase reference no."></v-text-field>
                                                        </v-col>
                                                    </v-row>
                                                </v-card-text>
                                                <v-card-actions>
                                                    <v-spacer></v-spacer>
                                                    <v-btn v-if="itemEditing" @click="updateItem" :disabled="!itemValidate" color="blue">Udate</v-btn>
                                                    <v-btn v-if="!itemEditing" @click="addItem" :disabled="!itemValidate" color="green">Save</v-btn>
                                                    <v-btn color="red" @click="clearItemData">Close</v-btn>
                                                </v-card-actions>
                                            </v-card>
                                        </v-form>
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
            {text: 'Service type', value: 'svc'},
            {text: 'Vendor', value: 'vendor'},
            {text: 'Purchase amount', value: 'pa'},
            {text: 'Sale amount', value: 'sa'},
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
        services: ['Air tickets', 'Bus tickets', 'Documents', 'Visa', 'Hotel booking', 'Inbound tour', 'Outbound tour'],
        vendorPayment: ['Paid online', 'Outstanding'],
        vps: null,
        vrno: '',
        snack: false,
        scolor: '',
        stext: '',
        itemEditing: false,
        invEditing: false,
        itemIdex: null,
        selectedInv: {}
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
        getName(cid) {
            return this.$store.getters.loadedCustomer(cid).name
        },
        getVname(vendor) {
            return this.$store.getters.loadedVendor(vendor).name
        },
        editInv(inv) {
            let date = new Date(+inv.idate)
            this.invEditing = true
            this.id = inv.id
            this.dialog = true
            this.cid = inv.cid
            this.idate = date.toISOString().substr(0,10)
            this.ramount = this.checkAmount(inv.payments)
            this.items = inv.items
        },
        printInvoice(inv) {
            var pdfMake = require('pdfmake/build/pdfmake.js')
            if (pdfMake.vfs == undefined){
                var pdfFonts = require('pdfmake/build/vfs_fonts.js')
                pdfMake.vfs = pdfFonts.pdfMake.vfs
            }
            const logo = 'data:image/jpeg;base64,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Otdd+2u4XdhN+c4+lf19fsif8FQfgX+0N8HPDupaV8R/Dol+xRCSG4ulgdG2jIIb6VmS/wDBC39lSW2aL/hTnhYK/UiDmvO/Ef8Awba/sw6ykq2nhnUNHSRy4WxvGiCewxQB9O+Kv26Pg74I0yS61T4keEYrdfm/4/42P5Amvh39vT/g5l+Fvwa0K40L4P2eo/FjxzcAw28OlQM9vbSHgMzAHOOtdz4a/wCDaL9mjQrzzbnSte1Rc/6u61F2X8q+kvgL/wAE1fgf+zQsZ8HfDrw9pksXSY2wkkJ9SW70Afh5+xF/wQx+O3/BU39qaL46/tJI/hzw7cXKXq2N0f391GG3LEF/hUfrX9C3w/8AAmkfCrwbYeH/AA/YxWOm6TCkMEES7VVFGB+lbP8AZ0Z+XA8oDasQGFX8KlaEMmOnGOPSgBIJxOuV6dOlSUioEHHApaACiiigAooooAKKKKACiiigBG6UYpaKPMAqtcFlUYOMnmrNIVB7U15kTi5KyKDWYtSZRBbBu7qgDfnUtvPuG459KtMu4cjP1oCADGB+VNNJbBaTqKTenYhiO65J9qnpNoB6UtJu44xtcKKKKRQUUUUAFFFFADJf6UL0NPooAjqSiim3cbdwooopCCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK4X9p3w14s8a/s7eN9E8Cao2g+Mta0S60/RtVUjdpN1NE0cd2uSAWhZhIBnkoB3r81v+C3OifET/gnn+zv8GNW8CfH745T6v4s+KeieDdWu9U8QRTm6srm2vXmIRYERJGaCM7lUAc4HNAH6x0V826T+xt42+Fv7Rnw58UeHfjD8UvEHhexvL228V+HvEusx31le2kmn3IgnT92riaO7FtgBipV3JGVzWd/wV+/aL8Y/AX9jDWtO+F1vd33xh+I7nwl4GtrQj7QNQnhlkkuU54Ntaw3NxuwQDAuRg0AfUdFfKv8AwRT/AG3W/wCCgv8AwTS+GPxDvbv7Z4lOnDR/EjsfnbU7Q+RPI3AAMpRZwB0E619UTRCeJkO4BwVJVip59COR9RQA6ivx7/b4/bx+KX/BGf8A4Ko6Vqs3iP4hfE79mjWfDdlqHjHRtTmGoyeB0ur6azju7aZv37KskAIEhbd5jRl9zxMv6N/tIeJNM+N/7D/iTxb4N8W6nBZ3HhW68Q+HvEHhzVJLZs/YpJLe4R42AkTkNskDISBuUkDAB7TRXiX/AATvgu0/Yd+F2ua34g1/xFrfiTwjpWt6xqmtalJdTXV1PZQyyyfOdkSlmJ2RhUHp1NdT8J/2vPhP8efFWoaF4G+J/wAO/Get6SC19p2heI7PUbqzAO0mWKGRnTB4+YDmgD0Siuf8Q/Fnwr4R8b6F4Z1XxL4f0zxJ4o87+xdJu9RhhvtX8ld832eFmDzeWpDNsB2g5OBXQUAFFfn5+zH8UPE3/BXT42fH7XLP4jeN/AXwx+E3iyf4c+DIPCWoDT5brUrSFHvtWu3CsboGSaHyIZP3AjX54nZi1af7Dn7c/wAXv26P2CfE9hoh8O6b+0F4F8Y3fwv8S6rJahtN0m9tJ0juNZ+zErvAtWMyQD5HuMRZVNxUA+8KK/If9uDwt+0l/wAEW9b+HPxr0r9pD4h/HTwPqXi3TvDvjnwh4xht5RdxXj7POsPLVRA24EKkYBVmjJLoHU/p7+0vF4vf4GeJn8DeINM8L+JYNOuJrTUr7Sv7Sjt2WJyCIfNjBbcFILFl4OVbNAHd0V8Y/wDBvh+0B4z/AGpv+CQ/wn8ffEHxDf8Airxh4jl1yXUdUvCvm3LJrmoRIMKAqqsaIiqoAVUUAAACuN+Pf/BPz9qP9q3TNc8e237UPjf4N+MLgzXPhLwZoFvAmgaHCNxtbXUSA0l5Ow2efLuKK7uI0dEXcAfoBRXwX/wTO/bl+Nn7fX/BIXR/Glpp+jWvxvuLyfwncahd2yjTIrqG9FrLqzQoyq6xQ7p2hjKrJLE0a7VYY+dP+CiHg/8AaY/4IueEPD/7RWiftMfEP43eG9N1+wsPHfg3xfa2zW2p2tzL5RewSJVW2bzGRVSMAguG3sqsjAH6/wBFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFfmB/wdSf8ms/s7f8AZwHhr/0k1Ov0/r44/wCCt/8AwTC8X/8ABUDwr4G8P2HxV0P4d6L4F8V2njK2V/Br6xdXF/axTRxB5Pt8CeUBPISojycr83HIB9j18GeKvix4w+Mv/BUbWfFvhj4VeI/id4M/Z90ybwZpU+l6xpllBF4kv0guNUm/0u5h3tDaGztVKhgjS3ikg8V9l3mkeM5fhdNZw+IPDMXjRoGWLVm0CZ9MjlLHa5svtgkKhcAr9qBJGdwHy15X/wAE5f2RPFH7En7Pn/CEeKvHek/Ee/Oq3+sTa/b+HH0a81K5vrua8uZrsG7uBLK0szYddgCqq7eM0Afn/wD8EV/F2tfsR/8ABXb9ov8AZv8AFPhXU/h9onxYdvi14G0PUbu1uDaCWRkuoY3tpJYmBUBVw5wunHPOa/Xyvhn9vP8A4JLeO/2tf2/PhN8ffCPxn0L4aa78HEaPR7f/AIQWTVZL6OQ/v4Lyf+0oPMhcNMmxEjIS4kG4k7q+3dGivINItU1Ce2ub9IUW5mt4GghmlCjeyRs7lFLZIUuxAIBZsZIB8l+PPhloHxo/4Ku+NPCXirSbLXvDfiP4EWmn6lp13HvhvIJNbvldGHoQT05HUYIr89tK+IfiX/g3p8dePf2ZviRqGoat+zD8XdI1if4T+LLtzIPDF9NBKX0q5bHyq0jrnHyh3WUACaby/wBPdP8A2SfiPa/8FALr40yfErwjJo134Wg8IN4ZXwVOsgtIr6S8Eovf7SP78+a6bvJ2Y2ny8g56H9v39hHwJ/wUc/Zg8QfC34gWPn6XrEfmWd7Eo+16LeKD5N5bsfuyRk/RlLIwKuwIB+en/BUD423/AMPv+CLn7HPglLq803w18ZtU8CeDPFl3bzNAf7GlsEmurfzVwV85YQjc/NH5qnIJFdj/AMHNPwzsfgF+wr4N+Onw+sNM8KfEb9n3xTpFz4W1HT7RYHtrSScW76eAmAbVzJGzRfdIjxjDHP1H8ev+CXXhD9qr/gmpoX7Onj29ubm00Lw9pemWuuWCeRc2V/YW8cUN9ACTtYMhO0kgq7ITgk1zNx/wTm+I/wC0H4X+HnhT9oT4q+HPiT4N+HOq2etG00nwnJpF34yvbLm0l1WWS8uEaNWxJJDDGiyyBSWCAxkA9e8f/sTfDP8AaM+OXwv+MnjHwcJviL8NIJJfD91JeTodKa4QeYjxqyxylSTt8xDtbJGDXs9eB/H/APZV+IXxX/bG+D3xE8PfGfxJ4L8GfD37b/wkPgqzgLWXjDzo9sfnsJFX5D/z0jkx1Ty2yx98oA/Mz/g1l0258KfsY/GPw1qhYeIfC3xq8SaZrEb7vMjukSz37twDH6kdQR1BFL/wbr6bcav8S/24vF8JdtA8TftCeIhpztkCXy52kdgOmCtxEMjuCO1fQ2vfsBeNfhb+0N8SPHfwN+Img+AE+M3kT+LdM1rw0+s28GoxReSNW08Jc24huWix5iSiWOR0R2GQwZ8v/BOHWPgv/wAE8bX4D/AD4mT/AAjvY1dLjxne6INf1W5M7vLeXODPABdzyuWMxJEYLBEXEbRgDfi98MV/4KF/tNeDrW4jd/g/8DPEa+IrqfA8rxZ4otPMit7WM9WttPdpJJm5V7kRxDJt5lH0X8Wf+SV+Jf8AsFXX/ol6+DbH/glv+2ha+E4PDi/8FCJ9P8OxWy2ItNH+B2g6XJb2wATy7eWGYNAQgwrJynBHSvt74lfDjWNV+Cl54V8Havpfh28fTjplpe6rpsurw20flGMFoluIHkIGOTKM45zmgD40/wCDXH/lBR8DP+4//wCpBqdfTf7YXxT8SaR4QHgb4b+XJ8VfHMElpokjpvg8PQnCT6zdDIxBahw4XIM0pihXBkyvEf8ABKP9gjxF/wAE0P2ONC+DV74+0bx7pHhRrw6Pfw+GJNIuUFzdz3cgnBvbhZcS3D42iP5QAcnk+JXX/BMr9s2D4j+KPEmj/t7WWg3Hiu9+1XEFv8DNHuUt41yIbaKS5u5ZhBEpYIjSEAs7cvI7MAfYP7In7Lvhn9iz9mrwf8LfB0c6eHvBtgLK3edg0905ZpJriUgAGWWV5JXIABaRsAV43+0H8MF/4KH/AB+8K+FJI3f4P/CLxHD4j8R3eAYfFGvWTH7JpMeeHgtZv3102CvmxQwAlluFjq+Gf2Gvj14c/Y78Z+DZP2o77VfjB441F7m6+Jd74KiD6ZamOOJbax02K6jhttiRnayuQHllk2b2BHj+lf8ABLb9tXQvBkPh2w/4KE/2ZotvbCzhttP+BGg2Zt4QNoWN45w0ZA6MpBB5zmgD9FaKzPBXhW38CeDtJ0S0lu57XRrKGxhkupjNPIkSBFaRzy7kKMseScmtOgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/Z'

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
                svc: this.svc,
                vendor: this.vendor,
                pa: this.pa,
                sa: this.sa,
                vps: this.vps,
                vrno: this.vrno
            }
            if(this.itemValidate) {
                if(this.svc == 'Air tickets') {
                    this.items.push({
                        ...item,
                        tradate: this.tradate,
                        redate: this.redate,
                        pnr: this.pnr,
                        from: this.from,
                        passname: this.passname,
                        to: this.to
                    })
                }
                if(this.svc == 'Bus tickets') {
                    this.items.push({
                        ...item,
                        tradate: this.tradate,
                        redate: this.redate,
                        pnr: this.pnr,
                        passname: this.passname,
                        from: this.from,
                        to: this.to
                    })
                }
                if(this.svc == 'Documents') {
                    this.items.push({
                        ...item,
                        category: this.category
                    })
                }
                if(this.svc == 'Visa') {
                    this.items.push({
                        ...item,
                        country: this.country,
                        passname: this.passname
                    })
                }
                if(this.svc == 'Hotel booking') {
                    this.items.push({
                        ...item,
                        fdate: this.fdate,
                        tdate: this.tdate
                    })
                }
                if(this.svc == 'Inbound tour') {
                    this.items.push({
                        ...item,
                        attraction: this.attraction
                    })
                }
                if(this.svc == 'Outbound tour') {
                    this.items.push({
                        ...item,
                        country: this.country
                    })
                }
                this.clearItemData()
            } else {
                this.snack = true
                this.scolor = 'error'
                this.stext = 'All fields are required'
            }
        },

        editItem(item) {
            this.itemIdex = this.items.indexOf(item)
            this.svc = item.svc
            this.vendor = item.vendor
            this.pa = item.pa
            this.sa = item.sa
            this.tradate = item.tradate
            this.pnr = item.pnr
            this.passname = item.passname
            this.from = item.from
            this.to = item.to
            this.country = item.country
            this.fdate = item.fdate
            this.tdate = item.tdate
            this.attraction = item.attraction
            this.vps = item.vps
            this.itemEditing = true
            this.dialog1 = true
        },

        updateItem() {
            this.items.splice(this.itemIdex, 1)
            const item = {
                svc: this.svc,
                vendor: this.vendor,
                pa: this.pa,
                sa: this.sa,
                vps: this.vps
            }
            if(this.itemValidate) {
                if(this.svc == 'Air tickets') {
                    this.items.push({
                        ...item,
                        tradate: this.tradate,
                        redate: this.redate,
                        pnr: this.pnr,
                        from: this.from,
                        to: this.to,
                        passname: this.passname
                    })
                }
                if(this.svc == 'Bus tickets') {
                    this.items.push({
                        ...item,
                        tradate: this.tradate,
                        redate: this.redate,
                        pnr: this.pnr,
                        from: this.from,
                        to: this.to,
                        passname: this.passname
                    })
                }
                if(this.svc == 'Visa') {
                    this.items.push({
                        ...item,
                        country: this.country,
                        passname: this.passname
                    })
                }
                if(this.svc == 'Documents') {
                    this.items.push({
                        ...item,
                        category: this.category
                    })
                }
                if(this.svc == 'Hotel booking') {
                    this.items.push({
                        ...item,
                        fdate: this.fdate,
                        tdate: this.tdate
                    })
                }
                if(this.svc == 'Inbound tour') {
                    this.items.push({
                        ...item,
                        attraction: this.attraction
                    })
                }
                if(this.svc == 'Outbound tour') {
                    this.items.push({
                        ...item,
                        country: this.country
                    })
                }
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
            this.svc = null
            this.vendor = null
            this.pa = null
            this.sa = null
            this.tradate = null
            this.pnr = null
            this.from = null
            this.to = null
            this.country = null
            this.fdate = null
            this.tdate = null
            this.attraction = null
            this.passname = null
            this.vps = null
            this.itemEditing = false
            this.itemIdex = null
            this.dialog1 = false
        },

        async checkPNR(pnr) {
            let invs = this.invs
            for(let i in invs) {
                let dat = invs[i].items.find(i => i.pnr == pnr)
                if(dat){
                    this.$store.dispatch('createAlert',{type: 'error', message: 'PNR already exists!!!'})
                    this.snack = true
                    this.scolor = 'error'
                    this.stext = 'PNR already exists!!!'
                    this.pnr = null
                }
            }
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
                amount: this.amount,
                createdby: this.user.id,
                payments: payment,
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

        vendors() {
            let vendors = this.$store.getters.loadedVendors
            let filtVen = vendors.filter((item) => {
                return item.deleted == false
            })
            return filtVen
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

    components: {
        AddCustomerVue
    }
}
</script>