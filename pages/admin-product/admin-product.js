
// pages/admin-product/admin-product.js

Page({

  data: {

    products: []

  },


  // =========================
  // 页面加载
  // =========================

  onLoad() {

    this.loadProducts()

  },


  // =========================
  // 页面显示
  // =========================

  onShow() {

    this.loadProducts()

  },


  // =========================
  // 加载商品
  // =========================

  loadProducts() {

    const defaultProducts = [

      {
        id: 1,
        name: '一二奶茶',
        desc: '布布特调的经典奶茶',
        price: 12,
        emoji: '🧋',
        cat: 1,
        onSale: true,
        deleted: false
      },

      {
        id: 2,
        name: '布布拿铁',
        desc: '香浓丝滑的焦糖拿铁',
        price: 22,
        emoji: '☕',
        cat: 1,
        onSale: true,
        deleted: false
      },

      {
        id: 3,
        name: '小熊蜂蜜水',
        desc: '温润甜蜜的蜂蜜柠檬',
        price: 15,
        emoji: '🍯',
        cat: 1,
        onSale: true,
        deleted: false
      },

      {
        id: 4,
        name: '草莓慕斯',
        desc: '一二最爱的草莓甜品',
        price: 28,
        emoji: '🍰',
        cat: 2,
        onSale: true,
        deleted: false
      },

      {
        id: 5,
        name: '巧克力曲奇',
        desc: '酥脆浓郁的巧克力饼干',
        price: 16,
        emoji: '🍪',
        cat: 2,
        onSale: true,
        deleted: false
      },

      {
        id: 6,
        name: '抹茶毛巾卷',
        desc: '清新抹茶味蛋糕卷',
        price: 25,
        emoji: '🧁',
        cat: 2,
        onSale: true,
        deleted: false
      },

      {
        id: 7,
        name: '熊掌三明治',
        desc: '超可爱的熊掌造型',
        price: 32,
        emoji: '🥐',
        cat: 3,
        onSale: true,
        deleted: false
      },

      {
        id: 8,
        name: '布布便当',
        desc: '丰盛的每日营养便当',
        price: 38,
        emoji: '🍱',
        cat: 3,
        onSale: true,
        deleted: false
      },

      {
        id: 9,
        name: '樱花气泡水',
        desc: '限定春日浪漫饮品',
        price: 20,
        emoji: '🌸',
        cat: 4,
        onSale: true,
        deleted: false
      },

      {
        id: 10,
        name: '蜜桃乌龙',
        desc: '清甜蜜桃遇上醇香乌龙',
        price: 19,
        emoji: '🍑',
        cat: 4,
        onSale: true,
        deleted: false
      }

    ]


    const savedProducts =
      wx.getStorageSync('products')


    if (
      savedProducts &&
      Array.isArray(savedProducts)
    ) {

      this.setData({

        products: savedProducts

      })

    } else {

      wx.setStorageSync(
        'products',
        defaultProducts
      )

      this.setData({

        products: defaultProducts

      })

    }

  },


  // =========================
  // 新增商品
  // =========================

  goAdd() {

    wx.navigateTo({

      url:
        '/pages/admin-product-edit/admin-product-edit'

    })

  },


  // =========================
  // 编辑商品
  // =========================

  goEdit(e) {

    const id =
      String(
        e.currentTarget.dataset.id
      )


    wx.navigateTo({

      url:
        '/pages/admin-product-edit/admin-product-edit?id=' +
        id

    })

  },


  // =========================
  // 上架 / 下架
  // =========================

  toggleSale(e) {

    const id =
      String(
        e.currentTarget.dataset.id
      )


    const products =
      wx.getStorageSync('products') || []


    const index =
      products.findIndex(item => {

        return String(item.id) === id

      })


    if (index === -1) {

      wx.showToast({

        title: '商品不存在',

        icon: 'none'

      })

      return

    }


    // 已删除商品不允许直接上下架
    if (
      products[index].deleted === true
    ) {

      wx.showToast({

        title: '请先恢复商品',

        icon: 'none'

      })

      return

    }


    const currentSale =
      products[index].onSale !== false


    const newSale =
      !currentSale


    products[index].onSale =
      newSale


    wx.setStorageSync(
      'products',
      products
    )


    // 通知首页刷新
    const app =
      getApp()


    if (!app.globalData) {

      app.globalData = {}

    }


    app.globalData.productsChanged =
      true


    this.setData({

      products: products

    })


    wx.showToast({

      title:
        newSale
          ? '商品已上架'
          : '商品已下架',

      icon: 'success',

      duration: 1000

    })

  },


  // =========================
  // 删除商品
  // =========================

  deleteProduct(e) {

    const id =
      String(
        e.currentTarget.dataset.id
      )


    const products =
      wx.getStorageSync('products') || []


    const index =
      products.findIndex(item => {

        return String(item.id) === id

      })


    if (index === -1) {

      wx.showToast({

        title: '商品不存在',

        icon: 'none'

      })

      return

    }


    wx.showModal({

      title: '删除商品',

      content:
        '确定要删除「' +
        products[index].name +
        '」吗？删除后仍会保留商品ID。',

      confirmText: '删除',

      cancelText: '取消',

      success: (res) => {

        if (!res.confirm) {

          return

        }


        products[index].deleted =
          true

        products[index].onSale =
          false


        wx.setStorageSync(
          'products',
          products
        )


        const app =
          getApp()


        if (!app.globalData) {

          app.globalData = {}

        }


        app.globalData.productsChanged =
          true


        this.setData({

          products: products

        })


        wx.showToast({

          title: '商品已删除',

          icon: 'success',

          duration: 1000

        })

      }

    })

  },


  // =========================
  // 恢复商品
  // =========================

  restoreProduct(e) {

    const id =
      String(
        e.currentTarget.dataset.id
      )


    const products =
      wx.getStorageSync('products') || []


    const index =
      products.findIndex(item => {

        return String(item.id) === id

      })


    if (index === -1) {

      wx.showToast({

        title: '商品不存在',

        icon: 'none'

      })

      return

    }


    products[index].deleted =
      false

    products[index].onSale =
      true


    wx.setStorageSync(
      'products',
      products
    )


    const app =
      getApp()


    if (!app.globalData) {

      app.globalData = {}

    }


    app.globalData.productsChanged =
      true


    this.setData({

      products: products

    })


    wx.showToast({

      title: '商品已恢复',

      icon: 'success',

      duration: 1000

    })

  },


  // =========================
  // 返回后台
  // =========================

  goBack() {

    const pages =
      getCurrentPages()


    if (pages.length > 1) {

      wx.navigateBack({

        delta: 1

      })

    } else {

      wx.reLaunch({

        url:
          '/pages/admin/admin'

      })

    }

  }

})

