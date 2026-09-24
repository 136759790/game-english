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

function ensureCloudReady() {
  if (typeof wx === 'undefined' || !wx.cloud || typeof wx.cloud.init !== 'function') {
    return false;
  }

  try {
    const env = getCloudEnvId();
    const cloudFlag = '__geCloudInited';
    if (!wx[cloudFlag]) {
      wx.cloud.init({ env });
      wx[cloudFlag] = true;
    }
    return true;
  } catch (err) {
    console.warn('云环境初始化失败:', err && err.message ? err.message : err);
    return false;
  }
}

function getCloudInstance() {
  if (typeof globalThis !== 'undefined' && globalThis.__gameCloud && typeof globalThis.__gameCloud.callFunction === 'function') {
    return globalThis.__gameCloud;
  }

  if (typeof wx !== 'undefined' && wx.cloud && typeof wx.cloud.callFunction === 'function') {
    if (ensureCloudReady()) {
      return wx.cloud;
    }
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
  if (!ensureCloudReady()) {
    console.log('[cloud debug] 未配置有效 CloudBase 环境，使用游客模式', getCloudDebugInfo());
    return null;
  }

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
  if (!ensureCloudReady()) {
    return Promise.resolve({ success: false, skipped: true, reason: 'cloud env not configured' });
  }

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

// 记录通关数据至 ge_level_record 表
async function saveLevelRecordToCloud(dictName, currentLevelNumber, score = 0, timeLeft = 0) {
  let user = getStoredUser();
  if (!user) {
    user = await loginToCloudUser();
  }

  const userId = user ? (user._id || user.openid || '') : 'guest';
  const openid = user ? (user.openid || '') : '';
  const cleanDictName = (dictName || 'PEP_SL_XiaoXue5_1_t').replace('.json', '');
  const nextLevel = currentLevelNumber + 1; // 比如通过第一关后，关卡存 2，通过第二关存 3
  const passTimeStr = new Date().toISOString();

  console.log('[ge_level_record] 准备上报关卡通过记录:', {
    userId,
    dict: cleanDictName,
    passedLevel: currentLevelNumber,
    level: nextLevel,
    passTime: passTimeStr,
    score,
    timeLeft,
  });

  // 本地持久化缓存最后通关关卡
  try {
    if (typeof wx !== 'undefined' && wx.setStorageSync) {
      wx.setStorageSync(`ge_level_record_${cleanDictName}`, {
        userId,
        dict: cleanDictName,
        passedLevel: currentLevelNumber,
        level: nextLevel,
        passTime: passTimeStr,
        score,
        timeLeft,
      });
    }
  } catch (err) {
    console.warn('[ge_level_record] 写入本地进度失败:', err);
  }

  const payload = {
    userId,
    openid,
    dict: cleanDictName,
    questionBank: cleanDictName,
    level: nextLevel,
    passedLevel: currentLevelNumber,
    score,
    timeLeft,
    passTime: passTimeStr,
  };

  const cloudRes = await callCloudRouter('recordLevelRecord', payload);
  if (cloudRes && cloudRes.success) {
    console.log('[ge_level_record] 云函数写入成功:', cloudRes);
    return cloudRes;
  }

  // 兜底：如果云函数不可用且有直连能力，尝试直接写入数据库
  try {
    const cloud = getCloudInstance();
    if (cloud && typeof cloud.database === 'function') {
      const db = cloud.database();
      const directRes = await db.collection('ge_level_record').add({
        data: {
          ...payload,
          passedAt: db.serverDate ? db.serverDate() : new Date(),
          createdAt: db.serverDate ? db.serverDate() : new Date(),
        },
      });
      console.log('[ge_level_record] 客户端直接写入数据库成功:', directRes);
      return { success: true, directRes };
    }
  } catch (directErr) {
    console.warn('[ge_level_record] 客户端直连写入异常:', directErr && directErr.message ? directErr.message : directErr);
  }

  return cloudRes;
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
  saveLevelRecordToCloud,
  getCurrentUserName,
};