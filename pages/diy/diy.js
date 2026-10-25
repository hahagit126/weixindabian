// pages/diy/diy.js

Page({
  data: {
    step: 1,

    inspirations: [
      { id: 1, name: '日式抹茶', desc: '清新淡雅', emoji: '🍵', background: 'linear-gradient(145deg,#C8E6C9,#81C784)' },
      { id: 2, name: '焦糖拿铁', desc: '温暖慵懒', emoji: '☕', background: 'linear-gradient(145deg,#D7CCC8,#A1887F)' },
      { id: 3, name: '草莓甜心', desc: '少女甜美', emoji: '🍓', background: 'linear-gradient(145deg,#FCE4EC,#F48FB1)' },
      { id: 4, name: '巧克力梦', desc: '浓郁醇厚', emoji: '🍫', background: 'linear-gradient(145deg,#6D4C41,#D7CCC8)' },
      { id: 5, name: '蜜桃乌龙', desc: '清新甜蜜', emoji: '🍑', background: 'linear-gradient(145deg,#FFE0B2,#FFB74D)' },
      { id: 6, name: '蓝莓星空', desc: '梦幻浪漫', emoji: '🫐', background: 'linear-gradient(145deg,#E1BEE7,#BA68C8)' },
      { id: 7, name: '柠檬阳光', desc: '活力清爽', emoji: '🍋', background: 'linear-gradient(145deg,#FFF9C4,#FFEE58)' },
      { id: 8, name: '樱花物语', desc: '浪漫春日', emoji: '🌸', background: 'linear-gradient(145deg,#F8BBD0,#E1BEE7)' },
      { id: 9, name: '椰林海风', desc: '热带度假', emoji: '🥥', background: 'linear-gradient(145deg,#E0F7FA,#80DEEA)' },
      { id: 10, name: '芒果热情', desc: '阳光活力', emoji: '🥭', background: 'linear-gradient(145deg,#FFF9C4,#FFB74D)' },
      { id: 11, name: '香草温柔', desc: '细腻柔和', emoji: '🍦', background: 'linear-gradient(145deg,#FFF8E1,#FFE082)' },
      { id: 12, name: '葡萄微醺', desc: '优雅神秘', emoji: '🍇', background: 'linear-gradient(145deg,#E8EAF6,#7986CB)' }
    ],

    bases: [
      { id: 'b1', name: '鲜牛奶', emoji: '🥛', price: 8, background: '#F5F5F5' },
      { id: 'b2', name: '燕麦奶', emoji: '🌾', price: 10, background: '#FFF3E0' },
      { id: 'b3', name: '椰奶', emoji: '🥥', price: 12, background: '#F1F8E9' },
      { id: 'b4', name: '乌龙茶', emoji: '🍵', price: 8, background: '#E8F5E9' },
      { id: 'b5', name: '红茶', emoji: '🫖', price: 7, background: '#FBE9E7' },
      { id: 'b6', name: '气泡水', emoji: '🫧', price: 6, background: '#E3F2FD' },
      { id: 'b7', name: '豆浆', emoji: '🫘', price: 7, background: '#FFF8E1' },
      { id: 'b8', name: '酸奶', emoji: '🥛', price: 9, background: '#F3E5F5' },
      { id: 'b9', name: '果汁', emoji: '🧃', price: 10, background: '#FFF3E0' }
    ],

    toppings: [
      { id: 't1', name: '珍珠', emoji: '⚫', price: 3, selected: false },
      { id: 't2', name: '椰果', emoji: '🥥', price: 3, selected: false },
      { id: 't3', name: '芋圆', emoji: '🟣', price: 4, selected: false },
      { id: 't4', name: '红豆', emoji: '🔴', price: 3, selected: false },
      { id: 't5', name: '奶盖', emoji: '🤍', price: 5, selected: false },
      { id: 't6', name: '冰淇淋', emoji: '🍦', price: 6, selected: false },
      { id: 't7', name: '布丁', emoji: '🍮', price: 4, selected: false },
      { id: 't8', name: '仙草', emoji: '🌿', price: 3, selected: false },
      { id: 't9', name: '芋泥', emoji: '🟤', price: 5, selected: false },
      { id: 't10', name: '芝士', emoji: '🧀', price: 5, selected: false },
      { id: 't11', name: '草莓', emoji: '🍓', price: 5, selected: false },
      { id: 't12', name: '芒果', emoji: '🥭', price: 5, selected: false },
      { id: 't13', name: '奥利奥', emoji: '🍪', price: 3, selected: false },
      { id: 't14', name: '蜂蜜', emoji: '🍯', price: 3, selected: false },
      { id: 't15', name: '蓝莓', emoji: '🫐', price: 5, selected: false },
      { id: 't16', name: '桃子', emoji: '🍑', price: 5, selected: false },
      { id: 't17', name: '葡萄', emoji: '🍇', price: 5, selected: false },
      { id: 't18', name: '西瓜', emoji: '🍉', price: 4, selected: false },
      { id: 't19', name: '香蕉', emoji: '🍌', price: 4, selected: false },
      { id: 't20', name: '巧克力', emoji: '🍫', price: 4, selected: false },
      { id: 't21', name: '焦糖', emoji: '🍮', price: 4, selected: false },
      { id: 't22', name: '抹茶粉', emoji: '🍵', price: 3, selected: false },
      { id: 't23', name: '坚果', emoji: '🥜', price: 5, selected: false },
      { id: 't24', name: '椰子片', emoji: '🥥', price: 3, selected: false },
      { id: 't25', name: '柠檬', emoji: '🍋', price: 3, selected: false },
      { id: 't26', name: '百香果', emoji: '🟡', price: 4, selected: false },
      { id: 't27', name: '玫瑰', emoji: '🌹', price: 5, selected: false },
      { id: 't28', name: '桂花', emoji: '🌼', price: 4, selected: false },
      { id: 't29', name: '薄荷叶', emoji: '🍃', price: 3, selected: false },
      { id: 't30', name: '肉桂', emoji: '🟫', price: 3, selected: false },
      { id: 't31', name: '荔枝', emoji: '🍒', price: 5, selected: false },
      { id: 't32', name: '橙子', emoji: '🍊', price: 4, selected: false },
      { id: 't33', name: '菠萝', emoji: '🍍', price: 4, selected: false },
      { id: 't34', name: '樱桃', emoji: '🍒', price: 5, selected: false },
      { id: 't35', name: '猕猴桃', emoji: '🥝', price: 4, selected: false },
      { id: 't36', name: '番茄', emoji: '🍅', price: 3, selected: false },
      { id: 't37', name: '果冻', emoji: '🍮', price: 4, selected: false },
      { id: 't38', name: '棉花糖', emoji: '🍬', price: 3, selected: false },
      { id: 't39', name: '花生', emoji: '🥜', price: 3, selected: false },
      { id: 't40', name: '红枣', emoji: '🔴', price: 4, selected: false }
    ],

    selectedInspiration: null,
    selectedBase: null,
    selectedToppings: [],
    productName: '',
    previewName: '自创特调',
    previewEmoji: '🎨',
    previewPrice: 0,
    previewDesc: ''
  },

  onLoad() {
    this.updatePreview()
  },

  selectInspiration(e) {
    this.setData({
      selectedInspiration: Number(e.currentTarget.dataset.id)
    })
    this.updatePreview()
  },

  selectBase(e) {
    this.setData({
      selectedBase: String(e.currentTarget.dataset.id)
    })
    this.updatePreview()
  },

  toggleTopping(e) {
    const id = String(e.currentTarget.dataset.id)
    const toppings = this.data.toppings.map(item => {
      if (String(item.id) === id) {
        return { ...item, selected: !item.selected }
      }
      return item
    })

    this.setData({
      toppings,
      selectedToppings: toppings
        .filter(item => item.selected)
        .map(item => item.id)
    })
    this.updatePreview()
  },

  inputName(e) {
    this.setData({ productName: e.detail.value })
    this.updatePreview()
  },

  nextStep() {
    const step = this.data.step

    if (step === 1 && !this.data.selectedInspiration) {
      wx.showToast({ title: '先选一张灵感图~', icon: 'none' })
      return
    }

    if (step === 2 && !this.data.selectedBase) {
      wx.showToast({ title: '请选一个基底~', icon: 'none' })
      return
    }

    if (step < 4) {
      this.setData({ step: step + 1 })
      this.updatePreview()
    }
  },

  prevStep() {
    if (this.data.step > 1) {
      this.setData({ step: this.data.step - 1 })
    } else {
      wx.navigateBack()
    }
  },

  updatePreview() {
    const base = this.data.bases.find(
      item => String(item.id) === String(this.data.selectedBase)
    )
    const inspiration = this.data.inspirations.find(
      item => item.id === Number(this.data.selectedInspiration)
    )
    const selectedToppings = this.data.toppings.filter(item => item.selected)

    let price = base ? Number(base.price) : 0
    selectedToppings.forEach(item => {
      price += Number(item.price)
    })

    const name = this.data.productName.trim() ||
      (base ? base.name + '特调' : '自创特调')

    const desc = [
      inspiration ? inspiration.desc : '',
      base ? base.name : '',
      ...selectedToppings.map(item => item.name)
    ].filter(Boolean).join(' · ')

    this.setData({
      previewName: name,
      previewEmoji: inspiration
        ? inspiration.emoji
        : (base ? base.emoji : '🎨'),
      previewPrice: Number(price.toFixed(2)),
      previewDesc: desc
    })
  },

  // 加入购物车并保存完整配方，供服务器重新核价
  addToCart() {
    const base = this.data.bases.find(
      item => String(item.id) === String(this.data.selectedBase)
    )

    if (!base) {
      wx.showToast({ title: '请先选择基底~', icon: 'none' })
      return
    }

    const inspiration = this.data.inspirations.find(
      item => item.id === Number(this.data.selectedInspiration)
    )
    const toppingList = this.data.toppings.filter(item => item.selected)
    const name = this.data.productName.trim() || base.name + '特调'
    const toppingIds = toppingList.map(item => String(item.id))
    const price = Number((
      Number(base.price) +
      toppingList.reduce((sum, item) => sum + Number(item.price), 0)
    ).toFixed(2))

    const id = 'diy_' + Date.now()
    const desc = [
      inspiration ? inspiration.desc : '',
      base.name,
      ...toppingList.map(item => item.name)
    ].filter(Boolean).join(' · ')

    const item = {
      id,
      name: '🎨 ' + name,
      customName: name,
      desc,
      price,
      emoji: inspiration ? inspiration.emoji : base.emoji,
      cat: 0,
      tag: 'new',
      isDiy: true,
      diy: {
        inspirationId: inspiration ? Number(inspiration.id) : null,
        inspirationName: inspiration ? inspiration.name : '',
        inspirationDesc: inspiration ? inspiration.desc : '',
        inspirationEmoji: inspiration ? inspiration.emoji : base.emoji,
        baseId: String(base.id),
        baseName: base.name,
        toppingIds,
        toppingNames: toppingList.map(item => item.name),
        toppingList: toppingList.map(item => ({
          id: String(item.id),
          name: item.name,
          emoji: item.emoji
        }))
      }
    }

    const cart = wx.getStorageSync('cart') || {}
    cart[id] = (Number(cart[id]) || 0) + 1
    wx.setStorageSync('cart', cart)

    let diyItems = wx.getStorageSync('diy_items') || []
    if (!Array.isArray(diyItems)) {
      diyItems = Object.keys(diyItems).map(key => ({
        ...diyItems[key],
        id: diyItems[key].id || key
      }))
    }

    diyItems.push(item)
    wx.setStorageSync('diy_items', diyItems)

    wx.showModal({
      title: '🧸 创作成功！',
      content: '已加入购物车~',
      showCancel: false,
      confirmText: '继续逛逛',
      success: () => wx.navigateBack()
    })
  }
})