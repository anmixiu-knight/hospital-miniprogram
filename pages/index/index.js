// pages/index/index.js
const api = require("../../utils/api.js"); // 引入api
Page({
  data: {
    // 用户信息
    doctorName: "", // 默认值，可以从登录信息获取

    // 患者管理
    hasPatient: false,
    currentPatientId: "",

    // 表单数据
    age: "",
    polypsNumber: "",
    longDiameter: "",
    shortDiameter: "",
    baseType: "",
    baseTypes: ["有蒂型", "广基型"],

    // 预测结果
    hasResult: false,
    originProbility: "",
    result: {
      probability: "0%",
      riskLevel: "低风险",
      advice: "",
    },
    statusClass: "low-risk",
    isSaving: false,

    // 修改密码弹窗
    modalHidden: true,
    oldPasswordInput: "",
    newPasswordInput: "",
    confirmPasswordInput: "",
    showOldPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  },

  onLoad(options) {
    // 页面加载时检查登录状态
    this.checkLoginStatus();
  },
  onShow() {
    // 页面显示时刷新用户状态
    this.checkLoginStatus();
  },
  checkLoginStatus() {
    api
      .getUserStatus()
      .then((res) => {
        console.log("用户状态:", res);
        this.setData({
          doctorName: res.data.username,
        });
      })
      .catch((err) => {
        console.error("获取用户状态失败:", err);
      });
  },
  // 创建患者
  onPatientIdInput(e) {
    // 获取输入的值
    const value = e.detail.value;
    // 更新数据
    this.setData({
      currentPatientId: value,
    });
  },
  async createPatient() {
    const { currentPatientId } = this.data;
    if (!currentPatientId) {
      wx.showToast({
        title: "请输入诊所编号",
        icon: "none",
      });
      return;
    }
    try {
      const result = await api.registerPatient(currentPatientId);
      if (result.code === 0 || result.code === undefined) {
        wx.showToast({
          title: "患者注册成功",
          icon: "success",
          duration: 1500,
        });
        console.log("注册成功，患者信息:", result.data);
        this.setData({
          hasPatient: true,
        });
      } else {
        // 业务逻辑错误
        wx.showToast({
          title: result.message || "注册失败",
          icon: "none",
          duration: 2000,
        });
      }
    } catch (error) {
      // 错误处理
      console.error("患者注册失败:", error);
      if (error.message && error.message.includes("网络")) {
        wx.showToast({
          title: "网络错误，请检查连接",
          icon: "none",
          duration: 2000,
        });
      } else if (error.message && error.message.includes("登录")) {
        wx.showToast({
          title: "请先登录",
          icon: "none",
          duration: 2000,
        });
        // 跳转到登录页
        setTimeout(() => {
          wx.navigateTo({
            url: "/pages/login/login",
          });
        }, 1500);
      } else {
        wx.showToast({
          title: error.message || "注册失败，请重试",
          icon: "none",
          duration: 2000,
        });
      }
    }
  },

  // 结束会诊
  closePatient() {
    wx.showModal({
      title: "确认结束",
      content: "确定要结束当前患者的会诊吗？",
      success: (res) => {
        if (res.confirm) {
          this.setData({
            hasPatient: false,
            currentPatientId: "",
            hasResult: false,
            result: {
              probability: "0%",
              riskLevel: "低风险",
              advice: "",
            },
            // 清空表单数据
            age: "",
            polypsNumber: "",
            longDiameter: "",
            shortDiameter: "",
            baseType: "",
          });

          wx.showToast({
            title: "已结束会诊",
            icon: "success",
          });
        }
      },
    });
  },

  // 输入框数据绑定
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    let value = e.detail.value;

    // 根据字段类型进行转换
    switch (field) {
      case "age":
      case "polypsNumber":
        // 年龄和息肉数量：转换为整数
        value = parseInt(value) || 0;
        break;
      case "longDiameter":
      case "shortDiameter":
        // 直径：转换为浮点数，保留1位小数
        value = parseFloat(value) || 0;
        // 保留1位小数
        value = Math.round(value * 10) / 10;
        break;
      default:
        // 其他字段保持原样
        break;
    }
    this.setData({
      [field]: value,
    });
  },

  // 基底类型选择
  handleBaseTypeChange(e) {
    const index = e.detail.value;
    this.setData({
      baseType: this.data.baseTypes[index],
    });
  },

  // 开始预测
  async calculateResult() {
    const { age, polypsNumber, longDiameter, shortDiameter, baseType } =
      this.data;

    // 验证必填字段
    if (!age || !polypsNumber || !longDiameter || !shortDiameter || !baseType) {
      wx.showToast({
        title: "请填写所有必填项",
        icon: "none",
      });
      return;
    }
    // 验证数据有效性
    if (parseInt(age) < 0 || parseInt(age) > 120) {
      wx.showToast({
        title: "请输入有效的年龄(0-120)",
        icon: "none",
      });
      return;
    }
    if (parseInt(polypsNumber) < 1) {
      wx.showToast({
        title: "息肉数量必须大于0",
        icon: "none",
      });
      return;
    }
    if (parseFloat(longDiameter) <= 0 || parseFloat(shortDiameter) <= 0) {
      wx.showToast({
        title: "息肉尺寸必须大于0",
        icon: "none",
      });
      return;
    }
    if (parseFloat(longDiameter) < parseFloat(shortDiameter)) {
      console.log(
        "长径:",
        this.data.longDiameter,
        "短径:",
        this.data.shortDiameter,
      );
      wx.showToast({
        title: "息肉长径长度不能小于短径长度",
        icon: "none",
      });
      return;
    }
    const baseTypeMap = {
      有蒂型: 1,
      广基型: 2,
    };
    const baseNum = baseTypeMap[baseType];
    // 显示加载
    wx.showLoading({
      title: "预测中...",
      mask: true,
    });

    try {
      const result = await api.predict({
        age: parseInt(age),
        polyps: parseInt(polypsNumber),
        long_diameter: parseFloat(longDiameter),
        short_diameter: parseFloat(shortDiameter),
        base: baseNum,
      });
      wx.hideLoading();
      console.log("预测结果:", result);
      // 处理结果
      this.handlePredictionResult(result);
    } catch (error) {
      wx.hideLoading();
      console.error("预测失败:", error);
    }
  },

  // 处理预测结果
  handlePredictionResult(apiResult) {
    console.log("API返回结果:", apiResult);
    const riskLevelMap = {
      "Low Risk": "低风险",
      "Moderate Risk": "中风险",
      "High Risk": "高风险",
      "Very High Risk": "极高风险",
    };
    const adviceMap = {
      "Follow-up is not required":"无需随访",
      
        "Follow-up ultrasound is recommended at 6 months, 1 year, and 2 years; Follow-up should be discontinued after 2 years in the absence of growth.":
        "建议于6个月、1年及2年进行超声随,若2年内病灶无增大,应停止随访。",
      
        "Cholecystectomy is recommended if the patient is fit for, and accepts, surgery; MDT discussion may be considered":
        "若患者具备手术指征且可耐受手术,建议行胆囊切除术,可考虑进行多学科团队MDT讨论。",
      
        "Cholecystectomy is strongly recommended if the patient is fit for, and accepts, surgery":
        "若患者具备手术指征且可耐受手术，强烈建议行胆囊切除术。",
  };

    // 根据API返回结构解析数据
    let originProbility = "";
    let probability = "";
    let riskLevel = "";
    let advice = "";
    let statusClass = "";

    if (apiResult) {
      originProbility = apiResult.probability;
      probability = (apiResult.probability * 100).toFixed(1) + "%";
      riskLevel =
        riskLevelMap[apiResult.risk_level] || "未知";
      advice = adviceMap[apiResult.advice] || "请咨询专业医生";
      // 根据风险等级设置样式类
      if (riskLevel.includes("高")) {
        statusClass = "high-risk";
      } else if (riskLevel.includes("中")) {
        statusClass = "medium-risk";
      } else {
        statusClass = "low-risk";
      }
    }

    this.setData({
      hasResult: true,
      originProbility: originProbility,
      result: {
        probability,
        riskLevel,
        advice,
      },
      statusClass,
    });
  },
  // 重置表单
  resetForm() {
    this.setData({
      age: "",
      polypsNumber: "",
      longDiameter: "",
      shortDiameter: "",
      baseType: "",
      hasResult: false,
      result: {
        probability: "0%",
        riskLevel: "低风险",
        advice: "",
      },
    });

    wx.showToast({
      title: "表单已重置",
      icon: "success",
    });
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: "确认退出",
      content: "确定要退出登录吗？",
      success: (res) => {
        console.log("tuichu", res);
        if (res.confirm) {
          api
            .logout()
            .then(() => {
              this.setData({
                doctorName: "",
              });
              wx.showToast({
                title: "已退出登录",
                icon: "success",
              });
            })
            .catch((err) => {
              console.error("登出失败:", err);
            });
          // 跳转到登录页
          wx.reLaunch({
            url: "/pages/login/login",
          });
        }
      },
    });
  },

  // 修改密码
  handleChangePassword() {
    this.setData({
      modalHidden: false,
      oldPasswordInput: "",
      newPasswordInput: "",
      confirmPasswordInput: "",
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
    });
  },

  // 确认修改密码
  async confirmChangePwd() {
    const { oldPasswordInput, newPasswordInput, confirmPasswordInput } =
      this.data;

    if (!oldPasswordInput || !newPasswordInput || !confirmPasswordInput) {
      wx.showToast({
        title: "请填写完整",
        icon: "none",
      });
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      wx.showToast({
        title: "两次输入的新密码不一致",
        icon: "none",
      });
      return;
    }

    wx.showLoading({
      title: "修改中...",
    });

    try {
      const result = await api.updatePassword(
        oldPasswordInput,
        newPasswordInput,
      );
      if (result && result.success === true) {
        console.log("密码修改成功:", result);
        this.resetPasswordForm();
        this.setData({
          modalHidden: true,
        });
        wx.showToast({
          title: "密码修改成功",
          icon: "success",
          duration: 2000,
        });
        setTimeout(() => {
          this.showReLoginPrompt();
        }, 1500);
      } else {
        // 业务逻辑失败（如旧密码错误）
        console.log("密码修改业务失败:", result);
        
        // 提取错误信息
        let errorMessage = result?.message || "密码修改失败";
        
        // 处理旧密码错误
        if (errorMessage.includes("旧密码") || errorMessage.includes("原密码")) {
          wx.showModal({
            title: "提示",
            content: "旧密码错误，请重新输入",
            showCancel: false,
            success: () => {
              // 可以聚焦到旧密码输入框
              this.setData({
                oldPasswordInput: "" // 清空旧密码输入
              });
            }
          });
        } else {
          wx.showToast({
            title: errorMessage,
            icon: "none",
            duration: 3000,
          });
        }
        
        // 处理需要重新登录的情况
        if (result?.code === 401 || result?.code === 403) {
          setTimeout(() => {
            this.performLogout();
          }, 3000);
        }
      }
    } catch (error) {
      console.error("密码修改网络错误或异常:", error);
      
      let errorMessage = "网络连接失败";
      
      // 处理网络错误
      if (error && typeof error === "object") {
        // 微信小程序网络错误
        if (error.errMsg) {
          if (error.errMsg.includes("timeout")) {
            errorMessage = "网络超时，请稍后重试";
          } else if (error.errMsg.includes("fail")) {
            errorMessage = "网络连接失败，请检查网络设置";
          } else {
            errorMessage = `网络错误: ${error.errMsg}`;
          }
        }
        // 其他异常（如代码错误）
        else if (error.message) {
          errorMessage = `系统错误: ${error.message}`;
        }
      }
      
      // 显示网络错误提示
      wx.showToast({
        title: errorMessage,
        icon: "none",
        duration: 3000,
      });
      
      // 注意：网络错误一般不需要重新登录
      // 也不需要清空旧密码输入框
    } finally {
      wx.hideLoading();
    }
  },
  resetPasswordForm() {
    this.setData({
      oldPasswordInput: "",
      newPasswordInput: "",
      confirmPasswordInput: "",
    });
  },
  showReLoginPrompt() {
    wx.showModal({
      title: "安全提示",
      content: "为了账户安全，建议重新登录",
      confirmText: "重新登录",
      cancelText: "稍后处理",
      success: (res) => {
        if (res.confirm) {
          this.performLogout();
        }
      },
    });
  },
  performLogout() {
    // 调用登出API
    api
      .logout()
      .catch(() => {
        // 静默处理错误
      })
      .finally(() => {
        // 清除本地存储
        wx.removeStorageSync("session_cookies");
        // 跳转到登录页
        wx.reLaunch({
          url: "/pages/login/login",
        });
      });
  },
  // 取消修改密码
  cancelChangePwd() {
    this.setData({
      modalHidden: true,
    });
  },

  // 切换旧密码显示/隐藏
  toggleOldPasswordVisibility() {
    this.setData({
      showOldPassword: !this.data.showOldPassword,
    });
  },

  // 切换新密码显示/隐藏
  toggleNewPasswordVisibility() {
    this.setData({
      showNewPassword: !this.data.showNewPassword,
    });
  },

  // 切换确认密码显示/隐藏
  toggleConfirmPasswordVisibility() {
    this.setData({
      showConfirmPassword: !this.data.showConfirmPassword,
    });
  },

  async savePredictionResult() {
    this.setData({
      isSaving: true,
    });
    try {
      console.log("开始保存预测结果...");
      const saveData = this.prepareSaveData();
      console.log("保存数据:", saveData);
      const response = await api.savePredictionResult(saveData);
      console.log("保存响应:", response);
      if (response.success || response.code === 0) {                   
        wx.showToast({                       
          title: "保存成功",                     
          icon: "success",
          duration: 1500,
        });
        setTimeout(() => {
          this.askResetForm();
        }, 1000);
      } else {
        wx.showModal({
          title: "保存失败",
          content: response.message,
          confirmText: "重试",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              // 重新尝试保存
              setTimeout(() => {
                this.savePredictionResult();
              }, 500);
            }
          },
        });
      }
    } catch (error) {
      console.error("保存失败:", error);
      wx.showToast({
        title: error.message || "保存失败，请检查网络",
        icon: "none",
        duration: 3000,
      });
    } finally {
      setTimeout(() => {
        this.setData({
          isSaving: false,
        });
      }, 1000);
    }
  },
  prepareSaveData() {
    const {
      originProbility,
      result,
      age,
      polypsNumber,
      longDiameter,
      shortDiameter,
      baseType,
      currentPatientId,
    } = this.data;
    const riskLevelMap = {
      低风险: "Low Risk",
      中风险: "Moderate Risk",
      高风险: "High Risk",
      极高风险: "Very High Risk",
    };
    const riskLevel = riskLevelMap[result.riskLevel] || result.riskLevel;
    const baseTypeMap = {
      有蒂型: 1,
      广基型: 2,
    };
    const baseNum = baseTypeMap[baseType];
    const adviceBackMap = {
      "无需随访": "Follow-up is not required",

      "建议于6个月、1年及2年进行超声随,若2年内病灶无增大,应停止随访。":
        "Follow-up ultrasound is recommended at 6 months, 1 year, and 2 years; Follow-up should be discontinued after 2 years in the absence of growth.",

      "若患者具备手术指征且可耐受手术,建议行胆囊切除术,可考虑进行多学科团队MDT讨论。":
        "Cholecystectomy is recommended if the patient is fit for, and accepts, surgery; MDT discussion may be considered",

      "若患者具备手术指征且可耐受手术，强烈建议行胆囊切除术。":
        "Cholecystectomy is strongly recommended if the patient is fit for, and accepts, surgery",
    };
    const adviceBack = adviceBackMap[result.advice] || result.advice;
    return {
      clinicNumber: currentPatientId,
      age: parseInt(age),
      polypsNumber: parseInt(polypsNumber),
      longDiameter: parseFloat(longDiameter),
      shortDiameter: parseFloat(shortDiameter),
      baseType: baseNum,
      probability: originProbility,
      riskLevel: riskLevel,
      advice: adviceBack,
    };
  },
  askResetForm() {
    wx.showModal({
      title: "提示",
      content: "是否进行下一位患者的就诊？",
      confirmText: "是",
      cancelText: "否",
      success: (res) => {
        this.setData({
          hasPatient: false,
          currentPatientId: "",
          hasResult: false,
          result: {
            probability: "0%",
            riskLevel: "低风险",
            advice: "",
          },
          // 清空表单数据
          age: "",
          polypsNumber: "",
          longDiameter: "",
          shortDiameter: "",
          baseType: "",
        });
      },
    });
  },
});
