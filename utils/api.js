// 配置本地环境地址
const config = {
  baseUrl: "http://127.0.0.1:8080/api", // SpringBoot 后端
};//////

// 统一请求封装
const request = (url, method, data, header = {}) => {
  return new Promise((resolve, reject) => {
    // 默认请求头
    if (!header["Content-Type"]) {
      header["Content-Type"] = "application/json";
    }

    wx.request({
      url: url,
      method: method,
      data: data,
      header: header,
      timeout: 15000,
      enableCookie: true, // 启用cookie引擎，配合App.js拦截器自动管理
      success: (res) => {
        // 统一处理未登录状态 (401/403)
        if (res.statusCode === 401 || res.statusCode === 403) {
          wx.removeStorageSync("session_cookies");
          wx.showToast({ title: "登录已过期", icon: "none" });
          setTimeout(() => {
            wx.reLaunch({ url: "/pages/login/login" });
          }, 1500);
          reject(new Error("Auth failed"));
          return;
        }
        resolve(res);
      },
      fail: (err) => {
        let errorMsg = "网络请求失败";
        if (err.errMsg.indexOf("timeout") > -1) {
          errorMsg = "请求超时，请检查网络";
        } else if (err.errMsg.indexOf("request:fail") > -1) {
          errorMsg = "服务连接失败，请检查服务开启状态";
        }
        reject(new Error(errorMsg));
      },
    });
  });
};

/* --- 业务 API --- */

// 1. 登录
const login = ({ username, password }) => {
  return request(config.baseUrl + "/user/login", "POST", {
    username: username.trim(),
    password: password,
  }).then((res) => {
    // 登录成功手动持久化 Cookie (如 app.js 拦截器未完全接管，此处为保险)
    if (res.statusCode === 200 && (res.data.code === 0 || res.data.success)) {
      if (res.cookies && res.cookies.length > 0) {
        wx.setStorageSync("session_cookies", res.cookies);
      }
    }
    return res.data;
  });
};

// 2. 修改密码
const updatePassword = (oldPassword, newPassword) => {
  return request(config.baseUrl + "/user/update", "PUT", {
    oldPassword,
    newPassword,
  }).then((res) => {
    if (res.statusCode === 200) return res.data;
    throw res.data;
  });
};

// 3. 获取用户状态
const getUserStatus = () => {
  return request(config.baseUrl + "/user/status", "GET").then((res) => {
    if (res.statusCode === 200) return res.data;
    throw res.data;
  });
};

// 4. 登出
const logout = () => {
  return request(config.baseUrl + "/user/logout", "DELETE").then((res) => {
    wx.removeStorageSync("session_cookies");
    if (res.statusCode === 200) return res.data;
    throw res.data;
  });
};

// 5. 注册患者
const registerPatient = (clinicNumber) => {
  // 修正硬编码 URL 为 config.baseUrl
  return request(config.baseUrl + "/doctor/patient/register", "POST", {
    clinicNumber,
  }).then((res) => {
    // 保持原有逻辑，page 可能会用到 res.data
    return res.data;
  });
};

// 6. 保存预测结果
const savePredictionResult = (predictionData) => {
  return request(config.baseUrl + "/doctor/save", "POST", predictionData)
    .then((res) => {
      if (res.statusCode === 200) return res.data;
      return null;
    })
    .catch(() => null); // 忽略保存失败
};

// 7. 预测
const predict = (data) => {
  return new Promise((resolve, reject) => {
    request(config.baseUrl + "/doctor/input", "POST", {
      age: String(data.age),
      polyps: String(data.polyps),
      long_diameter: String(data.long_diameter),
      short_diameter: String(data.short_diameter),
      base: String(data.base),
    })
      .then((res) => {
        console.log("预测API响应:", res);
        if (res.statusCode === 200) {
          const result = res.data?.result;
          // 严格校验返回格式
          if (
            result &&
            result.probability !== undefined &&
            result.risk_level &&
            result.advice
          ) {
            resolve(res.data);
          } else {
            reject(new Error("API返回数据格式不完整"));
          }
        } else if (res.statusCode === 400) {
          reject(new Error("参数错误: " + (res.data?.message || "请检查输入")));
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`));
        }
      })
      .catch(reject);
  });
};

module.exports = {
  login,
  updatePassword,
  getUserStatus,
  logout,
  registerPatient,
  predict,
  savePredictionResult,
};
