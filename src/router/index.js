import Vue from 'vue'
import VueRouter from 'vue-router'
import Customers from '../components/customers/Customers.vue'
import Services from '../components/services/Services.vue'
import Invoice from '../components/invoices/Invoice.vue'
import Pending from '../components/invoices/PendingPayments.vue'
import Users from '../components/Users.vue'
import Dashboard from '../components/Dashboard'
import Reports from '../components/Reports'
import InvReports from '../components/reports/InvReports'
import ServiceReport from '../components/reports/ServiceReport'
import PurchaseReport from '../components/reports/PurchaseReport'
import CustomerReport from '../components/reports/CustomerReport'
import VendorReport from '../components/reports/VendorReport'
import OutStanding from '../components/reports/OutStanding'
import VoutStanding from '../components/reports/VoutStanding'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Dashboard
  },
  {
    path: '/customers',
    component: Customers
  },
  {
    path: '/services',
    component: Services
  },
  {
    path: '/invoice',
    component: Invoice
  },
  {
    path: '/ppayment',
    component: Pending
  },
  {
    path: '/users',
    component: Users
  },
  {
    path: '/reports',
    component: Reports
  },
  {
    path: '/invreports',
    component: InvReports
  },
  {
    path: '/svcreports',
    component: ServiceReport
  },
  {
    path: '/preports',
    component: PurchaseReport
  },
  {
    path: '/cusreports',
    component: CustomerReport
  },
  {
    path: '/venreports',
    component: VendorReport
  },
  {
    path: '/outreports',
    component: OutStanding
  },
  {
    path: '/voutreports',
    component: VoutStanding
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
