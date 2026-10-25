
// pages/cart/cart.js

Page({
  data: {
    cartList: [],
    cartCount: 0,
    totalPrice: 0,
    allSelected: true,
    isEmpty: true
  },

  // 页面显示时刷新购物车
  onShow() {
    this.loadCart()
  },

  // 加载购物车
  loadCart() {
    const cart = wx.getStorageSync('cart') || {}
    const diyItemsRaw = wx.getStorageSync('diy_items') || []
    const savedProducts = wx.getStorageSync('products')

    const diyItems = Array.isArray(diyItemsRaw)
      ? diyItemsRaw
      : Object.keys(diyItemsRaw).map(key => ({
          ...diyItemsRaw[key],
          id: diyItemsRaw[key].id || key
        }))

    // 优先使用后台商品缓存；没有缓存时使用默认商品
    let products = savedProducts

    if (!Array.isArray(products) || products.length === 0) {
      products = [
        {
          id: 1,
          name: '一二奶茶',
          desc: '布布特调的经典奶茶',
          price: 12,
          emoji: '🧋',
          background: 'linear-gradient(135deg,#E8F5E9,#A5D6A7)'
        },
        {
          id: 2,
          name: '布布拿铁',
          desc: '香浓丝滑的焦糖拿铁',
          price: 22,
          emoji: '☕',
          background: 'linear-gradient(135deg,#E8F5E9,#A5D6A7)'
        },
        {
          id: 3,
          name: '小熊蜂蜜水',
          desc: '温润甜蜜的蜂蜜柠檬',
          price: 15,
          emoji: '🍯',
          background: 'linear-gradient(135deg,#E8F5E9,#A5D6A7)'
        },
        {
          id: 4,
          name: '草莓慕斯',
          desc: '一二最爱的草莓甜品',
          price: 28,
          emoji: '🍰',
          background: 'linear-gradient(135deg,#FCE4EC,#F48FB1)'
        },
        {
          id: 5,
          name: '巧克力曲奇',
          desc: '酥脆浓郁的巧克力饼干',
          price: 16,
          emoji: '🍪',
          background: 'linear-gradient(135deg,#FCE4EC,#F48FB1)'
        },
        {
          id: 6,
          name: '抹茶毛巾卷',
          desc: '清新抹茶味蛋糕卷',
          price: 25,
          emoji: '🧁',
          background: 'linear-gradient(135deg,#FCE4EC,#F48FB1)'
        },
        {
          id: 7,
          name: '熊掌三明治',
          desc: '超可爱的熊掌造型',
          price: 32,
          emoji: '🥐',
          background: 'linear-gradient(135deg,#FFF3E0,#FFCC80)'
        },
        {
          id: 8,
          name: '布布便当',
          desc: '丰盛的每日营养便当',
          price: 38,
          emoji: '🍱',
          background: 'linear-gradient(135deg,#FFF3E0,#FFCC80)'
        },
        {
          id: 9,
          name: '樱花气泡水',
          desc: '限定春日浪漫饮品',
          price: 20,
          emoji: '🌸',
          background: 'linear-gradient(135deg,#E3F2FD,#90CAF9)'
        },
        {
          id: 10,
          name: '蜜桃乌龙',
          desc: '清甜蜜桃遇上醇香乌龙',
          price: 19,
          emoji: '🍑',
          background: 'linear-gradient(135deg,#E3F2FD,#90CAF9)'
        }
      ]

      wx.setStorageSync('products', products)
    }

    // 保留页面中原有的勾选状态
    const oldSelected = {}
    this.data.cartList.forEach(item => {
      oldSelected[String(item.cartId)] = item.selected
    })

    const list = []

    Object.keys(cart).forEach(key => {
      const quantity = Number(cart[key]) || 0
      if (quantity <= 0) return

      let item = products.find(product =>
        String(product.id) === String(key)
      )

      let isDIY = false

      if (!item) {
        item = diyItems.find(product =>
          String(product.id) === String(key)
        )
        isDIY = !!item
      }

      if (!item) return

      const price = Number(item.price)
      if (!Number.isFinite(price) || price < 0) return

      list.push({
        ...item,
        price,
        cartId: key,
        quantity,
        isDIY,
        selected: Object.prototype.hasOwnProperty.call(
          oldSelected,
          String(key)
        )
          ? oldSelected[String(key)]
          : true
      })
    })

    this.updateSelected(list)
  },

  // 保存购物车并重新计算数量、金额及选择状态
  updateSelected(list) {
    const cartCount = list.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0
    )

    const selectedItems = list.filter(item => item.selected)

    const totalPrice = Number(
      selectedItems.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
      ).toFixed(2)
    )

    this.setData({
      cartList: list,
      cartCount,
      totalPrice,
      isEmpty: list.length === 0,
      allSelected:
        list.length > 0 && selectedItems.length === list.length
    })
  },

  // 增加数量
  increase(e) {
    const id = String(e.currentTarget.dataset.id)
    const cart = wx.getStorageSync('cart') || {}

    cart[id] = (Number(cart[id]) || 0) + 1

    wx.setStorageSync('cart', cart)
    this.loadCart()
  },

  // 减少数量
  decrease(e) {
    const id = String(e.currentTarget.dataset.id)
    const cart = wx.getStorageSync('cart') || {}

    const quantity = (Number(cart[id]) || 0) - 1

    if (quantity <= 0) {
      delete cart[id]
    } else {
      cart[id] = quantity
    }

    wx.setStorageSync('cart', cart)
    this.loadCart()
  },

  // 删除商品
  removeItem(e) {
    const id = String(e.currentTarget.dataset.id)
    const cart = wx.getStorageSync('cart') || {}

    delete cart[id]
    wx.setStorageSync('cart', cart)

    // 同步更新 DIY 商品缓存，避免影响其他 DIY 商品
    this.loadCart()

    wx.showToast({
      title: '已删除',
      icon: 'none'
    })
  },

  // 单选商品
  toggleSelect(e) {
    const id = String(e.currentTarget.dataset.id)

    const list = this.data.cartList.map(item => {
      if (String(item.cartId) === id) {
        return {
          ...item,
          selected: !item.selected
        }
      }
      return item
    })

    this.updateSelected(list)
  },

  // 全选 / 全不选
  toggleAll() {
    const selected = !this.data.allSelected

    const list = this.data.cartList.map(item => ({
      ...item,
      selected
    }))

    this.updateSelected(list)
  },

  // 去结算：只把已勾选商品放入本次结算
  checkout() {
    if (this.data.isEmpty) {
      wx.showToast({
        title: '购物车是空的~',
        icon: 'none'
      })
      return
    }

    const selectedItems = this.data.cartList.filter(
      item => item.selected
    )

    if (selectedItems.length === 0) {
      wx.showToast({
        title: '请先选择商品',
        icon: 'none'
      })
      return
    }

    // 保存完整购物车，结算页只读取已选商品
    const originalCart = wx.getStorageSync('cart') || {}
    const checkoutCart = {}

    selectedItems.forEach(item => {
      checkoutCart[String(item.cartId)] = Number(item.quantity) || 0
    })

    wx.setStorageSync('cart_before_checkout', originalCart)
    wx.setStorageSync('cart', checkoutCart)

    wx.navigateTo({
      url: '/pages/checkout/checkout',
      fail: () => {
        // 页面跳转失败时恢复原购物车
        wx.setStorageSync('cart', originalCart)
        wx.removeStorageSync('cart_before_checkout')

        wx.showToast({
          title: '无法打开结算页面',
          icon: 'none'
        })
      }
    })
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 首页
  goHome() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },

  // DIY
  goDIY() {
    wx.navigateTo({
      url: '/pages/diy/diy'
    })
  },

  // 购物车
  goCart() {
    this.loadCart()
  },

  // 订单
  goOrders() {
    wx.navigateTo({
      url: '/pages/order/order'
    })
  }
})
