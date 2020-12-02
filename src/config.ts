const envConfig: { [x: string]: any } = {
  dev: {
    authPrefix: 'http://192.168.35.12:8080',
    imBusPrefix: 'http://192.168.34.223:8081',
    imServerPrefix: 'ws://192.168.34.223:8082',
    logPrefix: '192.168.37.60:8080:18088',
  },
  test: {},
  prer: {},
  prod: {},
};

export default {
  // release: 发布版 debug: 测试版(可切换环境)
  buildType: 'debug',

  // 请求开启加密时打印log
  isLog: true,

  amapKey: '',

  aesKey: '',

  aesKeyDatav: '', // 线上环境

  // 接口全局加密
  isEncrypt: true,

  // AES加密key 用于获取实名认证信息接口的加解密
  alipayEncrypt: '',
  shareAESKey: '',

  // AES加密key 用于支付宝环境获取ticket、token流程里的加解密
  AESKey: '',

  alipayAppId: '',
  weixinAppId: '',

  // 请求错误报错文案
  serverErrorText: '服务器出错，请稍后重试',
  httpErrorText: (code: any) => `网络请求错误（${code}），请稍后重试`,
  networkErrorText: '网络连接失败，请检查网络后重试',

  // 获取当前环境的配置

  getEnv() {
    return uni.getStorageSync('debug_env') || 'dev';
  },
  getEnvConfig() {
    if (this.buildType === 'release') {
      return envConfig.prod;
    }
    const env: string = this.getEnv();
    return envConfig[env];
  },
};
