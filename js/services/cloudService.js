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

function getCloudEnvId() {
  if (typeof wx === 'undefined' || !wx.getStorageSync) {
    return '';
  }

  try {
    const env = wx.getStorageSync('CLOUD_ENV_ID');
    if (env && String(env).trim()) {
      return String(env).trim();
    }
  } catch (err) {
    console.warn('读取云环境ID失败', err);
  }

  return '';
}

function getCloudInstance() {
  if (typeof globalThis !== 'undefined' && globalThis.__gameCloud && typeof globalThis.__gameCloud.callFunction === 'function') {
    return globalThis.__gameCloud;
  }

  if (typeof wx !== 'undefined' && wx.cloud && typeof wx.cloud.callFunction === 'function') {
    return wx.cloud;
  }

  return null;
}

function getCloudDebugInfo() {
  const cloud = getCloudInstance();
  const meta = globalThis && globalThis.__gameCloudConfig ? globalThis.__gameCloudConfig : {};

  return {
    hasCloud: !!cloud,
    hasCallFunction: !!(cloud && cloud.callFunction),
    resourceAppid: meta.resourceAppid || '',
    resourceEnv: meta.resourceEnv || '',
    wxCloudType: typeof (wx && wx.cloud),
  };
}

function isCloudAvailable() {
  return Boolean(getCloudInstance());
}

async function loginToCloudUser() {
  const cloud = getCloudInstance();
  if (!cloud) {
    console.log('[cloud debug] 未配置有效 CloudBase 环境，使用游客模式', getCloudDebugInfo());
    return null;
  }

  console.log('[cloud debug] 发起登录调用', getCloudDebugInfo());

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
    console.log('[cloud debug] 登录成功', loginRes);
    const cloudResult = await cloud.callFunction({
      name: 'ge',
      data: {
        action: 'loginUser',
        code: loginRes.code,
        userInfo: {},
      },
    });

    console.log('[cloud debug] 登录响应', cloudResult);
    const user = (cloudResult && cloudResult.result && cloudResult.result.user) || cloudResult.result || null;
    if (user) {
      saveStoredUser(user);
      return user;
    }

    return null;
  } catch (err) {
    console.warn('云登录失败（使用游客模式）:', err && (err.errMsg || err.message) ? (err.errMsg || err.message) : err);
    return null;
  }
}

function callCloudRouter(action, payload = {}) {
  const cloud = getCloudInstance();
  if (!cloud) {
    return Promise.resolve({ success: false, skipped: true, reason: 'cloud env not configured' });
  }

  const user = getStoredUser();

  return cloud.callFunction({
    name: 'ge',
    data: {
      action,
      username: user ? user.username : 'guest',
      openid: user ? user.openid : '',
      userId: user ? user._id : '',
      ...payload,
    },
  }).catch((err) => {
    console.warn(`云函数路由失败: ${action}`, err && (err.errMsg || err.message) ? (err.errMsg || err.message) : err);
    return { success: false, err };
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
      if (user && user.nickName) {
        return user.nickName;
      }
      if (user && user.username) {
        return user.username;
      }
    } catch (err) {
      console.warn('读取登录用户失败', err);
    }
  }
  return '微信用户';
}

module.exports = {
  getStoredUser,
  saveStoredUser,
  loginToCloudUser,
  callCloudRouter,
  saveLevelProgressToCloud,
  getCurrentUserName,
};