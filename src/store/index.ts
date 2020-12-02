import Vue from 'vue';
import Vuex from 'vuex';

import getters from './getters';
// 业务模块
import baseInfo from './modules/baseInfo';

Vue.use(Vuex);
export default new Vuex.Store({
  modules: {
    baseInfo,
  },
  getters,
});
