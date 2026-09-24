const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

async function loginUser(data = {}) {
  const { code, userInfo = {} } = data;
  const wxContext = cloud.getWXContext();

  // 环境共享场景关键区别：
  // OPENID - 资源方（小程序A）环境下的 OpenID
  // FROM_OPENID - 调用方（小游戏B）的用户 OpenID ← 我们要这个！
  const openid = wxContext.FROM_OPENID || wxContext.OPENID;
  const appid = wxContext.FROM_APPID || wxContext.APPID;
  const unionid = wxContext.UNIONID || '';

  console.log('wxContext:', JSON.stringify(wxContext));
  console.log('使用 openid:', openid);
  console.log('openid 来源:', wxContext.FROM_OPENID ? 'FROM_OPENID(调用方)' : 'OPENID(资源方)');

  // 如果仍然没有 openid，使用 code 生成临时标识（仅开发测试）
  if (!openid && code) {
    openid = `dev_${code.slice(-10)}`;
    console.log('⚠️ 使用临时 openid（开发环境）:', openid);
  }

  if (!openid) {
    return {
      success: false,
      errCode: 'NO_OPENID',
      errMsg: '无法获取用户标识，请检查云环境共享配置',
    };
  }

  const now = db.serverDate();
  const defaultNick = '微信用户';
  const profile = {
    openid,
    appid,
    unionid: unionid || '',
    username: userInfo.nickName || defaultNick,
    nickName: userInfo.nickName || defaultNick,
    avatarUrl: userInfo.avatarUrl || '',
    gender: userInfo.gender || 0,
    city: userInfo.city || '',
    province: userInfo.province || '',
    country: userInfo.country || '',
    language: userInfo.language || '',
    lastLoginAt: now,
    updatedAt: now,
    createdAt: now,
    code: code || '',
  };

  const existing = await db.collection('ge_user').where({ openid }).limit(1).get();

  if (existing.data && existing.data.length > 0) {
    const currentUser = existing.data[0];
    await db.collection('ge_user').doc(currentUser._id).update({
      data: {
        ...profile,
        createdAt: currentUser.createdAt || now,
      },
    });

    return {
      success: true,
      user: {
        ...currentUser,
        ...profile,
        _id: currentUser._id,
      },
    };
  }

  const addResult = await db.collection('ge_user').add({
    data: profile,
  });

  return {
    success: true,
    user: {
      ...profile,
      _id: addResult._id,
    },
  };
}

async function recordWordScore(data = {}) {
  const {
    username = 'guest',
    category = '小学',
    level = 1,
    score = 0,
    openid = '',
    userId = '',
  } = data;

  if (typeof score !== 'number') {
    return {
      success: false,
      errCode: 'INVALID_SCORE',
      errMsg: 'score 必须是数字',
    };
  }

  const result = await db.collection('wordScores').add({
    data: {
      username,
      openid,
      userId,
      category,
      level,
      score,
      createdAt: db.serverDate(),
    },
  });

  return {
    success: true,
    _id: result._id,
    data: {
      username,
      openid,
      userId,
      category,
      level,
      score,
    },
  };
}

async function getLeaderboard() {
  const result = await db
    .collection('wordScores')
    .orderBy('score', 'desc')
    .limit(10)
    .get();

  return {
    success: true,
    list: result.data,
  };
}

// 记录关卡通过信息到 ge_level_record 表
async function recordLevelRecord(data = {}) {
  const {
    userId = '',
    openid = '',
    dict = 'PEP_SL_XiaoXue5_1_t',
    questionBank = '',
    level = 1,
    passedLevel = 1,
    score = 0,
    timeLeft = 0,
    passTime = '',
  } = data;

  const targetDict = dict || questionBank || 'PEP_SL_XiaoXue5_1_t';
  const now = db.serverDate();
  const passTimeStr = passTime || new Date().toISOString();
  const levelVal = Number(level) || 1;

  const record = {
    userId: userId || openid || 'guest',
    openid: openid || '',
    dict: targetDict,
    questionBank: targetDict,
    level: levelVal, // 关卡：比如存 2 或 3
    passedLevel: Number(passedLevel) || (levelVal > 1 ? levelVal - 1 : 1),
    score: Number(score) || 0,
    timeLeft: Number(timeLeft) || 0,
    passTime: passTimeStr,
    passedAt: now,
    createdAt: now,
  };

  const result = await db.collection('ge_level_record').add({
    data: record,
  });

  return {
    success: true,
    _id: result._id,
    data: record,
  };
}

exports.main = async (event = {}, context) => {
  const action = event.action || event.type || 'unknown';
  const payload = event.data || event;

  switch (action) {
    case 'loginUser':
      return loginUser(payload);
    case 'recordWordScore':
      return recordWordScore(payload);
    case 'recordLevelRecord':
    case 'recordLevelPass':
      return recordLevelRecord(payload);
    case 'getLeaderboard':
      return getLeaderboard(payload);
    default:
      return {
        success: false,
        errCode: 'UNKNOWN_ACTION',
        errMsg: `不支持的 action: ${action}`,
      };
  }
};