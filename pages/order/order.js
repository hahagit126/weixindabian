//const API = 'http://127.0.0.1/bear-store-api/'
const API = 'http://10.189.151.105/bear-store-api/'
Page({
  data: {
    orders: [],
    cartCount: 0
  },

  onShow() {
    this.loadOrders()
    this.updateCartCount()
  },

  // 加载订单：优先读取服务器，失败时显示本地缓存
  loadOrders() {
    const storedOrders = wx.getStorageSync('orders') || []
    const localOrders = Array.isArray(storedOrders) ? storedOrders : []

    wx.request({
      url: API,
      method: 'GET',
      data: {
        action: 'orders'
      },

      success: (res) => {
        const result = res.data

        if (
          res.statusCode !== 200 ||
          !result ||
          result.code !== 0 ||
          !Array.isArray(result.data)
        ) {
          this.showLocalOrders(localOrders)
          return
        }

        const localMap = {}
        localOrders.forEach(order => {
          if (order && order.id !== undefined) {
            localMap[String(order.id)] = order
          }
        })

        const list = result.data.map(serverOrder => {
          const id = serverOrder.id
          const localOrder = localMap[String(id)] || {}

          const rawItems = Array.isArray(serverOrder.items)
            ? serverOrder.items
            : (Array.isArray(localOrder.items) ? localOrder.items : [])

          const items = rawItems.map(item => {
            const oldItems = Array.isArray(localOrder.items)
              ? localOrder.items
              : []

            const localItem = oldItems.find(oldItem =>
              String(oldItem.id) === String(item.id)
            ) || {}

            const quantity = Number(item.quantity) || 0
            const price = Number(item.price) || 0

            const subtotal = item.subtotal !== undefined
              ? Number(item.subtotal)
              : price * quantity

            return {
              ...localItem,
              ...item,
              quantity,
              price,
              emoji: item.emoji || localItem.emoji || '🧸',
              desc: item.desc || localItem.desc || '',
              subtotal: (Number.isFinite(subtotal) ? subtotal : 0).toFixed(2)
            }
          })

          const statusMap = {
            '待处理': 'pending',
            '制作中': 'making',
            '待取餐': 'ready',
            '配送中': 'delivering',
            '已完成': 'completed',
            '已取消': 'cancelled',
            pending: 'pending',
            making: 'making',
            ready: 'ready',
            delivering: 'delivering',
            completed: 'completed',
            cancelled: 'cancelled'
          }

          const statusTextMap = {
            pending: '待处理',
            making: '制作中',
            ready: '待取餐',
            delivering: '配送中',
            completed: '已完成',
            cancelled: '已取消'
          }

          const status = statusMap[serverOrder.status] || 'pending'
          const remark = serverOrder.remark || ''

          let deliveryType = serverOrder.deliveryType ||
            localOrder.deliveryType ||
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
            serverOrder.deliveryAddress ||
            localOrder.deliveryAddress ||
            this.extractAddress(remark)

          const totalCount = items.reduce((sum, item) => {
            return sum + (Number(item.quantity) || 0)
          }, 0)

          const totalPrice = this.getMoney(
            serverOrder.totalPrice,
            serverOrder.total,
            localOrder.totalPrice
          )

          const deliveryFee = this.getMoney(
            serverOrder.deliveryFee,
            localOrder.deliveryFee,
            0
          )

          const finalPrice = this.getMoney(
            serverOrder.finalPrice,
            localOrder.finalPrice,
            totalPrice + deliveryFee
          )

          return {
            ...localOrder,
            ...serverOrder,
            id: id || localOrder.id || '暂无订单号',
            items,
            status,
            statusText: statusTextMap[status] || '待处理',
            totalCount,
            totalPrice: totalPrice.toFixed(2),
            deliveryFee: deliveryFee.toFixed(2),
            finalPrice: finalPrice.toFixed(2),
            deliveryType,
            deliveryAddress,
            deliveryInfo: deliveryType === '到店自取'
              ? '到店自取'
              : deliveryAddress,
            time: serverOrder.createdAt ||
              localOrder.time ||
              localOrder.createdAt ||
              '暂无时间'
          }
        })

        // 服务器订单为准，不把页面格式化后的数据覆盖写回本地
        this.setData({
          orders: list
        })
      },

      fail: () => {
        this.showLocalOrders(localOrders)

        wx.showToast({
          title: '服务器连接失败，显示本地订单',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  // 读取第一个有效金额字段，保留合法的 0
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

  // 从旧订单备注中提取地址
  extractAddress(remark) {
    const match = String(remark || '').match(/收货地址：([^；\n]+)/)
    return match ? match[1] : ''
  },

  // 服务器不可用时显示本地订单
  showLocalOrders(orders) {
    const statusMap = {
      '待处理': 'pending',
      '制作中': 'making',
      '待取餐': 'ready',
      '配送中': 'delivering',
      '已完成': 'completed',
      '已取消': 'cancelled',
      pending: 'pending',
      making: 'making',
      ready: 'ready',
      delivering: 'delivering',
      completed: 'completed',
      cancelled: 'cancelled'
    }

    const statusTextMap = {
      pending: '待处理',
      making: '制作中',
      ready: '待取餐',
      delivering: '配送中',
      completed: '已完成',
      cancelled: '已取消'
    }

    const list = (Array.isArray(orders) ? orders : []).map(order => {
      const status = statusMap[order.status] || 'pending'
      const items = Array.isArray(order.items) ? order.items : []

      const totalCount = Number(order.totalCount) ||
        items.reduce((sum, item) => {
          return sum + (Number(item.quantity) || 0)
        }, 0)

      const totalPrice = this.getMoney(
        order.totalPrice,
        order.total
      )

      const deliveryFee = this.getMoney(order.deliveryFee)

      const finalPrice = this.getMoney(
        order.finalPrice,
        totalPrice + deliveryFee
      )

      const deliveryType = order.deliveryType ||
        (String(order.remark || '').indexOf('到店自取') !== -1
          ? '到店自取'
          : '配送')

      return {
        ...order,
        status,
        statusText: statusTextMap[status] || '待处理',
        items,
        totalCount,
        totalPrice: totalPrice.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        finalPrice: finalPrice.toFixed(2),
        deliveryType,
        deliveryAddress: order.deliveryAddress ||
          this.extractAddress(order.remark),
        time: order.time || order.createdAt || '暂无时间'
      }
    })

    this.setData({
      orders: list
    })
  },

  // 查看订单详情
  goDetail(e) {
    const id = e.currentTarget.dataset.id

    if (!id) {
      wx.showToast({
        title: '订单不存在',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: '/pages/order-detail/order-detail?id=' +
        encodeURIComponent(String(id))
    })
  },

  // 再来一单
  buyAgain(e) {
    const id = e.currentTarget.dataset.id
    const storedOrders = wx.getStorageSync('orders') || []
    const localOrders = Array.isArray(storedOrders) ? storedOrders : []

    let order = localOrders.find(item =>
      String(item.id) === String(id)
    )

    if (!order) {
      order = this.data.orders.find(item =>
        String(item.id) === String(id)
      )
    }

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

  // 更新购物车数量
  updateCartCount() {
    const cart = wx.getStorageSync('cart') || {}
    let count = 0

    Object.keys(cart).forEach(key => {
      count += Number(cart[key]) || 0
    })

    this.setData({
      cartCount: count
    })
  },

  // 首页导航
  goHome() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },

  // DIY 页面
  goDIY() {
    wx.redirectTo({
      url: '/pages/diy/diy'
    })
  },

  // 购物车
  goCart() {
    wx.redirectTo({
      url: '/pages/cart/cart'
    })
  },

  // 刷新订单
  goOrders() {
    this.loadOrders()
    this.updateCartCount()
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }
    })
  }
})