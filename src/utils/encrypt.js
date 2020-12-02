import Utf8 from 'crypto-js/enc-utf8';
import Base64 from 'crypto-js/enc-base64';
import modeECB from 'crypto-js/mode-ecb';
import padPkcs7 from 'crypto-js/pad-pkcs7';
import AES from 'crypto-js/aes';

import CryptoJS from 'crypto-js';

/**
 * AES加密
 */
export function encryptByAES(message, key) {
  const keyHex = Utf8.parse(key);
  const encrypted = AES.encrypt(message, keyHex, {
    mode: modeECB,
    padding: padPkcs7,
  });

  return encrypted.toString();
}

/**
 * AES解密
 */
export function decryptByAES(ciphertext, key) {
  const keyHex = Utf8.parse(key);
  const decrypted = AES.decrypt(
    {
      ciphertext: Base64.parse(ciphertext),
    },
    keyHex,
    {
      mode: modeECB,
      padding: padPkcs7,
    }
  );

  return decrypted.toString(Utf8);
}

/**
 * aes数据加解密
 * 调/alipay/user/info/share时使用
 * @export
 * @param {*} str
 * @param {*} key
 * @param {*} type encrypt 加密 decrypt 解密
 */
function aesCrypto(str, key, type = 'encrypt') {
  // eslint-disable-next-line no-param-reassign
  key = Utf8.parse(key);
  // eslint-disable-next-line no-param-reassign
  str = type === 'encrypt' ? Utf8.parse(str) : str;

  const word = AES[type](str, key, {
    mode: modeECB,
    padding: padPkcs7,
  });

  return type === 'encrypt' ? word.toString() : Utf8.stringify(word).toString();
}

// 加密参数
// 加密字符串化 json 后 encode 编码
export function encodeParams(params, encrypt) {
  if (typeof params === 'string') {
    return encodeURIComponent(aesCrypto(params, encrypt));
  }

  return encodeURIComponent(aesCrypto(JSON.stringify(params), encrypt));
}

// 参数解密
// decode 解码后，解密
export function decodeResponse(response, encrypt) {
  return JSON.parse(aesCrypto(decodeURIComponent(response), encrypt, 'decrypt'));
}

/**
 * 用于母子健康加密方式
 * @param {加密数据} data
 * @param {加密key*} Hkey
 */
export function getAesString(data, Hkey) {
  const key = CryptoJS.enc.Utf8.parse(Hkey);
  //  var iv   = CryptoJS.enc.Utf8.parse(iv);
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    //          iv:iv,
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.ciphertext.toString(); // 返回的是base64格式的密文
}
