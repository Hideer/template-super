import config from '@/config';
import store from '@/store';
import utils from '@/utils';
// import Jsrsasign from 'jsrsasign';
// import { encryptByAES, decryptByAES } from './encrypt';

/**
 * 网络请求 封装成promise、抹平fail平台差异、res.data.success不为true自动报错（并进入promise catch）
 * uni.request的promise模式catch时不方便处理，自己用回调封装成promise
 * 微信环境405等http错误走的success回调，支付宝走的fail
 * @param {String} url 请求url
 * @param {Object} options.data 请求数据
 * @param {Boolean} options.noToast 请求失败是否不自动报错
 * @param {Boolean} options.showLoading 是否显示loading
 * @param {Boolean} options.noEncrypt 是否不加密
 * @param {Boolean} options.isPrefix 是否前缀
 * @param {String} encryptKey 加密key
 * @param {String} datavEncrypt datav是否加密
 * @param {*} rest 其他uni.request参数，如data、header method默认：POST
 */

const request: requestProps = (
  url,
  {
    data,
    noToast,
    showLoading,
    noEncrypt,
    encryptKey,
    isPrefix,
    datavEncrypt,
    is360CloudImg = false,
    ...rest
  } = {}
) => {
  showLoading &&
    uni.showLoading({
      title: '加载中',
    });
  const openEncrypt = !noEncrypt && config.isEncrypt;
  const { reversetime, time } = utils.getReverseTime();

  const newEncryptKey = encryptKey || 'zbq' + time;
  let newData = {};

  // 加上全局通用
  data = {
    // orgCode: config.orgCode, // orgCode 是机构编码 一般是从机构注册号中截取的9位
    // branchCode: config.branchCode, // branchCode是分院编码  在机构码的基础上增加院区拼音或其他
    // medOrgCode: config.orgCode, // 同 orgCode
    // medOrgBranchCode: config.branchCode, // 同 branchCode
    // groupOrgCode: config.groupOrgCode, //groupOrgCode  是机构组的意思 标识 某个区域汇中所有的机构
    // orgGroupCode: config.groupOrgCode, //orgGroupCode = groupOrgCode
    userCode: store.state.baseInfo.userCode,
    bqBaseAccessToken: store.state.baseInfo.bqBaseAccessToken,
    ...(data || {}),
  };

  // 处理历史遗留问题，赋值  todo 需找接口统一处理下！
  data.medOrgCode = data.orgCode;
  data.medOrgBranchCode = data.branchCode;
  data.orgGroupCode = data.groupOrgCode;

  if (openEncrypt) {
    if (config.isLog) {
      console.log(`${url}⬆️⬆️⬆️`, data, JSON.stringify(data));
    }
    // newData = encodeURIComponent(encryptByAES(JSON.stringify(data), newEncryptKey));
    newData = encodeURIComponent(JSON.stringify(data));
  } else {
    newData = data;
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: isPrefix ? url : config.getEnvConfig().apiPrefix + url,
      data: newData,
      dataType: 'text',
      header: setRequestHeader(data, reversetime),
      method: 'POST',
      // 微信环境405等http错误也会进此回调
      success: res => {
        if (res.statusCode === 200) {
          if (openEncrypt) {
            // res.data = decryptByAES(res.data, newEncryptKey);
          }
          if (datavEncrypt) {
            let data = JSON.parse((<any>res).data);

            console.log('datav加解密', res, data);

            if (!data.success) {
              return reject({
                ...res,
                data: JSON.parse((<any>res).data),
              });
            }

            // res.data = decryptByAES(data.bizInterfaceData, config.aesKeyDatav);
          }
          res.data = JSON.parse((<any>res).data);
          if (config.isLog) {
            console.log(`${url}⬇️⬇️⬇️`, res.data);
          }
          resolve(res);
        } else {
          reject(res);
        }
      },
      fail: err => {
        reject(err);
      },
      ...rest,
    });
  }).then(
    res => {
      const data = (<any>res).data;
      showLoading && uni.hideLoading();
      if (data.success) {
        return Promise.resolve(data);
      }
      if (!noToast) {
        utils.toast(
          (data.errMsg && `${data.errMsg}${data.errCode ? '(' + data.errCode + ')' : ''})`) ||
            data.data ||
            config.serverErrorText
        );
      }
      // 服务端返回errMsg，Promise返回reject
      return Promise.reject(data);
    },
    err => {
      console.log(err);
      showLoading && uni.hideLoading();
      if (!noToast) {
        if (err.statusCode) {
          utils.toast(config.httpErrorText(err.statusCode));
        } else {
          utils.toast(config.networkErrorText);
        }
      }
      return Promise.reject(err);
    }
  );
};

// /**
//  * 签名
//  * @param {string} str
//  * @param {string} pri
//  */
// function getSignTxt(str, pri) {
//   if (!str || !pri) {
//     return;
//   }
//   let signTxt;
//   const privateKey = `-----BEGIN PRIVATE KEY-----${pri}-----END PRIVATE KEY-----`;
//   const signature = new Jsrsasign.KJUR.crypto.Signature({
//     alg: 'SHA256withRSA',
//     prvkeypem: privateKey,
//   });
//   signature.updateString(str);
//   signTxt = Jsrsasign.hextob64(signature.sign());
//   return signTxt;
// }

/**
 * 生成请求头部
 * @param {String} param 签名
 * @param {Number} bqtime 时间戳
 */
function setRequestHeader(param: any, bqtime: string) {
  const privateKey = store.state.baseInfo.privateKey || '';
  const token = store.state.baseInfo.token || '';

  // 请求参数签名加密
  // const sign = getSignTxt(JSON.stringify(param), privateKey);

  let reqHeader: { [x: string]: string } = {};

  // #ifdef MP-ALIPAY
  reqHeader['terminal-type'] = 'alimini';
  // #endif

  // #ifdef MP-WEIXIN
  reqHeader['terminal-type'] = 'weixinmini';
  // #endif

  return {
    ua: 'BQHospital', // ua项目标
    token, // 请求令牌
    // sign, // 请求签名
    bqtime, //反转13位时间戳
    ...reqHeader,
  };
}

export default request;

// -------------- ts 类型定义 start ---------------

export interface requestParamsProps {
  [x: string]: any;
}
export type requestProps = (url: string, {}: requestParamsProps) => any;
export type requestProps2 = (url: string) => any;

// -------------- ts 类型定义 end ---------------
