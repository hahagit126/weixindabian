
// pages/checkout/checkout.js
const API = 'http://10.189.151.105/bear-store-api/'

Page({
  data: {
    orderList: [],
    totalPrice: 0,
    deliveryFee: 0,
    finalPrice: 0,
    totalCount: 0,
    deliveryType: '配送',
    deliveryAddress: '',
    locationName: '',
    latitude: 0,
    longitude: 0,
    markers: [],
    hasLocation: false,
    submitting: false
  },

  onLoad() {
    this.loadOrder()
  },

  onShow() {
    this.loadOrder()
  },

  // 离开结算页时恢复完整购物车
  // 订单成功后会先删除备份，因此不会恢复已购买商品
  onUnload() {
    this.restoreCartAfterCheckout()
  },

  restoreCartAfterCheckout() {
    const originalCart = wx.getStorageSync('cart_before_checkout')

    if (
      originalCart &&
      typeof originalCart === 'object' &&
      !Array.isArray(originalCart)
    ) {
      wx.setStorageSync('cart', originalCart)
      wx.removeStorageSync('cart_before_checkout')
    }
  },

  // 加载结算商品
  loadOrder() {
    const cart = wx.getStorageSync('cart') || {}
    let diyItems = wx.getStorageSync('diy_items') || []

    if (!Array.isArray(diyItems)) {
      diyItems = Object.keys(diyItems).map(key => ({
        ...diyItems[key],
        id: diyItems[key].id || key
      }))
    }

    wx.request({
      url: API,
      method: 'GET',

      success: res => {
        if (
          res.statusCode !== 200 ||
          !res.data ||
          res.data.code !== 0 ||
          !Array.isArray(res.data.data)
        ) {
          wx.showToast({
            title: '读取服务器商品失败',
            icon: 'none'
          })
          return
        }

        const products = res.data.data
        wx.setStorageSync('products', products)

        const orderList = []

        Object.keys(cart).forEach(key => {
          const quantity = Number(cart[key]) || 0
          if (quantity <= 0) return

          const product = products.find(
            item => String(item.id) === String(key)
          )

          if (product) {
            if (
              product.onSale === false ||
              product.deleted === true
            ) {
              return
            }

            const price = Number(product.price)
            if (!Number.isFinite(price) || price < 0) return

            orderList.push({
              ...product,
              cartId: key,
              quantity,
              price,
              subtotal: Number((price * quantity).toFixed(2)),
              isDIY: false
            })
            return
          }

          const diyItem = diyItems.find(
            item => String(item.id) === String(key)
          )

          if (!diyItem || !diyItem.diy) {
            wx.showToast({
              title: '有商品信息缺失，请重新制作 DIY 商品',
              icon: 'none'
            })
            return
          }

          const price = Number(diyItem.price)
          if (!Number.isFinite(price) || price < 0) return

          orderList.push({
            ...diyItem,
            cartId: key,
            quantity,
            price,
            subtotal: Number((price * quantity).toFixed(2)),
            isDIY: true
          })
        })

        const totalPrice = Number(
          orderList.reduce(
            (sum, item) => sum + Number(item.subtotal || 0),
            0
          ).toFixed(2)
        )

        const totalCount = orderList.reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0
        )

        this.calculatePrice(
          totalPrice,
          totalCount,
          this.data.deliveryType,
          orderList
        )
      },

      fail: () => {
        wx.showToast({
          title: '无法连接服务器，请检查 PHPstudy',
          icon: 'none'
        })
      }
    })
  },

  // 手动选择配送地址
  chooseDeliveryLocation() {
    const options = {}

    if (this.data.hasLocation) {
      options.latitude = this.data.latitude
      options.longitude = this.data.longitude
    }

    wx.chooseLocation({
      ...options,

      success: res => {
        const name = res.name || res.address

        if (!name && !res.address) {
          wx.showToast({
            title: '请重新选择具体配送地址',
            icon: 'none'
          })
          return
        }

        const address = [
          res.address || '',
          res.name || ''
        ].filter(Boolean).join(' ')

        this.setData({
          locationName: name || '已选择配送位置',
          deliveryAddress: address,
          latitude: res.latitude,
          longitude: res.longitude,
          hasLocation: true,
          markers: [{
            id: 1,
            latitude: res.latitude,
            longitude: res.longitude,
            title: name || '配送位置',
            width: 28,
            height: 28
          }]
        })

        wx.showToast({
          title: '配送地址已确认',
          icon: 'success'
        })
      },

      fail: err => {
        if (err && /cancel/i.test(err.errMsg || '')) return

        wx.showToast({
          title: '无法打开地图选点，请检查定位权限',
          icon: 'none'
        })
      }
    })
  },

  // 自动定位，然后打开地图确认具体配送地址
  locateCurrentPosition() {
    wx.getSetting({
      success: setting => {
        const runLocation = () => {
          wx.getLocation({
            type: 'gcj02',
            isHighAccuracy: true,

            success: res => {
              // 先记录当前经纬度，作为地图初始位置
              this.setData({
                latitude: res.latitude,
                longitude: res.longitude,
                locationName: '正在确认当前位置',
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

              // 打开微信地图，确认实际配送位置
              wx.chooseLocation({
                latitude: res.latitude,
                longitude: res.longitude,

                success: location => {
                  const name = location.name || location.address

                  if (!name && !location.address) {
                    this.setData({
                      deliveryAddress: '',
                      locationName: '',
                      hasLocation: false
                    })

                    wx.showToast({
                      title: '请重新选择具体配送地址',
                      icon: 'none'
                    })
                    return
                  }

                  const address = [
                    location.address || '',
                    location.name || ''
                  ].filter(Boolean).join(' ')

                  this.setData({
                    locationName: name || '已选择配送位置',
                    deliveryAddress: address,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    hasLocation: true,
                    markers: [{
                      id: 1,
                      latitude: location.latitude,
                      longitude: location.longitude,
                      title: name || '配送位置',
                      width: 28,
                      height: 28
                    }]
                  })

                  wx.showToast({
                    title: '配送地址已确认',
                    icon: 'success'
                  })
                },

                fail: err => {
                  if (err && /cancel/i.test(err.errMsg || '')) {
                    wx.showToast({
                      title: '请确认配送地址后再提交',
                      icon: 'none'
                    })
                    return
                  }

                  wx.showToast({
                    title: '地图选点失败，请手动选择地址',
                    icon: 'none'
                  })
                }
              })
            },

            fail: () => {
              wx.showToast({
                title: '定位失败，请检查定位权限',
                icon: 'none'
              })
            }
          })
        }

        if (
          setting.authSetting &&
          setting.authSetting['scope.userLocation'] === false
        ) {
          wx.showModal({
            title: '需要定位权限',
            content: '请在设置中允许使用位置信息。',
            confirmText: '去设置',
            success: res => {
              if (res.confirm) {
                wx.openSetting({})
              }
            }
          })
        } else {
          runLocation()
        }
      },

      fail: () => {
        wx.showToast({
          title: '无法读取定位权限设置',
          icon: 'none'
        })
      }
    })
  },

  // 选择配送或到店自取
  selectDelivery(e) {
    const type = e.currentTarget.dataset.type

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

  // 计算金额
  calculatePrice(totalPrice, totalCount, deliveryType, orderList) {
    let deliveryFee = 0

    if (
      deliveryType === '配送' &&
      totalPrice > 0 &&
      totalPrice < 30
    ) {
      deliveryFee = 3
    }

    this.setData({
      orderList,
      totalPrice,
      deliveryFee,
      finalPrice: Number((totalPrice + deliveryFee).toFixed(2)),
      totalCount
    })
  },

  // 确认提交订单
  submitOrder() {
    if (this.data.submitting) return

    if (!this.data.orderList.length) {
      wx.showToast({
        title: '没有可提交的商品',
        icon: 'none'
      })
      return
    }

    // 配送订单必须有已确认的地址和有效坐标
    if (
      this.data.deliveryType === '配送' &&
      (
        !this.data.hasLocation ||
        !this.data.deliveryAddress ||
        !this.data.latitude ||
        !this.data.longitude ||
        this.data.deliveryAddress.indexOf('请点击地图确认') !== -1
      )
    ) {
      wx.showModal({
        title: '请选择配送地址',
        content: '请先自动定位并在地图中确认具体配送地址。',
        confirmText: '选择地址',
        success: res => {
          if (res.confirm) {
            this.chooseDeliveryLocation()
          }
        }
      })
      return
    }

    wx.showModal({
      title: '确认订单',
      content:
        this.data.deliveryType +
        '，共' + this.data.totalCount +
        '件商品，预计合计¥' + this.data.finalPrice.toFixed(2),
      confirmText: '提交订单',
      cancelText: '再看看',
      success: res => {
        if (res.confirm) {
          this.createServerOrder()
        }
      }
    })
  },

  // 创建服务器订单
  createServerOrder() {
    if (this.data.submitting) return

    this.setData({
      submitting: true
    })

    const items = this.data.orderList.map(item => {
      const orderItem = {
        id: item.id,
        quantity: Number(item.quantity)
      }

      if (item.isDIY || item.isDiy) {
        orderItem.type = 'diy'
        orderItem.diy = item.diy
        orderItem.customName = item.customName || item.name
      }

      return orderItem
    })

    const isDelivery = this.data.deliveryType === '配送'

    const remark = isDelivery
      ? '校园配送；收货地址：' + this.data.deliveryAddress +
        '；位置：' + this.data.latitude + ',' + this.data.longitude
      : '到店自取'

    wx.request({
      url: API,
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        action: 'createOrder',
        order: {
          items,
          remark,
          deliveryType: this.data.deliveryType,
          deliveryAddress: isDelivery
            ? this.data.deliveryAddress
            : '',
          latitude: isDelivery ? this.data.latitude : null,
          longitude: isDelivery ? this.data.longitude : null
        }
      },

      success: res => {
        const body = res.data || {}

        if (
          res.statusCode !== 200 ||
          body.code !== 0 ||
          !body.data
        ) {
          this.setData({
            submitting: false
          })

          wx.showModal({
            title: '订单提交失败',
            content: body.message ||
              '服务器未能创建订单，请检查商品信息后重试。',
            showCancel: false
          })
          return
        }

        const serverOrder = body.data
        const totalPrice = Number(serverOrder.total || 0)
        const deliveryFee = Number(serverOrder.deliveryFee || 0)
        const finalPrice = Number(
          serverOrder.finalPrice !== undefined
            ? serverOrder.finalPrice
            : totalPrice + deliveryFee
        )

        const newOrder = {
          ...serverOrder,
          id: serverOrder.id,
          time: serverOrder.createdAt || '',
          status: serverOrder.status || '待处理',
          statusText: serverOrder.status || '待处理',
          deliveryType:
            serverOrder.deliveryType || this.data.deliveryType,
          deliveryInfo: serverOrder.deliveryAddress ||
            (isDelivery ? this.data.deliveryAddress : '到店自取'),
          deliveryAddress: serverOrder.deliveryAddress ||
            (isDelivery ? this.data.deliveryAddress : ''),
          latitude: serverOrder.latitude !== undefined
            ? serverOrder.latitude
            : (isDelivery ? this.data.latitude : 0),
          longitude: serverOrder.longitude !== undefined
            ? serverOrder.longitude
            : (isDelivery ? this.data.longitude : 0),
          totalPrice,
          deliveryFee,
          finalPrice,
          totalCount: this.data.totalCount
        }

        // 保存本地订单记录
        const oldOrders = wx.getStorageSync('orders') || []
        const orders = Array.isArray(oldOrders) ? oldOrders : []

        const filteredOrders = orders.filter(
          order => String(order.id) !== String(newOrder.id)
        )

        filteredOrders.unshift(newOrder)
        wx.setStorageSync('orders', filteredOrders)

        // 订单成功后，从结算前的完整购物车中删除已购买商品
        const backupCart = wx.getStorageSync('cart_before_checkout')
        const currentCart = wx.getStorageSync('cart') || {}

        const cart = (
          backupCart &&
          typeof backupCart === 'object' &&
          !Array.isArray(backupCart)
        )
          ? { ...backupCart }
          : { ...currentCart }

        this.data.orderList.forEach(item => {
          delete cart[String(item.cartId)]
        })

        // 保留仍在购物车中的 DIY 商品
        const diyItems = wx.getStorageSync('diy_items') || []

        const diyList = Array.isArray(diyItems)
          ? diyItems
          : Object.keys(diyItems).map(key => ({
              ...diyItems[key],
              id: diyItems[key].id || key
            }))

        const remainingDiy = diyList.filter(item =>
          Object.prototype.hasOwnProperty.call(
            cart,
            String(item.id)
          )
        )

        wx.setStorageSync('cart', cart)
        wx.setStorageSync('diy_items', remainingDiy)

        // 清除备份，避免离开结算页时恢复已购买商品
        wx.removeStorageSync('cart_before_checkout')

        this.setData({
          submitting: false
        })

        wx.showModal({
          title: '下单成功',
          content:
            '订单编号：' + (newOrder.id || '已生成') +
            '\n实付金额：¥' + finalPrice.toFixed(2),
          showCancel: false,
          confirmText: '返回首页',
          success: () => {
            wx.reLaunch({
              url: '/pages/index/index'
            })
          }
        })
      },

      fail: () => {
        this.setData({
          submitting: false
        })

        wx.showModal({
          title: '连接失败',
          content:
            '订单没有得到服务器确认，购物车已保留。请检查 PHPstudy 和接口地址后重试。',
          showCancel: false
        })
      }
    })
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      fail: () => {
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }
    })
  }
})
