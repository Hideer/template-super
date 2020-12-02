module.exports = {
  root: true,
  env: {
    node: true,
  },
  globals: {
    uni: true,
    wx: true,
    my: true,
    getApp: true,
  },
  plugins: ["prettier"],
  extends: ['plugin:vue/essential', '@vue/prettier'],
  rules: {
    // 'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
