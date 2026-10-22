// app.js

App({

  /**
   * 全局数据
   */
  globalData: {

    // 商品数据是否发生变化
    productsChanged: false

  },


  /**
   * 小程序初始化
   */
  onLaunch: function () {

    console.log('🧸 一二布布小铺：小程序启动')

  },


  /**
   * 小程序显示
   */
  onShow: function (options) {

  },


  /**
   * 小程序隐藏
   */
  onHide: function () {

  },


  /**
   * 小程序发生错误
   */
  onError: function (msg) {

    console.log('小程序错误：', msg)

  }

})