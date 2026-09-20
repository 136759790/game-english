const CATEGORY_META = [
  { key: 'primary', name: '小学', totalLevels: 20 },
  { key: 'junior', name: '初中', totalLevels: 20 },
  { key: 'senior', name: '高中', totalLevels: 20 },
  { key: 'cet4', name: '四级', totalLevels: 20 },
  { key: 'cet6', name: '六级', totalLevels: 20 },
];

const WORD_BANK = {
  primary: [
    { cn: '苹果', en: 'apple' },
    { cn: '书本', en: 'book' },
    { cn: '猫', en: 'cat' },
    { cn: '狗', en: 'dog' },
    { cn: '鸟', en: 'bird' },
    { cn: '鱼', en: 'fish' },
    { cn: '花', en: 'flower' },
    { cn: '雨', en: 'rain' },
    { cn: '太阳', en: 'sun' },
    { cn: '月亮', en: 'moon' },
    { cn: '学校', en: 'school' },
    { cn: '老师', en: 'teacher' },
    { cn: '朋友', en: 'friend' },
    { cn: '桌子', en: 'table' },
    { cn: '椅子', en: 'chair' },
    { cn: '杯子', en: 'cup' },
    { cn: '车', en: 'car' },
    { cn: '房子', en: 'house' },
    { cn: '树', en: 'tree' },
    { cn: '山', en: 'mountain' },
    { cn: '水', en: 'water' },
    { cn: '食物', en: 'food' },
    { cn: '体操', en: 'exercise' },
    { cn: '音乐', en: 'music' },
    { cn: '故事', en: 'story' },
  ],
  junior: [
    { cn: '环境', en: 'environment' },
    { cn: '教育', en: 'education' },
    { cn: '旅行', en: 'travel' },
    { cn: '口语', en: 'speaking' },
    { cn: '阅读', en: 'reading' },
    { cn: '历史', en: 'history' },
    { cn: '科学', en: 'science' },
    { cn: '数学', en: 'math' },
    { cn: '实验', en: 'experiment' },
    { cn: '文化', en: 'culture' },
    { cn: '活动', en: 'activity' },
    { cn: '天气', en: 'weather' },
    { cn: '地理', en: 'geography' },
    { cn: '运动', en: 'sport' },
    { cn: '语言', en: 'language' },
    { cn: '梦想', en: 'dream' },
    { cn: '成功', en: 'success' },
    { cn: '健康', en: 'health' },
    { cn: '力量', en: 'power' },
    { cn: '时间', en: 'time' },
    { cn: '快乐', en: 'happiness' },
    { cn: '决定', en: 'decision' },
    { cn: '未来', en: 'future' },
    { cn: '技术', en: 'technology' },
    { cn: '网络', en: 'network' },
    { cn: '自然', en: 'nature' },
  ],
  senior: [
    { cn: '哲学', en: 'philosophy' },
    { cn: '经济', en: 'economy' },
    { cn: '心理', en: 'psychology' },
    { cn: '政治', en: 'politics' },
    { cn: '文学', en: 'literature' },
    { cn: '艺术', en: 'art' },
    { cn: '逻辑', en: 'logic' },
    { cn: '机制', en: 'mechanism' },
    { cn: '分析', en: 'analysis' },
    { cn: '数据', en: 'data' },
    { cn: '能源', en: 'energy' },
    { cn: '社会', en: 'society' },
    { cn: '全球', en: 'global' },
    { cn: '文明', en: 'civilization' },
    { cn: '挑战', en: 'challenge' },
    { cn: '责任', en: 'responsibility' },
    { cn: '创新', en: 'innovation' },
    { cn: '价值', en: 'value' },
    { cn: '现实', en: 'reality' },
    { cn: '理论', en: 'theory' },
    { cn: '策略', en: 'strategy' },
    { cn: '表达', en: 'expression' },
    { cn: '观点', en: 'viewpoint' },
    { cn: '革命', en: 'revolution' },
    { cn: '关系', en: 'relationship' },
    { cn: '信心', en: 'confidence' },
  ],
  cet4: [
    { cn: '适应', en: 'adapt' },
    { cn: '类似', en: 'similar' },
    { cn: '预测', en: 'predict' },
    { cn: '资源', en: 'resource' },
    { cn: '有效', en: 'effective' },
    { cn: '稳定', en: 'stable' },
    { cn: '提高', en: 'improve' },
    { cn: '联系', en: 'connect' },
    { cn: '环境', en: 'environment' },
    { cn: '态度', en: 'attitude' },
    { cn: '预算', en: 'budget' },
    { cn: '交流', en: 'communicate' },
    { cn: '决定', en: 'decide' },
    { cn: '平衡', en: 'balance' },
    { cn: '持续', en: 'sustain' },
    { cn: '困难', en: 'difficulty' },
    { cn: '丰富', en: 'abundant' },
    { cn: '能力', en: 'ability' },
    { cn: '过程', en: 'process' },
    { cn: '管理', en: 'manage' },
    { cn: '重点', en: 'emphasis' },
    { cn: '质量', en: 'quality' },
    { cn: '目标', en: 'goal' },
    { cn: '安全', en: 'safety' },
    { cn: '意见', en: 'opinion' },
    { cn: '合作', en: 'cooperate' },
  ],
  cet6: [
    { cn: '普遍', en: 'prevail' },
    { cn: '策略', en: 'tactic' },
    { cn: '创新', en: 'innovation' },
    { cn: '概念', en: 'concept' },
    { cn: '原则', en: 'principle' },
    { cn: '促进', en: 'promote' },
    { cn: '复杂', en: 'complex' },
    { cn: '评估', en: 'evaluate' },
    { cn: '基础', en: 'foundation' },
    { cn: '机制', en: 'mechanism' },
    { cn: '希望', en: 'aspiration' },
    { cn: '挑战', en: 'challenge' },
    { cn: '协调', en: 'coordinate' },
    { cn: '影响', en: 'influence' },
    { cn: '理念', en: 'ideology' },
    { cn: '优先', en: 'priority' },
    { cn: '项目', en: 'project' },
    { cn: '贡献', en: 'contribute' },
    { cn: '政策', en: 'policy' },
    { cn: '忠诚', en: 'loyalty' },
    { cn: '精确', en: 'precise' },
    { cn: '重大', en: 'significant' },
    { cn: '预期', en: 'expectation' },
    { cn: '责任', en: 'responsibility' },
    { cn: '稳定', en: 'stability' },
    { cn: '理论', en: 'theory' },
  ],
};

const state = {
  levelIndex: 0,
  selected: [],
  board: [],
  locked: false,
  canvas: null,
  ctx: null,
  width: 375,
  height: 667,
  screen: 'home',
  message: '',
  messageType: 'success',
  messageTimer: null,
  userName: '微信玩家',
  tilePositions: [],
  buttonBounds: {
    start: null,
    restart: null,
    next: null,
  },
  bgImage: null,
  bgImageLoaded: false,
};

const totalLevels = CATEGORY_META.reduce((sum, meta) => sum + meta.totalLevels, 0);
const allLevels = buildAllLevels();

function buildAllLevels() {
  const result = [];
  CATEGORY_META.forEach((meta) => {
    for (let i = 1; i <= meta.totalLevels; i += 1) {
      const wordList = [...WORD_BANK[meta.key]];
      const shuffled = shuffle(wordList).slice(0, 6 + (i % 3));
      const words = shuffled.map((item, idx) => ({
        id: `${meta.key}-${i}-${idx}`,
        cn: item.cn,
        en: item.en,
      }));
      result.push({
        category: meta.name,
        number: i,
        words,
      });
    }
  });
  return result;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getCurrentLevel() {
  return allLevels[state.levelIndex];
}

function buildBoardTiles(level) {
  const tiles = [];
  level.words.forEach((word) => {
    tiles.push({ id: word.id, text: word.cn, kind: 'cn' });
    tiles.push({ id: word.id, text: word.en, kind: 'en' });
  });
  return shuffle(tiles);
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
  return '微信玩家';
}

function setMessage(text, type = 'success') {
  state.message = text;
  state.messageType = type;
  if (state.messageTimer) {
    clearTimeout(state.messageTimer);
  }
  state.messageTimer = setTimeout(() => {
    state.message = '';
    render();
  }, 1800);
  render();
}

function resetCurrentLevel() {
  const level = getCurrentLevel();
  state.board = buildBoardTiles(level);
  state.selected = [];
  state.locked = false;
  state.tilePositions = [];
  setMessage('点击中英文块牵线消消乐！', 'success');
}

function handleTileClick(index) {
  if (state.locked || state.selected.includes(index) || state.board.length === 0) {
    return;
  }

  state.selected.push(index);
  render();

  if (state.selected.length < 2) {
    return;
  }

  const firstIndex = state.selected[0];
  const secondIndex = state.selected[1];
  const firstTile = state.board[firstIndex];
  const secondTile = state.board[secondIndex];

  if (firstTile.id === secondTile.id) {
    state.locked = true;
    setMessage('牵线成功！✨', 'success');
    setTimeout(() => {
      state.board = state.board.filter((_, idx) => idx !== firstIndex && idx !== secondIndex);
      state.selected = [];
      state.locked = false;
      state.tilePositions = [];
      render();
    }, 320);
    return;
  }

  state.locked = true;
  setMessage('线断啦，再试一次！', 'error');
  setTimeout(() => {
    state.selected = [];
    state.locked = false;
    render();
  }, 500);
}

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
    const loginRes = await new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject,
      });
    });

    let userProfile = null;
    if (typeof wx.getUserProfile === 'function') {
      userProfile = await new Promise((resolve, reject) => {
        wx.getUserProfile({
          desc: '用于记录游戏用户信息',
          success: resolve,
          fail: reject,
        });
      });
    }

    const cloudResult = await wx.cloud.callFunction({
      name: 'router',
      data: {
        action: 'loginUser',
        code: loginRes.code,
        userInfo: userProfile && userProfile.userInfo ? userProfile.userInfo : userProfile,
      },
    });

    const user = (cloudResult && cloudResult.result && cloudResult.result.user) || cloudResult.result || null;
    if (user) {
      saveStoredUser(user);
      return user;
    }

    return null;
  } catch (err) {
    console.warn('真实登录失败', err);
    return null;
  }
}

function callCloudRouter(action, payload = {}) {
  if (typeof wx === 'undefined' || !wx.cloud || typeof wx.cloud.callFunction !== 'function') {
    return Promise.resolve({ success: false, skipped: true });
  }

  const user = getStoredUser();

  return wx.cloud.callFunction({
    name: 'router',
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

async function saveLevelProgressToCloud() {
  const user = await loginToCloudUser();
  if (!user) {
    return null;
  }

  const level = getCurrentLevel();

  return callCloudRouter('recordWordScore', {
    username: user.username,
    openid: user.openid,
    userId: user._id,
    category: level.category,
    level: level.number,
    score: (state.levelIndex + 1) * 10,
  });
}

async function goToNextLevel() {
  if (state.levelIndex < allLevels.length - 1) {
    state.levelIndex += 1;
  } else {
    state.levelIndex = 0;
  }
  await saveLevelProgressToCloud();
  resetCurrentLevel();
}

function startGame() {
  state.screen = 'game';
  resetCurrentLevel();
}

/* UI 绘制通用辅助工具 */
function drawRoundedRect(ctx, x, y, width, height, radius, fill, stroke, strokeWidth = 2) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }
  ctx.restore();
}

function drawText(ctx, text, x, y, size, color, align = 'center', bold = true) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = color;
  ctx.font = `${bold ? 'bold ' : ''}${size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

// 绘制具有发光与牵线效果的“线段”
function drawConnectingLine(ctx, posA, posB, isError = false) {
  const x1 = posA.x + posA.width / 2;
  const y1 = posA.y + posA.height / 2;
  const x2 = posB.x + posB.width / 2;
  const y2 = posB.y + posB.height / 2;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);

  // 牵线发光外圈
  ctx.strokeStyle = isError ? 'rgba(255, 82, 82, 0.85)' : 'rgba(255, 179, 0, 0.95)';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.shadowColor = isError ? '#ff5252' : '#ffb300';
  ctx.shadowBlur = 12;
  ctx.stroke();

  // 牵线核心白色明亮线
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 端点圆圈小珍珠
  [ {x: x1, y: y1}, {x: x2, y: y2} ].forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = isError ? '#ff5252' : '#ff8f00';
    ctx.stroke();
  });

  ctx.restore();
}

// 解决背景拉伸问题，采用 Cover 等比居中绘制
function drawBackground(ctx, width, height) {
  if (state.bgImageLoaded && state.bgImage) {
    const imgWidth = state.bgImage.width;
    const imgHeight = state.bgImage.height;
    
    // 计算 Cover 铺满比例
    const scale = Math.max(width / imgWidth, height / imgHeight);
    const nw = imgWidth * scale;
    const nh = imgHeight * scale;
    const nx = (width - nw) / 2;
    const ny = (height - nh) / 2;

    ctx.drawImage(state.bgImage, nx, ny, nw, nh);

    // 叠加薄纱层，增强前台文字与卡片反差
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0, 0, width, height);
  } else {
    // 降级柔和彩虹渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#fff8e1');
    gradient.addColorStop(0.5, '#ffe0b2');
    gradient.addColorStop(1, '#ffcc80');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
}

function renderHomeScreen() {
  const ctx = state.ctx;
  const width = state.width;
  const height = state.height;

  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, width, height);

  // 渲染玻璃质感主卡片容器
  const panelWidth = Math.min(width * 0.88, 340);
  const panelHeight = 350;
  const panelX = (width - panelWidth) / 2;
  const panelY = height * 0.32;

  drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 22, 'rgba(255, 255, 255, 0.92)', 'rgba(255, 183, 77, 0.5)', 3);

  // 游戏标题
  const titleY = panelY + 52;
  drawText(ctx, '单词牵线', width / 2, titleY, 36, '#e65100', 'center', true);
  drawText(ctx, 'WORD LINK CHALLENGE', width / 2, titleY + 28, 12, '#fb8c00', 'center', false);

  // 用户与关卡进度信息
  const userName = getCurrentUserName();
  state.userName = userName;
  drawText(ctx, `👋 欢迎玩家：${userName}`, width / 2, titleY + 75, 16, '#5d4037', 'center', false);

  const currentLevel = getCurrentLevel();
  const totalInCategory = CATEGORY_META.find((item) => item.name === currentLevel.category)?.totalLevels || 20;

  // 进度展示框
  const progressBoxX = panelX + 24;
  const progressBoxY = titleY + 112;
  const progressBoxW = panelWidth - 48;
  drawRoundedRect(ctx, progressBoxX, progressBoxY, progressBoxW, 44, 12, '#fff3e0', '#ffe0b2', 1.5);

  drawText(ctx, `当前模式：${currentLevel.category} (第 ${currentLevel.number}/${totalInCategory} 关)`, width / 2, progressBoxY + 22, 15, '#e65100', 'center', true);

  // 开始游戏大按钮
  const btnWidth = panelWidth - 60;
  const btnHeight = 54;
  const btnX = (width - btnWidth) / 2;
  const btnY = panelY + panelHeight - 75;

  const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnHeight);
  btnGrad.addColorStop(0, '#ffa726');
  btnGrad.addColorStop(1, '#f57c00');

  drawRoundedRect(ctx, btnX, btnY, btnWidth, btnHeight, 27, btnGrad, '#e65100', 2);
  drawText(ctx, '开始牵线', width / 2, btnY + btnHeight / 2, 22, '#ffffff', 'center', true);

  state.buttonBounds.start = { x: btnX, y: btnY, width: btnWidth, height: btnHeight };
}

function renderGameScreen() {
  const ctx = state.ctx;
  const width = state.width;
  const height = state.height;

  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, width, height);

  const level = getCurrentLevel();
  const totalInCategory = CATEGORY_META.find((item) => item.name === level.category)?.totalLevels || 20;

  // 顶部导航栏
  const topBarY = 45;
  drawRoundedRect(ctx, 16, topBarY - 12, width - 32, 52, 16, 'rgba(255, 255, 255, 0.92)', '#ffe0b2', 1.5);

  drawText(ctx, `${level.category} • 第 ${level.number}/${totalInCategory} 关`, 32, topBarY + 14, 18, '#e65100', 'left', true);

  // 重置本关按钮
  const restartBtnWidth = 84;
  const restartBtnHeight = 32;
  const restartBtnX = width - restartBtnWidth - 28;
  const restartBtnY = topBarY - 1;

  drawRoundedRect(ctx, restartBtnX, restartBtnY, restartBtnWidth, restartBtnHeight, 16, '#fff3e0', '#ff9800', 1.5);
  drawText(ctx, '重置', restartBtnX + restartBtnWidth / 2, restartBtnY + restartBtnHeight / 2, 14, '#e65100', 'center', true);

  state.buttonBounds.restart = { x: restartBtnX, y: restartBtnY, width: restartBtnWidth, height: restartBtnHeight };

  // 渲染卡片矩阵
  const gap = 12;
  const cols = 3;
  const tileWidth = (width - 32 - gap * (cols - 1)) / cols;
  const tileHeight = 64;
  const startY = 115;

  state.tilePositions = [];

  state.board.forEach((tile, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const x = 16 + col * (tileWidth + gap);
    const y = startY + row * (tileHeight + gap);
    const selected = state.selected.includes(index);

    state.tilePositions.push({ x, y, width: tileWidth, height: tileHeight });

    // 渐变与卡片双色设计
    let cardGrad = ctx.createLinearGradient(x, y, x, y + tileHeight);
    let borderColor = '#ffe0b2';
    let textColor = '#4e342e';

    if (tile.kind === 'cn') {
      cardGrad.addColorStop(0, '#ffffff');
      cardGrad.addColorStop(1, '#fff8e1');
    } else {
      cardGrad.addColorStop(0, '#fffde7');
      cardGrad.addColorStop(1, '#fff59d');
      borderColor = '#ffe082';
    }

    if (selected) {
      cardGrad = ctx.createLinearGradient(x, y, x, y + tileHeight);
      cardGrad.addColorStop(0, '#ffe082');
      cardGrad.addColorStop(1, '#ffb300');
      borderColor = '#f57c00';
      textColor = '#ffffff';
    }

    ctx.save();
    if (selected) {
      ctx.shadowColor = 'rgba(255, 152, 0, 0.6)';
      ctx.shadowBlur = 10;
    }
    drawRoundedRect(ctx, x, y, tileWidth, tileHeight, 14, cardGrad, borderColor, selected ? 3 : 1.5);
    ctx.restore();

    drawText(ctx, tile.text, x + tileWidth / 2, y + tileHeight / 2, tile.kind === 'cn' ? 17 : 16, textColor, 'center', true);
  });

  // 如果选中两张卡片，绘制牵线特效
  if (state.selected.length === 2) {
    const posA = state.tilePositions[state.selected[0]];
    const posB = state.tilePositions[state.selected[1]];
    const tileA = state.board[state.selected[0]];
    const tileB = state.board[state.selected[1]];
    const isError = tileA.id !== tileB.id;

    if (posA && posB) {
      drawConnectingLine(ctx, posA, posB, isError);
    }
  }

  // 提示消息弹窗
  if (state.message) {
    const msgBoxWidth = width - 60;
    const msgBoxHeight = 42;
    const msgBoxX = 30;
    const msgBoxY = height - 120;
    const isError = state.messageType === 'error';
    const msgBg = isError ? 'rgba(255, 82, 82, 0.95)' : 'rgba(76, 175, 80, 0.95)';

    drawRoundedRect(ctx, msgBoxX, msgBoxY, msgBoxWidth, msgBoxHeight, 21, msgBg);
    drawText(ctx, state.message, width / 2, msgBoxY + msgBoxHeight / 2, 15, '#ffffff', 'center', true);
  }

  // 通关 / 进入下一关按钮
  if (state.board.length === 0) {
    const nextBtnWidth = 160;
    const nextBtnHeight = 50;
    const nextBtnX = (width - nextBtnWidth) / 2;
    const nextBtnY = height - 80;

    const isAllClear = state.levelIndex >= allLevels.length - 1;
    const btnText = isAllClear ? '🎉 全部通关' : '进入下一关 ➔';

    const nextGrad = ctx.createLinearGradient(nextBtnX, nextBtnY, nextBtnX, nextBtnY + nextBtnHeight);
    nextGrad.addColorStop(0, '#66bb6a');
    nextGrad.addColorStop(1, '#43a047');

    drawRoundedRect(ctx, nextBtnX, nextBtnY, nextBtnWidth, nextBtnHeight, 25, nextGrad, '#2e7d32', 2);
    drawText(ctx, btnText, width / 2, nextBtnY + nextBtnHeight / 2, 18, '#ffffff', 'center', true);

    state.buttonBounds.next = { x: nextBtnX, y: nextBtnY, width: nextBtnWidth, height: nextBtnHeight };
  } else {
    state.buttonBounds.next = null;
  }
}

function render() {
  if (!state.ctx) return;

  if (state.screen === 'home') {
    renderHomeScreen();
  } else if (state.screen === 'game') {
    renderGameScreen();
  }
}

function handleTouchStart(event) {
  if (!event || !event.changedTouches) return;

  const touch = event.changedTouches[0];
  if (!touch) return;

  const x = touch.x;
  const y = touch.y;

  if (state.screen === 'home') {
    const startBtn = state.buttonBounds.start;
    if (startBtn && x >= startBtn.x && x <= startBtn.x + startBtn.width && y >= startBtn.y && y <= startBtn.y + startBtn.height) {
      startGame();
      return;
    }
  } else if (state.screen === 'game') {
    const restartBtn = state.buttonBounds.restart;
    if (restartBtn && x >= restartBtn.x && x <= restartBtn.x + restartBtn.width && y >= restartBtn.y && y <= restartBtn.y + restartBtn.height) {
      resetCurrentLevel();
      return;
    }

    const nextBtn = state.buttonBounds.next;
    if (nextBtn && x >= nextBtn.x && x <= nextBtn.x + nextBtn.width && y >= nextBtn.y && y <= nextBtn.y + nextBtn.height) {
      goToNextLevel();
      return;
    }

    for (let index = 0; index < state.tilePositions.length; index += 1) {
      const pos = state.tilePositions[index];
      if (x >= pos.x && x <= pos.x + pos.width && y >= pos.y && y <= pos.y + pos.height) {
        handleTileClick(index);
        return;
      }
    }
  }
}

function loadBackgroundImage() {
  state.bgImage = wx.createImage();
  state.bgImage.onload = () => {
    state.bgImageLoaded = true;
    render();
  };
  state.bgImage.onerror = (err) => {
    console.warn('背景图加载失败，自动使用默认柔和背景', err);
    state.bgImageLoaded = false;
  };
  state.bgImage.src = 'images/bg/bg.jpg';
}

function init() {
  if (typeof wx === 'undefined') {
    console.error('环境错误：本小游戏仅支持在微信小程序/小游戏环境运行！');
    return;
  }

  state.canvas = wx.createCanvas();
  if (!state.canvas) {
    console.error('创建Canvas失败');
    return;
  }

  state.ctx = state.canvas.getContext('2d');

  let systemInfo = { windowWidth: 375, windowHeight: 667 };
  try {
    if (typeof wx.getSystemInfoSync === 'function') {
      systemInfo = wx.getSystemInfoSync();
    }
  } catch (err) {
    console.warn('getSystemInfoSync 尚未就绪，使用默认尺寸', err);
  }

  state.width = systemInfo.windowWidth || 375;
  state.height = systemInfo.windowHeight || 667;
  state.canvas.width = state.width;
  state.canvas.height = state.height;

  try {
    if (typeof wx.onTouchStart === 'function') {
      wx.onTouchStart(handleTouchStart);
    }
  } catch (err) {
    console.warn('绑定触摸事件失败', err);
  }

  state.userName = getCurrentUserName();
  loadBackgroundImage();
  render();
}

init();