function getStoredUser() {
  if (typeof wx === 'undefined' || !wx.getStorageSync) {
    return null;
  }

  try {
    const savedUser = wx.getStorageSync('ge_user_profile');
    return savedUser && savedUser._id ? savedUser : null;
  } catch (err) {
    console.warn('读取缓存用户失败', err);
    return null;
  }
}

function saveStoredUser(user) {
  if (!user || typeof wx === 'undefined' || !wx.setStorageSync) {
    return;
  }

  try {
    wx.setStorageSync('ge_user_profile', user);
  } catch (err) {
    console.warn('缓存用户失败', err);
  }
}

async function loginToCloudUser() {
  if (typeof wx === 'undefined' || !wx.cloud || typeof wx.cloud.callFunction !== 'function') {
    return null;
  }

  const storedUser = getStoredUser();
  if (storedUser) {
    return storedUser;
  }

  try {
    // 静默登录：只获取 code，不获取用户信息（避免隐私协议问题）
    const loginRes = await new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject,
      });
    });

    const cloudResult = await wx.cloud.callFunction({
      name: 'ge',
      data: {
        action: 'loginUser',
        code: loginRes.code,
        userInfo: {},
      },
    });

    const user = (cloudResult && cloudResult.result && cloudResult.result.user) || cloudResult.result || null;
    if (user) {
      saveStoredUser(user);
      return user;
    }

    return null;
  } catch (err) {
    console.warn('静默登录失败', err);
    return null;
  }
}

function callCloudRouter(action, payload = {}) {
  if (typeof wx === 'undefined' || !wx.cloud || typeof wx.cloud.callFunction !== 'function') {
    return Promise.resolve({ success: false, skipped: true });
  }

  const user = getStoredUser();

  return wx.cloud.callFunction({
    name: 'ge',
    data: {
      action,
      username: user ? user.username : 'guest',
      openid: user ? user.openid : '',
      userId: user ? user._id : '',
      ...payload,
    },
    fail: (err) => {
      console.warn(`云函数路由失败: ${action}`, err);
      return { success: false, err: err };
    },
  });
}

async function saveLevelProgressToCloud(levelIndex, level) {
  const user = await loginToCloudUser();
  if (!user) {
    return null;
  }

  return callCloudRouter('recordWordScore', {
    username: user.username,
    openid: user.openid,
    userId: user._id,
    category: level.category,
    level: level.number,
    score: (levelIndex + 1) * 10,
  });
}

function getCurrentUserName() {
  if (typeof wx !== 'undefined' && wx.getStorageSync) {
    try {
      const user = wx.getStorageSync('ge_user_profile');
      if (user && user.username) {
        return user.username;
      }
    } catch (err) {
      console.warn('读取登录用户失败', err);
    }
  }
  return '游客';
}

module.exports = {
  getStoredUser,
  saveStoredUser,
  loginToCloudUser,
  callCloudRouter,
  saveLevelProgressToCloud,
  getCurrentUserName,
};