
// pages/checkout/checkout.js

Page({

  data: {

    orderList: [],

    totalPrice: 0,

    deliveryFee: 0,

    finalPrice: 0,

    totalCount: 0,

    // 默认校园配送
    deliveryType: '配送',
    deliveryAddress: '',
    locationName: '',
    latitude: 0,
    longitude: 0,
    markers: [],
    hasLocation: false

  },


  /**
   * 页面加载
   */
  onLoad() {

    this.loadOrder()

  },


  /**
   * 页面显示
   */
  onShow() {

    this.loadOrder()

  },


  /**
   * 加载订单
   */
  loadOrder() {

    const cart =
      wx.getStorageSync('cart') || {}

    const diyItems =
      wx.getStorageSync('diy_items') || []


    // =========================
    // 读取后台商品
    // =========================

    let products =
      wx.getStorageSync('products')


    // 如果后台还没有商品
    // 使用默认商品
    if (
      !products ||
      !Array.isArray(products) ||
      products.length === 0
    ) {

      products = [

        {
          id: 1,
          name: '一二奶茶',
          desc: '布布特调的经典奶茶',
          price: 12,
          emoji: '🧋'
        },

        {
          id: 2,
          name: '布布拿铁',
          desc: '香浓丝滑的焦糖拿铁',
          price: 22,
          emoji: '☕'
        },

        {
          id: 3,
          name: '小熊蜂蜜水',
          desc: '温润甜蜜的蜂蜜柠檬',
          price: 15,
          emoji: '🍯'
        },

        {
          id: 4,
          name: '草莓慕斯',
          desc: '一二最爱的草莓甜品',
          price: 28,
          emoji: '🍰'
        },

        {
          id: 5,
          name: '巧克力曲奇',
          desc: '酥脆浓郁的巧克力饼干',
          price: 16,
          emoji: '🍪'
        },

        {
          id: 6,
          name: '抹茶毛巾卷',
          desc: '清新抹茶味蛋糕卷',
          price: 25,
          emoji: '🧁'
        },

        {
          id: 7,
          name: '熊掌三明治',
          desc: '超可爱的熊掌造型',
          price: 32,
          emoji: '🥐'
        },

        {
          id: 8,
          name: '布布便当',
          desc: '丰盛的每日营养便当',
          price: 38,
          emoji: '🍱'
        },

        {
          id: 9,
          name: '樱花气泡水',
          desc: '限定春日浪漫饮品',
          price: 20,
          emoji: '🌸'
        },

        {
          id: 10,
          name: '蜜桃乌龙',
          desc: '清甜蜜桃遇上醇香乌龙',
          price: 19,
          emoji: '🍑'
        }

      ]


      wx.setStorageSync(
        'products',
        products
      )

    }


    // =========================
    // 创建订单商品列表
    // =========================

    const orderList = []


    Object.keys(cart).forEach(key => {

      const quantity =
        Number(cart[key]) || 0


      if (quantity <= 0) {
        return
      }


      // 优先读取后台商品
      let item =
        products.find(product => {

          return String(product.id) ===
            String(key)

        })


      // 如果不是普通商品
      // 再查找 DIY 商品
      if (!item) {

        item =
          diyItems.find(product => {

            return String(product.id) ===
              String(key)

          })

      }


      if (!item) {
        return
      }


      // =========================
      // 商品已经下架
      // =========================

      if (
        item.onSale === false
      ) {

        return

      }


      const price =
        Number(item.price) || 0


      orderList.push({

        ...item,

        cartId: key,

        quantity: quantity,

        price: price,

        subtotal:
          price * quantity

      })

    })


    // =========================
    // 计算金额
    // =========================

    let totalPrice = 0

    let totalCount = 0


    orderList.forEach(item => {

      totalPrice +=
        Number(item.subtotal) || 0

      totalCount +=
        Number(item.quantity) || 0

    })


    // =========================
    // 计算配送费
    // =========================

    this.calculatePrice(

      totalPrice,

      totalCount,

      this.data.deliveryType,

      orderList

    )

  },


  /** 手动打开微信原生地图选点 */
  chooseDeliveryLocation() {
    wx.chooseLocation({
      latitude: this.data.hasLocation ? this.data.latitude : undefined,
      longitude: this.data.hasLocation ? this.data.longitude : undefined,
      success: (res) => {
        const name = res.name || '已选择配送位置'
        const address = res.address || name
        this.setData({
          locationName: name,
          deliveryAddress: address,
          latitude: res.latitude,
          longitude: res.longitude,
          hasLocation: true,
          markers: [{
            id: 1,
            latitude: res.latitude,
            longitude: res.longitude,
            title: name,
            width: 28,
            height: 28
          }]
        })
      },
      fail: (err) => {
        if (err && /cancel/i.test(err.errMsg || '')) return
        wx.showToast({ title: '无法打开地图选点，请检查定位权限', icon: 'none' })
      }
    })
  },

  /** 自动定位当前位置；地址名称可再通过地图选点确认 */
  locateCurrentPosition() {
    wx.getSetting({
      success: (setting) => {
        const runLocation = () => {
          wx.getLocation({
            type: 'gcj02',
            isHighAccuracy: true,
            success: (res) => {
              this.setData({
                latitude: res.latitude,
                longitude: res.longitude,
                locationName: '我的当前位置',
                deliveryAddress: '当前位置（请点击地图确认具体配送地址）',
                hasLocation: true,
                markers: [{
                  id: 1,
                  latitude: res.latitude,
                  longitude: res.longitude,
                  title: '我的当前位置',
                  width: 28,
                  height: 28
                }]
              })
              wx.showToast({ title: '定位成功，可继续确认地址', icon: 'success' })
            },
            fail: () => wx.showToast({ title: '定位失败，请检查手机/开发者工具定位权限', icon: 'none' })
          })
        }
        if (setting.authSetting && setting.authSetting['scope.userLocation'] === false) {
          wx.showModal({
            title: '需要定位权限',
            content: '请在设置中允许使用位置信息，再进行自动定位。',
            confirmText: '去设置',
            success: (res) => { if (res.confirm) wx.openSetting({}) }
          })
        } else {
          runLocation()
        }
      },
      fail: () => wx.showToast({ title: '无法读取定位权限设置', icon: 'none' })
    })
  },

  /**
   * 选择配送方式
   */
  selectDelivery(e) {

    const type =
      e.currentTarget.dataset.type


    this.setData({

      deliveryType: type

    })


    this.calculatePrice(

      this.data.totalPrice,

      this.data.totalCount,

      type,

      this.data.orderList

    )

  },


  /**
   * 重新计算价格
   */
  calculatePrice(

    totalPrice,

    totalCount,

    deliveryType,

    orderList

  ) {

    let deliveryFee = 0


    // 到店自取免费
    if (
      deliveryType === '到店自取'
    ) {

      deliveryFee = 0

    } else {

      // 校园配送
      // 满30元免配送费
      // 不满30元收3元

      deliveryFee =
        totalPrice >= 30 ||
        totalPrice === 0
          ? 0
          : 3

    }


    this.setData({

      orderList: orderList,

      totalPrice: totalPrice,

      deliveryFee: deliveryFee,

      finalPrice:
        totalPrice + deliveryFee,

      totalCount: totalCount

    })

  },


  /**
   * 提交订单
   */
  submitOrder() {

    if (
      this.data.orderList.length === 0
    ) {

      wx.showToast({

        title: '没有可提交的商品',

        icon: 'none'

      })

      return

    }


    if (this.data.deliveryType === '配送' && !this.data.hasLocation) {
      wx.showModal({
        title: '请选择配送地址',
        content: '请手动选择地图位置，或先使用自动定位再确认配送地址。',
        confirmText: '选择地址',
        success: (res) => { if (res.confirm) this.chooseDeliveryLocation() }
      })
      return
    }

    wx.showModal({

      title: '确认订单',

      content:
        this.data.deliveryType +
        '，共' +
        this.data.totalCount +
        '件商品，合计¥' +
        this.data.finalPrice,

      confirmText: '提交订单',

      cancelText: '再看看',


      success: res => {

        if (!res.confirm) {

          return

        }


        // =========================
        // 读取原有订单
        // =========================

        const oldOrders =
          wx.getStorageSync('orders') || []


        const now =
          new Date()


        const year =
          now.getFullYear()


        const month =
          String(
            now.getMonth() + 1
          ).padStart(2, '0')


        const day =
          String(
            now.getDate()
          ).padStart(2, '0')


        const hour =
          String(
            now.getHours()
          ).padStart(2, '0')


        const minute =
          String(
            now.getMinutes()
          ).padStart(2, '0')


        const orderTime =
          year +
          '-' +
          month +
          '-' +
          day +
          ' ' +
          hour +
          ':' +
          minute


        const orderId =
          String(year) +
          month +
          day +
          String(
            Date.now()
          ).slice(-6)


        // =========================
        // 创建订单
        // =========================

        const newOrder = {

          id: orderId,

          time: orderTime,

          // 新订单默认待处理
          status: 'pending',

          statusText: '待处理',

          // 配送方式
          deliveryType:
            this.data.deliveryType,

          deliveryInfo:
            this.data.deliveryType === '配送'
              ? (this.data.deliveryAddress || '未填写配送地址')
              : '到店自取',

          deliveryAddress: this.data.deliveryType === '配送' ? this.data.deliveryAddress : '',
          latitude: this.data.deliveryType === '配送' ? this.data.latitude : 0,
          longitude: this.data.deliveryType === '配送' ? this.data.longitude : 0,

          // 商品
          items:
            this.data.orderList,

          // 金额
          totalPrice:
            this.data.totalPrice,

          deliveryFee:
            this.data.deliveryFee,

          finalPrice:
            this.data.finalPrice,

          totalCount:
            this.data.totalCount

        }


        // 新订单放到最前面
        oldOrders.unshift(
          newOrder
        )


        // 保存订单
        wx.setStorageSync(

          'orders',

          oldOrders

        )


        // =========================
        // 清空购物车
        // =========================

        wx.setStorageSync(

          'cart',

          {}

        )


        wx.showToast({

          title: '订单提交成功',

          icon: 'success',

          duration: 1200

        })


        // 返回首页
        setTimeout(() => {

          wx.reLaunch({

            url:
              '/pages/index/index'

          })

        }, 1200)

      }

    })

  },


  /**
   * 返回
   */
  goBack() {

    wx.navigateBack()

  }

})

