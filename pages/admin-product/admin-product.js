const API = 'http://10.189.151.105/bear-store-api/'
//const API = 'http://127.0.0.1/bear-store-api/'

Page({
  data: {
    products: []
  },

  onLoad() {
    this.loadProducts()
  },

  onShow() {
    this.loadProducts()
  },

  // 从服务器读取商品
  loadProducts() {
    wx.request({
      url: API,
      method: 'GET',

      success: (res) => {
        if (
          res.statusCode === 200 &&
          res.data &&
          res.data.code === 0 &&
          Array.isArray(res.data.data)
        ) {
          const products = res.data.data

          this.setData({
            products: products
          })

          // 同步本地缓存，兼容其他页面
          wx.setStorageSync('products', products)
        } else {
          wx.showToast({
            title: '商品加载失败',
            icon: 'none'
          })
        }
      },

      fail: () => {
        wx.showToast({
          title: '服务器连接失败',
          icon: 'none'
        })
      }
    })
  },

  // 保存商品列表到服务器
  saveProducts(products, message) {
    wx.request({
      url: API,
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        products: products
      },

      success: (res) => {
        if (
          res.statusCode === 200 &&
          res.data &&
          res.data.code === 0
        ) {
          this.setData({
            products: products
          })

          wx.setStorageSync('products', products)

          wx.showToast({
            title: message,
            icon: 'success'
          })
        } else {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          })

          this.loadProducts()
        }
      },

      fail: () => {
        wx.showToast({
          title: '服务器连接失败',
          icon: 'none'
        })

        this.loadProducts()
      }
    })
  },

  // 跳转新增商品页面
  goAdd() {
    wx.navigateTo({
      url: '/pages/admin-product-edit/admin-product-edit'
    })
  },

  // 跳转编辑商品页面
  goEdit(e) {
    const id = e.currentTarget.dataset.id

    wx.navigateTo({
      url: '/pages/admin-product-edit/admin-product-edit?id=' +
        encodeURIComponent(String(id))
    })
  },

  // 上架和下架
  toggleSale(e) {
    const id = String(e.currentTarget.dataset.id)
    const products = this.data.products.map(item => ({ ...item }))

    const index = products.findIndex(
      item => String(item.id) === id
    )

    if (index === -1) {
      wx.showToast({
        title: '未找到该商品',
        icon: 'none'
      })
      return
    }

    if (products[index].deleted === true) {
      wx.showToast({
        title: '请先恢复该商品',
        icon: 'none'
      })
      return
    }

    products[index].onSale = products[index].onSale === false

    this.saveProducts(
      products,
      products[index].onSale ? '上架成功' : '下架成功'
    )
  },

  // 删除商品（软删除，保留数据）
  deleteProduct(e) {
    const id = String(e.currentTarget.dataset.id)
    const products = this.data.products.map(item => ({ ...item }))

    const index = products.findIndex(
      item => String(item.id) === id
    )

    if (index === -1) {
      wx.showToast({
        title: '未找到该商品',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '确认删除',
      content: '确定删除商品「' + products[index].name + '」吗？',

      success: (res) => {
        if (!res.confirm) return

        products[index].deleted = true
        products[index].onSale = false

        this.saveProducts(products, '删除成功')
      }
    })
  },

  // 恢复商品
  restoreProduct(e) {
    const id = String(e.currentTarget.dataset.id)
    const products = this.data.products.map(item => ({ ...item }))

    const index = products.findIndex(
      item => String(item.id) === id
    )

    if (index === -1) {
      wx.showToast({
        title: '未找到该商品',
        icon: 'none'
      })
      return
    }

    products[index].deleted = false
    products[index].onSale = true

    this.saveProducts(products, '恢复成功')
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.reLaunch({
          url: '/pages/admin/admin'
        })
      }
    })
  }
})
