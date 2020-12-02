import Vue from 'vue';
import App from './App.vue';
import store from './store';
import dayjs from 'dayjs';

import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');

Vue.prototype.$dayjs = dayjs;

Vue.config.productionTip = false;

new App({
  store,
}).$mount();
