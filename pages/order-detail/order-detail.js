// pages/order-detail/order-detail.js

Page({

  data: {
    order: null
  },


  onLoad(options) {

    const orderId = options.id || ''

    if (!orderId) {

      wx.showToast({
        title: '订单不存在',
        icon: 'none'
      })

      return
    }

    this.loadOrder(orderId)
  },


  // 读取订单
  loadOrder(orderId) {

    const orders = wx.getStorageSync('orders') || []

    const order = orders.find(item => {
      return String(item.id) === String(orderId)
    })


    if (!order) {

      wx.showToast({
        title: '订单不存在',
        icon: 'none'
      })

      return
    }


    // 订单状态文字
    let statusText = '已完成'

    if (order.status === 'pending') {
      statusText = '待处理'
    } else if (order.status === 'making') {
      statusText = '制作中'
    } else if (order.status === 'ready') {
      statusText = '待取餐'
    } else if (order.status === 'delivering') {
      statusText = '配送中'
    } else if (
      order.status === 'completed' ||
      order.status === '已完成'
    ) {
      statusText = '已完成'
    } else if (order.status === 'cancelled') {
      statusText = '已取消'
    } else if (order.status) {
      statusText = order.status
    }


    // 确保金额和数量正常显示
    const newOrder = {
      ...order,

      statusText: statusText,

      totalPrice: Number(
        order.totalPrice || 0
      ).toFixed(2),

      deliveryFee: Number(
        order.deliveryFee || 0
      ).toFixed(2),

      finalPrice: Number(
        order.finalPrice || 0
      ).toFixed(2),

      totalCount: Number(
        order.totalCount || 0
      )
    }


    this.setData({
      order: newOrder
    })


    console.log(
      '订单详情：',
      newOrder
    )
  },


  // 再来一单
  buyAgain() {

    const order = this.data.order

    if (
      !order ||
      !order.items ||
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

      const cartId = String(
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
        url: '/pages/cart/cart'
      })

    }, 1000)

  },


  // 返回订单记录
  goBack() {

    wx.navigateBack({
      delta: 1
    })

  }

})