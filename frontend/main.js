import 'bootstrap/dist/css/bootstrap.css';

import Vue from 'vue';
import VueRouter from 'vue-router';

import App from './App.vue';
import HomePage from './pages/HomePage.vue';
import UploadPage from './pages/UploadPage.vue';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes: [
    {path: '/', name: 'home', component: HomePage},
    {path: '/upload', name: 'upload', component: UploadPage}
  ]
});

import * as axios from 'axios';
Vue.prototype.$axios = axios;

new Vue({
  el: "#app",
  router: router,
  render: h => h(App)
});
