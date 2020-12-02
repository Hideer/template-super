export default {
  /**
   * showToast封装
   * 由于微信环境先调用showToast后调用hideLoading会把toast关闭，所以此处放在setTimeout里调用，保证在一个事件循环里hideLoading先执行
   * 真机延时0就好了，但是模拟器需加长
   * @param {string} text
   */
  toast(param: string | UniApp.ShowToastOptions) {
    setTimeout(() => {
      if (typeof param === 'string') {
        uni.showToast({
          title: param,
          duration: 3000,
          icon: 'none',
        });
      }
      if (typeof param === 'object') {
        uni.showToast({
          duration: 3000,
          icon: 'none',
          ...param,
        });
      }
    }, 10);
  },

  /**
   * 显示loading
   */
  showLoading(data: UniApp.ShowLoadingOptions) {
    // loadingCount++;
    uni.showLoading({
      title: '加载中',
      ...data,
    });
  },

  /**
   * 显示loading
   */
  hideLoading() {
    // loadingCount--;
    // if (loadingCount === 0) {
    uni.hideLoading();
    // }
  },

  /**
   * 反转时间戳
   * return [时间戳，反转时间戳]
   */
  getReverseTime() {
    const time = new Date().getTime();

    return {
      time,
      reversetime: time
        .toString()
        .split('')
        .reverse()
        .join(''),
    };
  },

  /**
   * 导航跳转时带复杂参数先存到globalData里
   * @param {*} data
   */
  setNavData(data: any) {
    const app: any = getApp();
    app.globalData.navigateData = data;
    return app.globalData.navigateData;
  },
  /**
   * 导航跳转时带复杂参数从globalData里取出来
   * @param {*} data
   */
  getNavData() {
    const app: any = getApp();
    return app.globalData.navigateData;
  },

  /**
   * 身份证获取年龄
   * @param identityCard
   */
  getAgeByIDNum(identityCard: string) {
    var len = (identityCard + '').length;
    if (len == 0) {
      return 0;
    } else {
      if (len != 15 && len != 18) {
        //身份证号码只能为15位或18位其它不合法
        return 0;
      }
    }
    var strBirthday = '';
    if (len == 18) {
      //处理18位的身份证号码从号码中得到生日和性别代码
      strBirthday =
        identityCard.substr(6, 4) +
        '/' +
        identityCard.substr(10, 2) +
        '/' +
        identityCard.substr(12, 2);
    }
    if (len == 15) {
      strBirthday =
        '19' +
        identityCard.substr(6, 2) +
        '/' +
        identityCard.substr(8, 2) +
        '/' +
        identityCard.substr(10, 2);
    }
    //时间字符串里，必须是“/”
    var birthDate = new Date(strBirthday);
    var nowDateTime = new Date();
    var age = nowDateTime.getFullYear() - birthDate.getFullYear();
    //再考虑月、天的因素;.getMonth()获取的是从0开始的，这里进行比较，不需要加1
    if (
      nowDateTime.getMonth() < birthDate.getMonth() ||
      (nowDateTime.getMonth() == birthDate.getMonth() &&
        nowDateTime.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  },

  /**
   * 身份证获取性别
   *
   * @param {*} psidno
   * @param {*} type
   */
  getSex(psidno: string, type: string | number) {
    const sexMap: { [x: string]: any }[] = [
      { label: '女', value: '2' },
      { label: '男', value: '1' },
    ];

    let sexno: number, sexIndex: number;

    if (psidno.length == 18) {
      sexno = Number(psidno.substring(16, 17));
    } else if (psidno.length == 15) {
      sexno = Number(psidno.substring(14, 15));
    } else {
      return false;
    }
    sexIndex = sexno % 2;

    return type ? sexMap[sexIndex][type] : sexMap[sexIndex].label;
  },

  /**
   * 手机号，姓名，身份证 / 任意类型 前端脱敏显示处理
   *
   * @param param0 { type:手机号，姓名，身份证 ,beginLen, endLen,开头和结尾的index }
   */
  desensitizeInfo({ strVal, type, beginLen, endLen }: desensitizeInfoProps) {
    if (typeof strVal !== 'string') {
      strVal = strVal + '';
    }
    if (type) {
      let returnStr = '';
      switch (type) {
        // 姓名 X* 或者 X*X
        case 'name':
          // eslint-disable-next-line no-case-declarations
          const firstWord = strVal.substring(0, 1);
          // eslint-disable-next-line no-case-declarations
          const lastWord = strVal.substring(strVal.length - 1, strVal.length);
          returnStr = `${firstWord}*${strVal.length >= 3 ? lastWord : ''}`;
          break;

        // 手机号 123****1234 前3后4
        case 'tel':
          returnStr = `${strVal.substring(0, 3)}****${strVal.substring(
            strVal.length - 4,
            strVal.length
          )}`;
          break;

        // 身份证 前6后4
        case 'idValue':
          returnStr = `${strVal.substring(0, 6)}******${strVal.substring(
            strVal.length - 4,
            strVal.length
          )}`;
          break;

        default:
          break;
      }
      return returnStr;
    } else {
      const len = strVal.length;
      const firstStr = strVal.substr(0, beginLen);
      const lastStr = strVal.substr(endLen);
      const middleStr = strVal.substring(beginLen, len - Math.abs(endLen)).replace(/[\s\S]/gi, '*');
      return firstStr + middleStr + lastStr;
    }
  },

  /**
   * 传入对象返回url参数
   * @param {Object} data {a:1}
   * @returns {string}
   */
  getParam(data: { [x: string]: any }) {
    let url = '';
    for (var k in data) {
      let value = data[k] !== undefined ? data[k] : '';
      // url += `&${k}=${encodeURIComponent(value)}`;
      url += `&${k}=${value}`;
    }
    return url ? url.substring(1) : '';
  },

  /**
   * 将url和参数拼接成完整地址
   * @param {string} url url地址
   * @param {Json} data json对象
   * @returns {string}
   */
  getUrl(url: string | string[], data: any) {
    //看原始url地址中开头是否带?，然后拼接处理好的参数
    return (url +=
      (url.indexOf('?') < 0 ? '?' : url.indexOf('&') < 0 ? '&' : '') + this.getParam(data));
  },

  /**
   * 获取路由中某个参数值
   * @param {*} name  参数名
   * @param {*} url  路由路径
   */
  getQueryString(name: string, url: string) {
    const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    const r = (url && url.split('?')[1].match(reg)) || window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  },

  /**
   * 禁止支付宝的下拉页面
   * 使用mescroll时使用
   */
  setAlipayNoPullDown(type = false) {
    console.log(type);
    // #ifdef MP-ALIPAY
    // my.setCanPullDown({
    //   canPullDown: type,
    // });
    // #endif
  },

  /**
   * 生成唯一id
   */
  GUID() {
    function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
  },

  /**
   * 判断一个变量是否为空
   * @param v
   */
  isEmpty(v: string | any[] | null | undefined) {
    if (
      v === '' ||
      (Array.isArray(v) && !v.length) ||
      JSON.stringify(v) === '{}' ||
      v === void 0 ||
      v === null
    ) {
      return '空';
    } else {
      return v;
    }
  },

  /**
   * 授权消息通知
   */
  getSetting() {
    return new Promise((resolve, reject) => {
      uni.getSetting({
        withSubscriptions: true,
        success(res) {
          const { mainSwitch, itemSettings = {} } = res.subscriptionsSetting;
          console.log(mainSwitch, itemSettings);
          const tmplIds = ['tZXLQHbAYsDOMIdKQMMtYNBAAtNWJp43SoCBiNEXXig'];

          if (mainSwitch) {
            wx.requestSubscribeMessage({
              tmplIds, // 最多三个
              success(res) {
                console.log('wx.requestSubscribeMessage,微信授权成功', res);
                resolve(res);
              },
              fail(err) {
                console.log(err);
                reject(err);
              },
            });
          }
        },
        fail(err) {
          reject(err);
        },
      });
    });
  },
};

// -------------- ts 类型定义 start ---------------

export type desensitizeInfoProps = {
  strVal?: string;
  type: string;
  beginLen: number;
  endLen: number;
};

// -------------- ts 类型定义 end  ---------------
