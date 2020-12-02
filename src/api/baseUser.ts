/**
 *
 * 用户基础
 *
 */
import io, { requestProps, requestParamsProps } from '@/utils/request';

export default {
  /**
   * 我的-个人信息
   * @param {*} data
   */
  getUserInfo(data: requestParamsProps) {
    let opts = {
      url: '/bookingapi/meduser/ext/query',
    };
    return io(opts.url, data);
  },
};
