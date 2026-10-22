// pages/order/order.js

Page({

  data: {
    orders: [],
    cartCount: 0
  },


  /**
   * 页面显示
   */
  onShow() {
    this.loadOrders()
    this.updateCartCount()
  },


  /**
   * 加载订单
   */
  loadOrders() {

    const orders =
      wx.getStorageSync('orders') || []


    const list = orders.map(order => {

      let status = order.status


      // 兼容旧订单
      if (status === '已完成') {
        status = 'completed'
      }


      if (!status) {
        status = 'pending'
      }


      let statusText = '待处理'


      switch (status) {

        case 'pending':
          statusText = '待处理'
          break

        case 'making':
          statusText = '制作中'
          break

        case 'ready':
          statusText = '待取餐'
          break

        case 'delivering':
          statusText = '配送中'
          break

        case 'completed':
          statusText = '已完成'
          break

        case 'cancelled':
          statusText = '已取消'
          break

        default:
          statusText = '待处理'
      }


      // 商品列表
      const items = Array.isArray(order.items)
        ? order.items
        : []


      // 商品数量
      const totalCount =
        Number(order.totalCount) ||
        items.reduce((sum, item) => {

          return sum +
            (Number(item.quantity) || 0)

        }, 0)


      // 最终金额
      const finalPrice =
        Number(order.finalPrice) ||
        Number(order.totalPrice) ||
        0


      return {

        ...order,

        id: order.id || '暂无订单号',

        status: status,

        statusText: statusText,

        items: items,

        totalCount: totalCount,

        finalPrice: finalPrice.toFixed(2),

        deliveryType:
          order.deliveryType || '配送',

        time:
          order.time || '暂无时间'

      }

    })


    this.setData({

      orders: list

    })

  },


  /**
   * 查看订单详情
   */
  goDetail(e) {

    const id =
      e.currentTarget.dataset.id


    if (!id) {

      wx.showToast({

        title: '订单不存在',

        icon: 'none'

      })

      return
    }


    wx.navigateTo({

      url:
        '/pages/order-detail/order-detail?id=' +
        id

    })

  },


  /**
   * 再来一单
   */
  buyAgain(e) {

    const id =
      e.currentTarget.dataset.id


    const orders =
      wx.getStorageSync('orders') || {}


    const order =
      orders.find(item => {

        return String(item.id) === String(id)

      })


    if (
      !order ||
      !Array.isArray(order.items) ||
      order.items.length === 0
    ) {

      wx.showToast({

        title: '订单商品不存在',

        icon: 'none'

      })

      return
    }


    const cart =
      wx.getStorageSync('cart') || {}


    order.items.forEach(item => {

      const cartId =
        String(
          item.cartId !== undefined
            ? item.cartId
            : item.id
        )


      const quantity =
        Number(item.quantity) || 0


      if (quantity > 0) {

        cart[cartId] =
          (Number(cart[cartId]) || 0) +
          quantity

      }

    })


    wx.setStorageSync(
      'cart',
      cart
    )


    wx.showToast({

      title: '已加入购物车',

      icon: 'success',

      duration: 1000

    })


    setTimeout(() => {

      wx.navigateTo({

        url:
          '/pages/cart/cart'

      })

    }, 1000)

  },


  updateCartCount() {
    const cart = wx.getStorageSync('cart') || {}
    const diyItems = wx.getStorageSync('diy_items') || []
    let count = 0
    Object.keys(cart).forEach(key => {
      count += Number(cart[key]) || 0
    })
    diyItems.forEach(item => {
      if (item && item.id && cart[String(item.id)] !== undefined) {
        // Quantity is already counted from the cart map; do not double count.
      }
    })
    this.setData({ cartCount: count })
  },

  /** 首页导航 */
  goHome() {

    wx.reLaunch({

      url:
        '/pages/index/index'

    })

  },


  /** 跳转 DIY 页面 */
  goDIY() {
    wx.redirectTo({ url: '/pages/diy/diy' })
  },

  /** 跳转购物车 */
  goCart() {
    wx.redirectTo({ url: '/pages/cart/cart' })
  },

  /** 当前已在订单页，刷新订单即可 */
  goOrders() {
    this.loadOrders()
    this.updateCartCount()
  },

  /**
   * 返回上一页
   */
  goBack() {

    wx.navigateBack({

      delta: 1

    })

  }

})