const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

async function loginUser(data = {}) {
  const { code, userInfo = {} } = data;
  const wxContext = cloud.getWXContext();
  const { openid, appid, unionid } = wxContext || {};

  if (!openid) {
    return {
      success: false,
      errCode: 'NO_OPENID',
      errMsg: '无法获取微信用户 openid',
    };
  }

  const now = db.serverDate();
  const profile = {
    openid,
    appid,
    unionid: unionid || '',
    username: userInfo.nickName || `wx_${openid.slice(-6)}`,
    nickName: userInfo.nickName || '',
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

exports.main = async (event = {}, context) => {
  const action = event.action || event.type || 'unknown';
  const payload = event.data || event;

  switch (action) {
    case 'loginUser':
      return loginUser(payload);
    case 'recordWordScore':
      return recordWordScore(payload);
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