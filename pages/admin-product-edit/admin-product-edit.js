
 // pages/admin-product-edit/admin-product-edit.js

 Page({
  data: {
    isEdit: false,
    id: '',
    name: '',
    desc: '',
    price: '',
    emoji: '🧋',
    emojiPickerShow: false,

    emojiList: [
      '🧋', '☕', '🍯', '🍰', '🍪', '🧁', '🥐', '🍱',
      '🌸', '🍑', '🍓', '🍫', '🍵', '🥤', '🍋', '🍊',
      '🍎', '🍉', '🍇', '🥪', '🍔', '🍟', '🍕', '🌭',
      '🍩', '🍨', '🍧', '🎂', '🍮', '🍡'
    ],

    cat: 1,

    categoryList: [
      { id: 1, name: '特调饮品' },
      { id: 2, name: '甜蜜糕点' },
      { id: 3, name: '轻食简餐' },
      { id: 4, name: '季节限定' }
    ],

    categoryIndex: 0,
    onSale: true,
    saving: false
  },

  // PHP 接口地址
  apiUrl: 'http://127.0.0.1/bear-store-api/',

  onLoad(options) {
    const id = options && options.id ? String(options.id) : ''

    if (id) {
      this.setData({ isEdit: true, id })
      this.loadProduct(id)
    } else {
      this.setData({
        isEdit: false,
        id: '',
        name: '',
        desc: '',
        price: '',
        emoji: '🧋',
        emojiPickerShow: false,
        cat: 1,
        categoryIndex: 0,
        onSale: true
      })
    }
  },

  // 从服务器读取商品，避免编辑时加载到旧缓存
  loadProduct(id) {
    wx.request({
      url: this.apiUrl,
      method: 'GET',

      success: (res) => {
        const result = res.data

        if (
          res.statusCode !== 200 ||
          !result ||
          result.code !== 0 ||
          !Array.isArray(result.data)
        ) {
          this.loadProductFromCache(id)
          return
        }

        const products = result.data
        wx.setStorageSync('products', products)

        const product = products.find(
          item => String(item.id) === String(id)
        )

        if (!product) {
          wx.showToast({ title: '商品不存在', icon: 'none' })
          setTimeout(() => wx.navigateBack(), 800)
          return
        }

        this.fillProductForm(product)
      },

      fail: () => {
        // 服务器不可用时允许查看本地缓存，但保存仍需服务器成功
        this.loadProductFromCache(id)
      }
    })
  },

  loadProductFromCache(id) {
    const products = wx.getStorageSync('products') || []
    const product = products.find(
      item => String(item.id) === String(id)
    )

    if (!product) {
      wx.showToast({
        title: '商品读取失败，请检查服务器连接',
        icon: 'none'
      })
      return
    }

    this.fillProductForm(product)
  },

  fillProductForm(product) {
    let categoryIndex = this.data.categoryList.findIndex(
      item => Number(item.id) === Number(product.cat)
    )

    if (categoryIndex < 0) categoryIndex = 0

    this.setData({
      isEdit: true,
      id: String(product.id),
      name: product.name || '',
      desc: product.desc || product.description || '',
      price: product.price === undefined ? '' : String(product.price),
      emoji: product.emoji || '🧋',
      emojiPickerShow: false,
      cat: Number(product.cat) || 1,
      categoryIndex,
      onSale: product.onSale !== false
    })
  },

  inputName(e) {
    this.setData({ name: e.detail.value })
  },

  inputDesc(e) {
    this.setData({ desc: e.detail.value })
  },

  inputPrice(e) {
    this.setData({ price: e.detail.value })
  },

  toggleEmojiPicker() {
    this.setData({
      emojiPickerShow: !this.data.emojiPickerShow
    })
  },

  selectEmoji(e) {
    this.setData({
      emoji: e.currentTarget.dataset.emoji,
      emojiPickerShow: false
    })
  },

  changeCategory(e) {
    const index = Number(e.detail.value)
    const category = this.data.categoryList[index]

    if (!category) return

    this.setData({
      categoryIndex: index,
      cat: category.id
    })
  },

  toggleSale() {
    this.setData({ onSale: !this.data.onSale })
  },

  // 保存商品：先保存服务器，成功后再保存本地缓存
  saveProduct() {
    if (this.data.saving) return

    const name = String(this.data.name || '').trim()
    const desc = String(this.data.desc || '').trim()
    const priceText = String(this.data.price || '').trim()

    if (!name) {
      wx.showToast({ title: '请输入商品名称', icon: 'none' })
      return
    }

    if (name.length > 20) {
      wx.showToast({ title: '商品名称不能超过20字', icon: 'none' })
      return
    }

    if (!desc) {
      wx.showToast({ title: '请输入商品描述', icon: 'none' })
      return
    }

    if (desc.length > 50) {
      wx.showToast({ title: '商品描述不能超过50字', icon: 'none' })
      return
    }

    if (!priceText) {
      wx.showToast({ title: '请输入商品价格', icon: 'none' })
      return
    }

    const price = Number(priceText)

    if (!Number.isFinite(price) || price <= 0) {
      wx.showToast({ title: '请输入正确价格', icon: 'none' })
      return
    }

    if (price > 9999) {
      wx.showToast({ title: '价格不能超过9999元', icon: 'none' })
      return
    }

    if (Math.round(price * 100) !== price * 100) {
      wx.showToast({ title: '价格最多两位小数', icon: 'none' })
      return
    }

    this.setData({ saving: true })

    // 重新从服务器读取完整列表，避免只把旧缓存写回服务器
    wx.request({
      url: this.apiUrl,
      method: 'GET',

      success: (res) => {
        const result = res.data

        if (
          res.statusCode !== 200 ||
          !result ||
          result.code !== 0 ||
          !Array.isArray(result.data)
        ) {
          this.saveFailed('读取服务器商品失败')
          return
        }

        let products = result.data
        let savedProduct

        if (this.data.isEdit) {
          const index = products.findIndex(
            item => String(item.id) === String(this.data.id)
          )

          if (index < 0) {
            this.saveFailed('服务器中找不到该商品')
            return
          }

          const oldProduct = products[index]

          savedProduct = {
            ...oldProduct,
            id: oldProduct.id,
            name,
            desc,
            description: desc,
            price: Number(price.toFixed(2)),
            emoji: this.data.emoji,
            cat: this.data.cat,
            onSale: this.data.onSale,
            deleted: oldProduct.deleted === true
          }

          products[index] = savedProduct
        } else {
          const maxId = products.reduce((max, item) => {
            return Math.max(max, Number(item.id) || 0)
          }, 0)

          savedProduct = {
            id: maxId + 1,
            name,
            desc,
            description: desc,
            price: Number(price.toFixed(2)),
            emoji: this.data.emoji,
            cat: this.data.cat,
            tag: '',
            tagText: '',
            background: 'linear-gradient(135deg,#E8F5E9,#A5D6A7)',
            onSale: this.data.onSale,
            deleted: false
          }

          products.push(savedProduct)
        }

        // 将完整商品列表发送到 PHP 的 products.json
        wx.request({
          url: this.apiUrl,
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          data: {
            products
          },

          success: (saveRes) => {
            const saveResult = saveRes.data

            if (
              saveRes.statusCode !== 200 ||
              !saveResult ||
              saveResult.code !== 0 ||
              !Array.isArray(saveResult.data)
            ) {
              this.saveFailed(
                (saveResult && saveResult.message) || '服务器保存失败'
              )
              return
            }

            // 只在服务器确认保存成功后更新缓存
            wx.setStorageSync('products', saveResult.data)

            const app = getApp()
            if (!app.globalData) app.globalData = {}
            app.globalData.productsChanged = true

            this.setData({ saving: false })

            wx.showToast({
              title: this.data.isEdit ? '商品已保存' : '商品已新增',
              icon: 'success',
              duration: 1000
            })

            setTimeout(() => {
              wx.navigateBack({ delta: 1 })
            }, 1000)
          },

          fail: (err) => {
            console.error('POST 商品保存失败：', err)
            this.saveFailed('服务器连接失败，未保存')
          }
        })
      },

      fail: (err) => {
        console.error('GET 商品列表失败：', err)
        this.saveFailed('无法连接服务器，未保存')
      }
    })
  },

  saveFailed(message) {
    this.setData({ saving: false })
    wx.showToast({
      title: message || '保存失败',
      icon: 'none',
      duration: 2000
    })
  },

  goBack() {
    wx.navigateBack({ delta: 1 })
  }
})
