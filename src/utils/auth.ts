import config from '@/config';
import utils from '@/utils';
import store from '@/store';
import request from './request';
import bqApi from '@/api';

// import { encodeParams, decodeResponse, encryptByAES, decryptByAES } from './encrypt';

// 无网络无返回 / statusCode !== 200
function failCbk({ err, fail }: uniAuthProps) {
  if (err.statusCode) {
    utils.toast(config.httpErrorText(err.statusCode));
  } else {
    utils.toast(config.networkErrorText);
  }
  uni.hideLoading();
  fail && fail(err);
}

// 接口请求服务报错回调 通过success === false 拦截
function serverErrorCbk({ result, fail }: uniAuthProps) {
  utils.toast(result.errMsg || config.serverErrorText);
  uni.hideLoading();
  fail && fail(result);
}

// 获取ticket
function getTicket({ success, fail }: uniAuthProps) {
  const { userName, certNo, mobile } = store.state.baseInfo.userInfo;
  const defaultData = {
    idName: userName,
    idNum: certNo,
    mobile,
    isAliUser: true,
  };
  console.log('ticket_api', defaultData, config.AESKey);
  // const aesData = encryptByAES(JSON.stringify(defaultData), config.AESKey);
  const aesData = '';

  const { reversetime } = utils.getReverseTime();

  uni.request({
    url: `${config.getEnvConfig().authPrefix}/bookingapi/login/ticket`,
    method: 'POST',
    data: encodeURIComponent(aesData),
    dataType: 'text',
    header: {
      ua: 'BQHospital',
      bqtime: reversetime,
      'terminal-type': 'alimini',
    },
    success: res => {
      if (res.statusCode === 200) {
        // const result = JSON.parse(decryptByAES(res.data, config.AESKey));
        const result = JSON.parse('{}');
        const data = result.data || {};
        if (result.success) {
          store.dispatch('baseInfo/setBaseInfo', {
            userCode: data.userCode,
          });
          getToken({ success, fail, data });
        } else {
          serverErrorCbk({ result, fail });
        }
      } else {
        failCbk({ res, fail });
      }
    },
    fail: err => failCbk({ err, fail }),
  });
}

// 获取token
function getToken({ data, success, fail }: uniAuthProps) {
  const { reversetime } = utils.getReverseTime();
  // const aesData = encryptByAES(JSON.stringify({ ticket: data.ticket }), config.AESKey);
  const aesData = '';

  uni.request({
    url: `${config.getEnvConfig().authPrefix}/bookingapi/login/token`, // /face/archive/token
    method: 'POST',
    data: encodeURIComponent(aesData),
    dataType: 'text',
    header: {
      ua: 'BQHospital',
      bqtime: reversetime,
      'terminal-type': 'alimini',
    },
    success: res => {
      if (res.statusCode === 200) {
        // const result = JSON.parse(decryptByAES(res.data, config.AESKey));
        const result = JSON.parse('{}');

        if (result.success) {
          uni.hideLoading();
          const data = result.data || {};
          store.dispatch('baseInfo/setBaseInfo', {
            token: data.token,
            privateKey: data.privateKey,
          });

          // // 家医特殊逻辑 Start
          // let channelUserId = '';
          // // #ifdef MP-ALIPAY
          // channelUserId = store.state.baseInfo.userInfo.userId;
          // // #endif
          // // #ifdef MP-WEIXIN
          // channelUserId = store.state.baseInfo.userInfo.openid;
          // // #endif
          // bqApi.homeDoctor.postUserInfoToIM({
          //   data: {
          //     appId: config.imAppId,
          //     userId: store.state.baseInfo.userInfo.certNo,
          //     token: store.state.baseInfo.userInfo.certNo,
          //     expire: '',
          //     pushId: channelUserId,
          //   },
          // });
          // // 家医特殊逻辑 End

          success(store.state);
        } else {
          serverErrorCbk({ result, fail });
        }
      } else {
        failCbk({ res, fail });
      }
    },
    fail: err => failCbk({ err, fail }),
  });
}

// #ifdef MP-ALIPAY
function alipayAuth({ success, fail }: uniAuthProps) {
  // 已有token表示已进行授权操作
  if (store.state.baseInfo.token) {
    success(store.state);
    return;
  }

  uni.showLoading({
    title: '登录授权中',
  });

  my.getAuthCode({
    scopes: 'auth_user', // 用户主动授权
    success: res => {
      const { authCode } = res;
      const payload = {
        appId: config.alipayAppId,
        dataSources: 1, // 数据来源为 1：支付宝小程序
        authToken: authCode,
        authCode,
      };
      console.log('参数', payload, config.alipayEncrypt);
      // const encryptData = encodeParams(payload, config.alipayEncrypt);
      const encryptData = {};

      const { reversetime } = utils.getReverseTime();
      // todo 老的支付宝H5端需求
      uni.request({
        url: `${config.getEnvConfig().authPrefix}/bookingapi/login/alipay/user/info/share`,
        method: 'POST',
        data: encryptData,
        dataType: 'text',
        header: {
          ua: 'BQHospital',
          bqtime: reversetime,
          'terminal-type': 'alimini',
        },
        success: res => {
          if (res.statusCode === 200) {
            // const result = decodeResponse(res.data, config.alipayEncrypt);
            const result: any = {};
            if (result.success) {
              const userInfo = result.data;
              store.dispatch('baseInfo/setBaseInfo', {
                userInfo: {
                  ...userInfo,
                  sex: parseInt(userInfo.certNo.substr(-2, 1)) % 2 === 0 ? '女' : '男',
                  age: new Date().getFullYear() - parseInt(userInfo.certNo.substr(6, 4)),
                },
              });
              getTicket({ success, fail });
            } else {
              serverErrorCbk({ result, fail });
            }
          } else {
            failCbk({ res, fail });
          }
        },
        fail: err => failCbk({ err, fail }),
      });
    },
    fail: () => {
      setTimeout(() => {
        // todo ios 获取不到当前page实例 暂时使用延时器
        uni.hideLoading();
        utils.toast('支付宝授权失败，请检查网络并重试');
        fail && fail();
      }, 800);
    },
  });
}
// #endif

// #ifdef MP-WEIXIN
function weixinAuth({ success, fail }: uniAuthProps) {
  // 已有token表示已进行授权操作
  if (store.state.baseInfo.token) {
    success(store.state);
    return;
  }

  uni.showLoading({
    title: '登录授权中',
  });

  wx.login({
    success: res => {
      const code = res.code;
      console.log('-------wx.login-------', res);
      request(
        '/bookingapi/login/wechat/user/info/share',
        {}
        // ,
        // {
        //   data: {
        //     appId: config.weixinAppId,
        //     code,
        //   },
        //   encryptKey: config.shareAESKey,
        // }
      )
        .then((res: any) => {
          const userInfo = res.data;

          store.dispatch('baseInfo/setBaseInfo', {
            bqBaseAccessToken: userInfo.bqBaseAccessToken,
          });

          if (userInfo.certNo) {
            // 有用户身份证
            store.dispatch('baseInfo/setBaseInfo', {
              userInfo: {
                ...userInfo,
                sex: parseInt(userInfo.certNo.substr(-2, 1)) % 2 === 0 ? '女' : '男',
                age: new Date().getFullYear() - parseInt(userInfo.certNo.substr(6, 4)),
              },
            });

            getTicket({ success, fail });
          } else {
            // 进行用户认证
            // wxAuth({ success, fail });
          }
        })
        .catch(() => {
          fail && fail();
        })
        .finally(() => {
          uni.hideLoading();
        });
    },
    fail: e => {
      fail && fail();
      console.log(e);
      utils.toast('微信授权失败，请检查网络并重试');
    },
  });
}

// function wxAuth({ success, fail }: uniAuthProps) {
//   const { userInfo } = store.state.baseInfo;
//   console.log('用户未认证！！！', userInfo, store.state, success, fail);
//   uni.navigateTo({
//     url: '/pages/auth/home/index',
//   });
// }
// #endif

export default {
  uniAuth({ success, fail }: uniAuthProps) {
    // #ifdef MP-ALIPAY
    alipayAuth({ success, fail });
    // #endif
    // #ifdef MP-WEIXIN
    weixinAuth({ success, fail });
    // #endif
  },

  // // #ifdef MP-ALIPAY
  // alipay,
  // // #endif
  // // #ifdef MP-WEIXIN
  // wxAuth,
  // weixinLogin,
  // // #endif
};

// -------------- ts 类型定义 start ---------------

export interface uniAuthProps {
  success?: any;
  fail?: any;
  [x: string]: any;
}

// -------------- ts 类型定义 end  ---------------
