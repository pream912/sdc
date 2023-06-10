<template>
    <div>
        <v-navigation-drawer app clipped v-model="drawer">
            <v-list dense nav>
                <v-list-item link to="/">
                    <v-list-item-icon>
                        <v-icon> mdi-land-plots </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Dashboard</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link to="/customers">
                    <v-list-item-icon>
                        <v-icon> mdi-human-queue </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Customers</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link to="/services">
                    <v-list-item-icon>
                        <v-icon> mdi-briefcase-account </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Services</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link to="/invoice">
                    <v-list-item-icon>
                        <v-icon> mdi-cash-register </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Invoice</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link to="/ppayment">
                    <v-list-item-icon>
                        <v-icon> mdi-cash-register </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Pending payments</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <!-- <v-list-group
                    :value="false"
                    prepend-icon="mdi-book-open-variant"
                >
                    <template v-slot:activator>
                            <v-list-item-title>Reports</v-list-item-title>
                    </template>
                    <v-list-item class="ml-4" link to="/invreports">
                        <v-list-item-content>
                            <v-list-item-title>Invoice reports</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item class="ml-4" link to="/svcreports">
                        <v-list-item-content>
                            <v-list-item-title>Service wise reports</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item class="ml-4" link to="/preports">
                        <v-list-item-content>
                            <v-list-item-title>Purchase reports</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item class="ml-4" link to="/cusreports">
                        <v-list-item-content>
                            <v-list-item-title>Customer reports</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item class="ml-4" link to="/venreports">
                        <v-list-item-content>
                            <v-list-item-title>Vendor reports</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item class="ml-4" link to="/outreports">
                        <v-list-item-content>
                            <v-list-item-title>Customer Outstanding</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item class="ml-4" link to="/voutreports">
                        <v-list-item-content>
                            <v-list-item-title>Vendor Outstanding</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-group> -->
                
                <v-list-item v-if="isAdmin" link to="/users">
                    <v-list-item-icon>
                        <v-icon> mdi-cog </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>Settings</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
            <template v-slot:append>
                <div class="pa-2">
                    <v-switch label="Dark mode" v-model="$vuetify.theme.dark"></v-switch>
                </div>
                <div class="pa-2">
                    <v-btn @click="logout" color="orange">Logout</v-btn>
                </div>
            </template>
        </v-navigation-drawer>
        <v-app-bar app clipped-left>
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <v-toolbar-title>Smile Dental Care</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-avatar>
                <v-icon>
                    mdi-account-circle
                </v-icon>
            </v-avatar>
            {{user.user_metadata.name}}
        </v-app-bar>
        <v-main>
            <v-alert :value="alert.alert" :type="alert.type">{{alert.message}}</v-alert>
            <router-view/>
        </v-main>
    </div>
</template>

<script>
import {supabase} from '../supabase'
export default {
  data: () => ({
    drawer: true,
  }),
  methods: {
    logout() {
        supabase.auth.signOut()
    }
  },
  computed: {
    alert () {
        return this.$store.getters.loadedAlert
    },
    user() {
        return supabase.auth.user()
    },
    isAdmin() {
        return this.$store.getters.isAdmin
    }
  }
};
</script>
