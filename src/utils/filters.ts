import dayjs from 'dayjs';
import utils, { desensitizeInfoProps } from '@/utils';

/**
 * 时间格式化
 * @param {Time} val 时间格式
 * @param {Str} format 需格式化的格式
 */
export const formatTime = (
  val: string | number | Date | dayjs.Dayjs | undefined,
  format = 'YYYY年MM月DD日'
) => {
  val = val + '';

  if (/^[1-2][0-9][0-9][0-9]年[0-1]{0,1}[0-9]月[0-3]{0,1}[0-9]日$/.test(val)) return val;

  return dayjs(val).format(format);
};

/**
 * 数据判空
 */
export const formatNoData = (v: string | any[] | null | undefined) => {
  const val = utils.isEmpty(v);
  return val === '空' ? '--' : val;
};

/**
 * 数据脱敏
 * @param {*} str 字符串
 * @param {*} beginLen 开始index
 * @param {*} endLen 结束index
 */
export const desensitization = (strVal: any, params: desensitizeInfoProps) => {
  return utils.desensitizeInfo({ strVal, ...params });
};
