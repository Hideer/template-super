/*
 * 表单校验函数
 */

export const checkIdNubmer = (value: string) => {
  if (value) {
    return /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(
      value
    );
  }
  return true;
};

export const checkPhone = (value: string) => {
  if (value) {
    return /\d{11}/.test(value);
  }
  return true;
};

export default {
  checkIdNubmer,
  checkPhone,
};
