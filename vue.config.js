module.exports = {
  baseUrl: './',
  devServer: {
    // host: '0.0.0.0', //ip地址（默认localhost）
    // https: true,
    port: 9098, // 端口号
    // 当存在编译器错误或警告时，在浏览器中显示全屏覆盖
    overlay: {
      errors: true,
      warnings: true
    }
  }
}