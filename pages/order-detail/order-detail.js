const API = 'http://10.189.151.105/bear-store-api/'

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

  // 优先读取服务器订单，失败时读取本地缓存
  loadOrder(orderId) {
    wx.request({
      url: API,
      method: 'GET',
      data: {
        action: 'order',
        id: orderId
      },

      success: (res) => {
        const result = res.data

        if (
          res.statusCode === 200 &&
          result &&
          result.code === 0 &&
          result.data &&
          String(result.data.id) === String(orderId)
        ) {
          const storedOrders = wx.getStorageSync('orders') || []
          const localOrders = Array.isArray(storedOrders)
            ? storedOrders
            : []

          const localOrder = localOrders.find(item =>
            String(item.id) === String(orderId)
          ) || {}

          this.formatOrder(result.data, localOrder)
          return
        }

        this.loadLocalOrder(orderId)
      },

      fail: () => {
        this.loadLocalOrder(orderId)
      }
    })
  },

  // 服务器不可用时读取本地订单
  loadLocalOrder(orderId) {
    const storedOrders = wx.getStorageSync('orders') || []
    const orders = Array.isArray(storedOrders) ? storedOrders : []

    const order = orders.find(item =>
      String(item.id) === String(orderId)
    )

    if (!order) {
      this.setData({
        order: null
      })

      wx.showToast({
        title: '未找到订单，请检查服务器连接',
        icon: 'none',
        duration: 2000
      })
      return
    }

    this.formatOrder(order, order)
  },

  // 获取第一个有效金额字段，保留合法的 0
  getMoney() {
    for (let i = 0; i < arguments.length; i++) {
      const value = arguments[i]

      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        Number.isFinite(Number(value)) &&
        Number(value) >= 0
      ) {
        return Number(value)
      }
    }

    return 0
  },

  // 从旧订单备注中提取配送地址
  extractAddress(remark) {
    const match = String(remark || '').match(/收货地址：([^；\n]+)/)
    return match ? match[1] : ''
  },

  // 统一服务器和本地订单的数据格式
  formatOrder(sourceOrder, localOrder) {
    const order = sourceOrder || {}
    const local = localOrder || {}

    const rawItems = Array.isArray(order.items)
      ? order.items
      : (Array.isArray(local.items) ? local.items : [])

    const localItems = Array.isArray(local.items)
      ? local.items
      : []

    const items = rawItems.map(item => {
      const localItem = localItems.find(oldItem =>
        String(oldItem.id) === String(item.id)
      ) || {}

      const price = this.getMoney(item.price, localItem.price)
      const quantity = Number(item.quantity) || 0

      const subtotal = this.getMoney(
        item.subtotal,
        price * quantity
      )

      return {
        ...localItem,
        ...item,
        id: item.id !== undefined ? item.id : localItem.id,
        name: item.name || localItem.name || '商品',
        emoji: item.emoji || localItem.emoji || '🧸',
        desc: item.desc || localItem.desc || '',
        price: price.toFixed(2),
        quantity,
        subtotal: subtotal.toFixed(2)
      }
    })

    const statusMap = {
      '待处理': '待处理',
      pending: '待处理',
      '制作中': '制作中',
      making: '制作中',
      '待取餐': '待取餐',
      ready: '待取餐',
      '配送中': '配送中',
      delivering: '配送中',
      '已完成': '已完成',
      completed: '已完成',
      '已取消': '已取消',
      cancelled: '已取消'
    }

    const statusText =
      statusMap[order.status] ||
      statusMap[local.status] ||
      '待处理'

    // 服务器 total 是商品总额；优先使用服务器明确提供的金额
    const calculatedItemsTotal = items.reduce((sum, item) => {
      return sum +
        (Number(item.price) || 0) *
        (Number(item.quantity) || 0)
    }, 0)

    const totalPrice = this.getMoney(
      order.totalPrice,
      order.total,
      local.totalPrice,
      calculatedItemsTotal
    )

    const deliveryFee = this.getMoney(
      order.deliveryFee,
      local.deliveryFee,
      0
    )

    const finalPrice = this.getMoney(
      order.finalPrice,
      local.finalPrice,
      totalPrice + deliveryFee
    )

    const totalCount = items.reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0)
    }, 0)

    const remark = order.remark || local.remark || ''

    let deliveryType =
      order.deliveryType ||
      local.deliveryType ||
      '配送'

    if (remark.indexOf('到店自取') !== -1) {
      deliveryType = '到店自取'
    } else if (
      remark.indexOf('校园配送') !== -1 ||
      remark.indexOf('配送') !== -1
    ) {
      deliveryType = '配送'
    }

    const deliveryAddress =
      order.deliveryAddress ||
      local.deliveryAddress ||
      this.extractAddress(remark)

    const deliveryInfo = deliveryType === '到店自取'
      ? '到店自取'
      : (deliveryAddress || local.deliveryInfo || '未填写配送地址')

    const time =
      order.createdAt ||
      order.time ||
      local.time ||
      local.createdAt ||
      '暂无时间'

    const formattedOrder = {
      ...local,
      ...order,
      id: order.id || local.id || '',
      status: statusText,
      statusText,
      time,
      items,
      totalCount,
      totalPrice: totalPrice.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      finalPrice: finalPrice.toFixed(2),
      deliveryType,
      deliveryAddress,
      deliveryInfo,
      remark
    }

    this.setData({
      order: formattedOrder
    })

    console.log('订单详情：', formattedOrder)
  },

  // 再来一单
  buyAgain() {
    const order = this.data.order

    if (!order || !Array.isArray(order.items) || order.items.length === 0) {
      wx.showToast({
        title: '订单商品不存在',
        icon: 'none'
      })
      return
    }

    const storedCart = wx.getStorageSync('cart') || {}
    const cart = storedCart && typeof storedCart === 'object'
      ? storedCart
      : {}

    order.items.forEach(item => {
      const cartId = String(
        item.cartId !== undefined ? item.cartId : item.id
      )
      const quantity = Number(item.quantity) || 0

      if (quantity > 0) {
        cart[cartId] = (Number(cart[cartId]) || 0) + quantity
      }
    })

    wx.setStorageSync('cart', cart)

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

  // 返回上一页
  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.redirectTo({
          url: '/pages/order/order'
        })
      }
    })
  }
})