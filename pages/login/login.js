const api = require("../../utils/api.js");
Page({
  data: {
    username: "",
    password: "",
    showPassword: false,
    showChangePasswordModal: false,
    newPassword: "",
    showNewPassword: false, // 新增：控制新密码显示隐藏
    oldPasswordInput: "", // 新增：旧密码输入
    showOldPasswordInput: false, // 新增：控制旧密码显示隐藏
  },

  onUsernameInput(e) {
    this.setData({
      username: e.detail.value,
    });
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value,
    });
  },

  // 切换密码显示/隐藏
  togglePasswordVisibility() {
    this.setData({
      showPassword: !this.data.showPassword,
    });
  },
  //切换新密码显示/隐藏
  toggleNewPasswordVisibility() {
    this.setData({
      showNewPassword: !this.data.showNewPassword,
    });
  },
  // 切换旧密码显示/隐藏
  toggleOldPasswordVisibility() {
    this.setData({
      showOldPasswordInput: !this.data.showOldPasswordInput,
    });
  },
  //
  // 登录函数
  async handleLogin() {
    const { username, password } = this.data;

    if (!username || !password) {
      wx.showToast({
        title: "请输入账号和密码",
        icon: "none",
      });
      return;
    }

    // 显示加载中
    wx.showLoading({
      title: "登录中...",
      mask: true,
    });
    try {
      // 调用 api.login 函数
      const result = await api.login({
        username: username,
        password: password,
      });
      // 隐藏加载
      wx.hideLoading();
      if (result.code === 0 || result.success) {
        console.log("登录成功:", result);

        if (result.data.reset === 1) {
          this.setData({
            showChangePasswordModal: true,
            newPassword: "", // 清空以免回显旧密码
            oldPasswordInput: "", // 清空旧密码输入
          });
          return;
        }

        wx.showToast({
          title: "登录成功",
          icon: "success",
          duration: 1000,
        });
        // 延迟跳转
        if (result.data.level == 1 || result.data.level == 2) {
          setTimeout(() =>{
            wx.reLaunch({
              url: "/pages/index/index",
            });
          }, 1000);
        }
      } else {
        // 业务逻辑失败（如密码错误）
        wx.showToast({
          title: result.message || "登录失败",
          icon: "none",
          duration: 2000,
        });
      }
    } catch (error) {
      // 隐藏加载
      wx.hideLoading();
      console.error("登录失败:", error);
      // 处理错误
      let errorMsg = "登录失败，请重试";
      if (error.errMsg && error.errMsg.includes("request:fail")) {
        // 网络错误
        errorMsg = "网络连接失败，请检查网络";
      } else if (error.message) {
        errorMsg = error.message;
      }
      wx.showToast({
        title: errorMsg,
        icon: "none",
        duration: 2000,
      });
    }
  },

  onNewPasswordInput(e) {
    this.setData({
      newPassword: e.detail.value,
    });
  },

  onOldPasswordInput(e) {
    this.setData({
      oldPasswordInput: e.detail.value,
    });
  },

  async handleChangePasswordConfirm() {
    const { newPassword, oldPasswordInput } = this.data;
    if (!oldPasswordInput) {
      wx.showToast({
        title: "请输入旧密码",
        icon: "none",
      });
      return;
    }
    if (!newPassword || newPassword.length < 3 || newPassword.length > 12) {
      wx.showToast({
        title: "新密码长度需3-12位",
        icon: "none",
      });
      return;
    }
    if (newPassword === oldPasswordInput) {
      wx.showToast({
        title: "新密码不能与旧密码相同",
        icon: "none",
      });
      return;
    }

    try {
      const res = await api.updatePassword(oldPasswordInput, newPassword);
      if (res.code === 0 || res.success) {
        wx.showToast({
          title: "修改成功",
          icon: "success",
        });
        this.setData({
          showChangePasswordModal: false,
        });
        setTimeout(() => {
          wx.reLaunch({
            url: "/pages/index/index",
          });
        }, 1000);
      } else {
        wx.showToast({
          title: res.message || "修改失败",
          icon: "none",
        });
      }
    } catch (err) {
      console.error(err);
      wx.showToast({
        title: (err && err.message) || "修改失败，请重试",
        icon: "none",
      });
    }
  },
});
