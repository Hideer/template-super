import config from '@/config';
import store from '@/store';
import utils from '@/utils';

/**
 * 网络请求 封装成promise、抹平fail平台差异、res.data.success不为true自动报错（并进入promise catch）
 * uni.request的promise模式catch时不方便处理，自己用回调封装成promise
 * 微信环境405等http错误走的success回调，支付宝走的fail
 * @param {String} url 请求url
 * @param {Object} options.data 请求数据
 * @param {Boolean} options.isToast 是否需要touast提示
 * @param {Boolean | string} options.isShowLoading 是否显示loading | 如果传入string则为加载显示的文字
 * @param {Boolean} options.isPrefix 是否自定义请求前缀
 * @param {*} rest 其他uni.request参数，如data、header method默认：POST
 */

const request: requestProps = (
  url,
  { data, isToast, isShowLoading, isPrefix, method = 'POST', ...rest } = {}
) => {
  isShowLoading &&
    uni.showLoading({
      title: utils.getVarType(isShowLoading) === 'Sring' ? isShowLoading : '加载中',
    });

  // 加上全局通用
  data = {
    ...(data || {}),
  };

  if (config.isLog) {
    // 接口日志
    console.log(`${url}⬇️⬇️⬇️`, data);
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: isPrefix ? url : config.getEnvConfig().apiPrefix + url, // 自定义服务地址 或 全局配置服务
      data,
      dataType: 'text',
      header: setRequestHeader(data),
      method,
      // 微信环境405等http错误也会进此回调
      success: (res: any) => {
        // TODO: 根据接口返回约定，定义对应类型结构
        if (res.statusCode === 200) {
          res.data = JSON.parse(res.data);

          if (config.isLog) {
            // 接口日志
            console.log(`${url}⬇️⬇️⬇️`, res.data);
          }

          resolve(res);
        } else {
          isToast && utils.toast(`error:接口请求状态码${res.statusCode}!`);
          reject(res);
        }
      },
      fail: (err: any) => {
        isToast && utils.toast(`error:请求超时，请检查网络环境!`);
        reject(err);
      },
    });
  }).then(
    (res: any) => {
      // resolve
      isShowLoading && uni.hideLoading();

      const data = res.data;

      if (data.success) {
        return Promise.resolve(data);
      }

      // 这里处理业务级别的错误提示，根据具体服务约定是通过code还是通过接口请求http状态码statusCode的全局控制
      isToast &&
        utils.toast(
          (data.errMsg && `${data.errMsg}${data.errCode ? '(' + data.errCode + ')' : ''})`) ||
            data.data ||
            config.serverErrorText
        );

      // 服务端返回errMsg，Promise返回reject
      return Promise.reject(data);
    },
    (err) => {
      // reject
      isShowLoading && uni.hideLoading();
      return Promise.reject(err);
    }
  );
};

/**
 * 生成请求头部
 * @param {Object} param 签名
 * @param {Number} bqtime 时间戳
 */
function setRequestHeader(param: any) {
  const token = store.state.baseInfo.token || '';

  let reqHeader: { [x: string]: string } = {
    ...param,
  };

  // 添加请求来源
  // #ifdef MP-ALIPAY
  reqHeader['terminal-type'] = 'alimini';
  // #endif
  // #ifdef MP-WEIXIN
  reqHeader['terminal-type'] = 'weixinmini';
  // #endif

  return {
    ...reqHeader,
    token, // 请求令牌
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
