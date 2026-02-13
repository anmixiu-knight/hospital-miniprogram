const api = require('../../utils/api.js')
Page({
  data: {
    username: "",
    password: "",
  },

  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    })
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    })
  },

  // 登录函数
  async handleLogin() {
    const { username, password } = this.data
    
    if (!username || !password) {
      wx.showToast({ 
        title: "请输入账号和密码", 
        icon: "none" 
      });
      return;
    }

    // 显示加载中
    wx.showLoading({
      title: '登录中...',
      mask: true
    })
    try {
      // 调用 api.login 函数
      const result = await api.login({
        username: username,
        password: password
      })
      // 隐藏加载
      wx.hideLoading()
      if(result.code === 0 || result.success){
        console.log('登录成功:', result)
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1000
        })
        // 延迟跳转
        if(result.data.Level == 1){
          setTimeout(() => {
            wx.reLaunch({
              url:'/pages/index/index',
            })
          }, 1000)}
        else if(result.data.Level == 2){
          wx.showToast({
            title: '管理员不可使用该功能',
            icon: 'none',
            duration: 2000
          })
        }}
      else {
        // 业务逻辑失败（如密码错误）
        wx.showToast({
          title: result.message || '登录失败',
          icon: 'none',
          duration: 2000
        })
      }
    } catch (error) {
      // 隐藏加载
      wx.hideLoading()
      console.error('登录失败:', error)
      // 处理错误
      let errorMsg = '登录失败，请重试'
      if (error.errMsg && error.errMsg.includes('request:fail')) {
        // 网络错误
        errorMsg = '网络连接失败，请检查网络'
      } else if (error.message) {
        errorMsg = error.message
      }
      wx.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 2000
      })
    }
  }
})