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
        maxPassedLevel: currentUser.maxPassedLevel || {},
        lastPlayedDict: currentUser.lastPlayedDict || '',
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
      maxPassedLevel: {},
      lastPlayedDict: '',
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
  const passedLevelVal = Number(passedLevel) || (levelVal > 1 ? levelVal - 1 : 1);

  const record = {
    userId: userId || openid || 'guest',
    openid: openid || '',
    dict: targetDict,
    questionBank: targetDict,
    level: levelVal,
    passedLevel: passedLevelVal,
    score: Number(score) || 0,
    timeLeft: Number(timeLeft) || 0,
    passTime: passTimeStr,
    passedAt: now,
    createdAt: now,
  };

  const result = await db.collection('ge_level_record').add({
    data: record,
  });

  // 更新用户的最高通关关卡记录
  try {
    const userQuery = await db.collection('ge_user').where({ openid: openid || '' }).limit(1).get();
    if (userQuery.data && userQuery.data.length > 0) {
      const userDoc = userQuery.data[0];
      const userDocId = userDoc._id;
      
      const currentMaxLevel = (userDoc.maxPassedLevel && userDoc.maxPassedLevel[targetDict]) || 0;
      
      if (passedLevelVal > currentMaxLevel) {
        const maxPassedLevel = userDoc.maxPassedLevel || {};
        maxPassedLevel[targetDict] = passedLevelVal;
        
        await db.collection('ge_user').doc(userDocId).update({
          data: {
            maxPassedLevel,
            lastPlayedDict: targetDict,
            updatedAt: now,
          },
        });
        
        console.log(`[关卡记录] 更新用户最高关卡: ${targetDict} 第 ${passedLevelVal} 关`);
      }
    }
  } catch (err) {
    console.warn('[关卡记录] 更新用户最高关卡失败:', err);
  }

  return {
    success: true,
    _id: result._id,
    data: record,
  };
}

// 记录错题到 ge_mistake_records 表
async function recordMistake(data = {}) {
  const {
    userId = '',
    openid = '',
    dict = 'PEP_SL_XiaoXue5_1_t',
    wordEn = '',
    wordCn = '',
    level = 1,
    mistakeTime = '',
  } = data;

  const targetDict = dict || 'PEP_SL_XiaoXue5_1_t';
  const now = db.serverDate();
  const mistakeTimeStr = mistakeTime || new Date().toISOString();

  // 查找是否已存在该单词的错题记录
  const existingQuery = await db.collection('ge_mistake_records')
    .where({
      userId: userId || openid || 'guest',
      dict: targetDict,
      wordEn: wordEn,
    })
    .limit(1)
    .get();

  if (existingQuery.data && existingQuery.data.length > 0) {
    // 已存在，更新错误次数和最后错误时间
    const existingDoc = existingQuery.data[0];
    const docId = existingDoc._id;
    
    await db.collection('ge_mistake_records').doc(docId).update({
      data: {
        mistakeCount: db.command.inc(1),
        lastMistakeTime: mistakeTimeStr,
        updatedAt: now,
      },
    });

    console.log(`[错题本] 更新错题记录: ${wordEn} (错误次数: ${existingDoc.mistakeCount + 1})`);
    
    return {
      success: true,
      action: 'updated',
      _id: docId,
      mistakeCount: (existingDoc.mistakeCount || 0) + 1,
    };
  } else {
    // 不存在，创建新记录
    const record = {
      userId: userId || openid || 'guest',
      openid: openid || '',
      dict: targetDict,
      wordEn: wordEn,
      wordCn: wordCn || '',
      level: Number(level) || 1,
      mistakeCount: 1,
      correctCount: 0,
      firstMistakeTime: mistakeTimeStr,
      lastMistakeTime: mistakeTimeStr,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection('ge_mistake_records').add({
      data: record,
    });

    console.log(`[错题本] 新增错题: ${wordEn}`);
    
    return {
      success: true,
      action: 'created',
      _id: result._id,
      mistakeCount: 1,
    };
  }
}

// 更新错题的正确回答次数
async function updateMistakeCorrect(data = {}) {
  const {
    userId = '',
    openid = '',
    dict = 'PEP_SL_XiaoXue5_1_t',
    wordEn = '',
  } = data;

  const targetDict = dict || 'PEP_SL_XiaoXue5_1_t';
  const now = db.serverDate();

  // 查找该单词的错题记录
  const existingQuery = await db.collection('ge_mistake_records')
    .where({
      userId: userId || openid || 'guest',
      dict: targetDict,
      wordEn: wordEn,
    })
    .limit(1)
    .get();

  if (existingQuery.data && existingQuery.data.length > 0) {
    const existingDoc = existingQuery.data[0];
    const docId = existingDoc._id;
    const newCorrectCount = (existingDoc.correctCount || 0) + 1;

    await db.collection('ge_mistake_records').doc(docId).update({
      data: {
        correctCount: newCorrectCount,
        lastCorrectTime: new Date().toISOString(),
        updatedAt: now,
      },
    });

    console.log(`[错题本] 更新正确次数: ${wordEn} (正确次数: ${newCorrectCount})`);
    
    return {
      success: true,
      wordEn,
      correctCount: newCorrectCount,
      mistakeCount: existingDoc.mistakeCount || 0,
    };
  }

  return {
    success: false,
    reason: 'mistake_not_found',
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
    case 'recordMistake':
      return recordMistake(payload);
    case 'updateMistakeCorrect':
      return updateMistakeCorrect(payload);
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