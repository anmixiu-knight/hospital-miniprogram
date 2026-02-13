const app = getApp();
const baseUrl = 'http://127.0.0.1:8080/api'
const baseUrl1 = 'http://127.0.0.1:8087/api'
const login = ({
  username,
  password
}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + "/user/login",
      method: 'POST',
      data: {
        username: username.trim(),
        password: password
      },
      header: {
        'Content-Type': 'application/json'
      },
      enableHttp2: true,
      enableQuic: true,
      enableCache: true,
      enableCookie: true, // 启用cookie存储
      success: (r) => {
        if (r.cookies && r.cookies.length > 0) {
          // 保存cookies供后续使用
          wx.setStorageSync('session_cookies', r.cookies);
        }
        resolve(r.data)},
      fail: (e) => reject(e),
    })
  })
}
const updatePassword = (newPassword) => {
  return new Promise((resolve, reject) => {
    const savedCookies = wx.getStorageSync('session_cookies');
    if (!savedCookies || savedCookies.length === 0) {
      reject(new Error('未登录'));
      return;
    }
    wx.request({
      url: baseUrl + "/user/update",
      method: 'PUT',
      header: {
        'Content-Type': 'application/json',
        'Cookie': savedCookies.join('; ')
      },
      enableCookie: true,
      data: {
        newPassword: newPassword
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}
const getUserStatus = () => {
  return new Promise((resolve, reject) => {
    const savedCookies = wx.getStorageSync('session_cookies');
    const header = {
      'Content-Type': 'application/json'
    };
    if (savedCookies && savedCookies.length > 0) {
      header['Cookie'] = savedCookies.join('; ');
    }
    wx.request({
      url: baseUrl + "/user/status",
      method: 'GET',
      header: header,
      enableCookie: true,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          if (res.statusCode === 401 || res.statusCode === 403) {
            wx.removeStorageSync('session_cookies');
          }
          reject(res.data);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};
const logout = () => {
  return new Promise((resolve, reject) => {
    const savedCookies = wx.getStorageSync('session_cookies');
    const header = {
      'Content-Type': 'application/json'
    };
    if (savedCookies && savedCookies.length > 0) {
      header['Cookie'] = savedCookies.join('; ');
    }
    wx.request({
      url: baseUrl + "/user/logout",
      method: 'DELETE',
      header: header,
      enableCookie: true,
      success: (res) => {
        if (res.statusCode === 200) {
          // 清除本地存储的cookies
          wx.removeStorageSync('session_cookies');
          resolve(res.data);
        } else {
          wx.removeStorageSync('session_cookies');
          reject(res.data);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};
const registerPatient = (clinicNumber) => {
  return new Promise((resolve,reject) => {
    wx.request({
      url: 'http://127.0.0.1:8080/api/doctor/patient/register',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
      },
      data: {
        clinicNumber: clinicNumber
      },
      success:(res) => {
        resolve(res);
      },
      fail:(err) => {
        reject(err);
      }
    })
  })
}
const predict = (data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl1 + '/predict',
      method: 'POST',
      data: {
        age: Number(data.age),
        polyps: Number(data.polyps),
        long_diameter: Number(data.long_diameter),
        short_diameter: Number(data.short_diameter),
        base: Number(data.base)
      },
      header: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
      success: (res) => {
        console.log('预测API响应:', res)
        if (res.statusCode === 200) {
          // 验证返回数据格式
          if (res.data && res.data.result) {
            const result = res.data.result
            if (result.probability !== undefined && result.risk_level && result.advice) {
              resolve(res.data)
            } else {
              reject(new Error('API返回数据格式不完整'))
            }
          } else {
            reject(new Error('API返回数据格式错误'))
          }
        } else if (res.statusCode === 400) {
          reject(new Error('请求参数错误: ' + (res.data?.message || '请检查输入')))
        } else if (res.statusCode === 401) {
          reject(new Error('未授权，请重新登录'))
        } else if (res.statusCode === 500) {
          reject(new Error('服务器内部错误'))
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (error) => {
        console.error('预测请求失败:', error)
        let errorMsg = '请求失败'
        if (error.errMsg.includes('timeout')) {
          errorMsg = '请求超时，请检查网络后重试'
        } else if (error.errMsg.includes('request:fail')) {
          if (error.errMsg.includes('127.0.0.1')) {
            errorMsg = '无法连接到预测服务器\n请确保后端服务正在运行'
          } else {
            errorMsg = '网络连接失败，请检查网络设置'
          }
        }
        reject(new Error(errorMsg))
      }
    })
  })
}
const savePredictionResult = (predictionData) =>{
  return new Promise((resolve, reject) => {
    const savedCookies = wx.getStorageSync('session_cookies')
    if (!savedCookies || savedCookies.length === 0) {
      reject(new Error('请先登录'))
      return
    }
    wx.request({
      url: baseUrl + '/doctor/save',  
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Cookie': savedCookies.join('; ')
      },
      enableCookie: true,
      data: predictionData,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          resolve(null) // 保存失败也不影响主要功能
        }
      },
      fail: () => {
        resolve(null) // 网络错误也不影响主要功能
      }
    })
  })
}
module.exports = {
  login,
  updatePassword,
  getUserStatus,
  logout,
  registerPatient,
  predict,
  savePredictionResult
}