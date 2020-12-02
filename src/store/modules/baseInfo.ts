// 用户模块
const state = {
  userInfo: {},
  token: '',
};

const mutations = {
  SET_BASE_INFO: (state: { [x: string]: any }, payload: { [x: string]: any }) => {
    Object.keys(payload).forEach(key => {
      state[key] = payload[key];
    });
  },
};

const actions = {
  setBaseInfo({ commit }: any, data: any) {
    commit('SET_BASE_INFO', data);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
