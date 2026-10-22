
// pages/cart/cart.js

Page({

  data: {

    // 购物车商品
    cartList: [],

    // 商品总数量
    cartCount: 0,

    // 商品总价
    totalPrice: 0,

    // 是否全选
    allSelected: true,

    // 是否为空
    isEmpty: true

  },


  /**
   * 页面显示时刷新购物车
   */
  onShow() {

    this.loadCart()

  },


  /**
   * 加载购物车
   */
  loadCart() {

    const cart =
      wx.getStorageSync('cart') || {}

    const diyItems =
      wx.getStorageSync('diy_items') || []


    // =========================
    // 读取后台商品
    // =========================

    const savedProducts =
      wx.getStorageSync('products')


    // 如果后台还没有 products
    // 使用默认商品初始化
    let products = savedProducts


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


      wx.setStorageSync(
        'products',
        products
      )

    }


    // =========================
    // 创建购物车列表
    // =========================

    const list = []


    Object.keys(cart).forEach(key => {

      const quantity =
        Number(cart[key]) || 0


      if (quantity <= 0) {
        return
      }


      // =========================
      // 优先读取后台商品
      // =========================

      let item =
        products.find(product => {

          return String(product.id) ===
            String(key)

        })


      // =========================
      // 如果不是普通商品
      // 查找 DIY 商品
      // =========================

      if (!item) {

        item =
          diyItems.find(product => {

            return String(product.id) ===
              String(key)

          })

      }


      // 找不到商品
      if (!item) {
        return
      }


      // =========================
      // 已下架商品仍然保留在购物车
      // =========================
      //
      // 这样可以避免后台下架后
      // 用户购物车中的商品直接消失
      //
      // 用户可以继续减少数量或删除
      //

      list.push({

        ...item,

        cartId: key,

        quantity: quantity,

        selected: true

      })

    })


    // =========================
    // 计算金额
    // =========================

    let totalPrice = 0

    let cartCount = 0


    list.forEach(item => {

      cartCount +=
        Number(item.quantity) || 0


      if (item.selected) {

        totalPrice +=
          Number(item.price || 0) *
          Number(item.quantity || 0)

      }

    })


    // =========================
    // 更新页面
    // =========================

    this.setData({

      cartList: list,

      cartCount: cartCount,

      totalPrice: totalPrice,

      isEmpty:
        list.length === 0,

      allSelected:
        list.length > 0

    })

  },


  /**
   * 增加数量
   */
  increase(e) {

    const id =
      String(
        e.currentTarget.dataset.id
      )


    const cart =
      wx.getStorageSync('cart') || {}


    cart[id] =
      (Number(cart[id]) || 0) + 1


    wx.setStorageSync(
      'cart',
      cart
    )


    this.loadCart()

  },


  /**
   * 减少数量
   */
  decrease(e) {

    const id =
      String(
        e.currentTarget.dataset.id
      )


    const cart =
      wx.getStorageSync('cart') || {}


    let quantity =
      Number(cart[id]) || 0


    quantity--


    if (quantity <= 0) {

      delete cart[id]

    } else {

      cart[id] = quantity

    }


    wx.setStorageSync(
      'cart',
      cart
    )


    this.loadCart()

  },


  /**
   * 删除商品
   */
  removeItem(e) {

    const id =
      String(
        e.currentTarget.dataset.id
      )


    const cart =
      wx.getStorageSync('cart') || {}


    delete cart[id]


    wx.setStorageSync(
      'cart',
      cart
    )


    this.loadCart()


    wx.showToast({

      title: '已删除',

      icon: 'none'

    })

  },


  /**
   * 单选商品
   */
  toggleSelect(e) {

    const id =
      String(
        e.currentTarget.dataset.id
      )


    const list =
      this.data.cartList.map(item => {

        if (
          String(item.cartId) === id
        ) {

          return {

            ...item,

            selected:
              !item.selected

          }

        }

        return item

      })


    this.updateSelected(list)

  },


  /**
   * 全选
   */
  toggleAll() {

    const selected =
      !this.data.allSelected


    const list =
      this.data.cartList.map(item => {

        return {

          ...item,

          selected: selected

        }

      })


    this.updateSelected(list)

  },


  /**
   * 更新选中状态和价格
   */
  updateSelected(list) {

    let totalPrice = 0

    let selectedCount = 0


    list.forEach(item => {

      if (item.selected) {

        totalPrice +=
          Number(item.price || 0) *
          Number(item.quantity || 0)

        selectedCount++

      }

    })


    this.setData({

      cartList: list,

      totalPrice: totalPrice,

      allSelected:
        list.length > 0 &&
        selectedCount === list.length

    })

  },


  /**
   * 去结算
   */
  checkout() {

    if (this.data.isEmpty) {

      wx.showToast({

        title: '购物车是空的~',

        icon: 'none'

      })

      return

    }


    if (this.data.totalPrice <= 0) {

      wx.showToast({

        title: '请选择商品',

        icon: 'none'

      })

      return

    }


    wx.navigateTo({

      url:
        '/pages/checkout/checkout'

    })

  },


  /**
   * 返回上一页
   */
  goBack() {

    wx.navigateBack({

      delta: 1

    })

  },


  /**
   * 首页
   */
  goHome() {

    wx.reLaunch({

      url:
        '/pages/index/index'

    })

  },


  /**
   * DIY
   */
  goDIY() {

    wx.navigateTo({

      url:
        '/pages/diy/diy'

    })

  },


  /**
   * 购物车
   */
  goCart() {

    this.loadCart()

  },


  /**
   * 订单
   */
  goOrders() {

    wx.navigateTo({

      url:
        '/pages/order/order'

    })

  }

})

