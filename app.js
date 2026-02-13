// app.js
App({
  onLaunch() {
    // 全局配置request
    wx.request = (function(originalRequest) {
      return function(config) {
        // 自动为所有请求添加cookies
        const savedCookies = wx.getStorageSync('session_cookies');
        if (savedCookies && savedCookies.length > 0) {
          if (!config.header) {
            config.header = {};
          }
          if (!config.header['Cookie']) {
            config.header['Cookie'] = savedCookies.join('; ');
          }
        }
        
        // 确保启用cookie
        if (config.enableCookie === undefined) {
          config.enableCookie = true;
        }
        
        return originalRequest(config);
      };
    })(wx.request);
  },
  globalData: {
    userInfo: null
  }
})
