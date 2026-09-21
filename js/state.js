const CATEGORY_META = require('./data/categoryMeta');
const WORD_BANK = require('./data/wordBank');
const { getCurrentUserName } = require('./services/cloudService');
const { createExplosion, createFloatText } = require('./views/components');
const soundManager = require('./services/audio'); // 引入音频服务

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

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

function buildBoardTiles(level) {
  const tiles = [];
  level.words.forEach((word) => {
    tiles.push({ id: word.id, text: word.cn, kind: 'cn', matched: false });
    tiles.push({ id: word.id, text: word.en, kind: 'en', matched: false });
  });
  return shuffle(tiles);
}

const state = {
  levelIndex: 0,
  selected: [],
  board: [],
  shakeIndices: [],
  shakeStartTime: 0,
  particles: [],
  floatTexts: [],
  locked: false,
  canvas: null,
  ctx: null,
  width: 375,
  height: 667,
  screen: 'home',
  message: '',
  messageType: 'success',
  messageTimer: null,
  userName: '游客',
  tilePositions: [],
  buttonBounds: {
    start: null,
    restart: null,
    next: null,
    hint: null,
    refresh: null,
    exit: null,
    mute: null,
    settings: null,
    settingsMute: null,
    settingsExit: null,
  },
  settingsOpen: false,
  muted: soundManager.isMuted(),
  bgImage: null,
  bgImageLoaded: false,

  // 限时狂飙模式相关状态
  score: 0,
  timeLeft: 30,             // 初始倒计时 30s
  maxTime: 30,              // 基础满时间
  timerInterval: null,      // 定时器句柄
  comboCount: 0,            // 当前连击数
  lastMatchTime: 0,         // 上一次配对成功的时间戳
  isFever: false,           // 是否处于 Fever 狂暴状态
  isGameOver: false,        // 是否超时失败

  allLevels: buildAllLevels(),
  CATEGORY_META,
};

function initUserName() {
  state.userName = getCurrentUserName();
}

function startTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    if (state.screen === 'game' && !state.isGameOver) {
      state.timeLeft -= 1;
      
      // 判断 Combo 是否过期（超过 3.5 秒未连击清零）
      if (Date.now() - state.lastMatchTime > 3500) {
        state.comboCount = 0;
        state.isFever = false;
      }

      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.isGameOver = true;
        soundManager.stopBGM(); // 超时停止 BGM
        soundManager.playFail(); // 播放失败音效
        clearInterval(state.timerInterval);
      }
    }
  }, 1000);
}

function resetCurrentLevel() {
  const level = state.allLevels[state.levelIndex];
  state.board = buildBoardTiles(level);
  state.selected = [];
  state.shakeIndices = [];
  state.particles = [];
  state.floatTexts = [];
  state.locked = false;
  state.tilePositions = [];

  // 重置模式数值
  state.score = 0;
  state.timeLeft = 30;
  state.comboCount = 0;
  state.isFever = false;
  state.isGameOver = false;

  state.muted = soundManager.isMuted();
  setMessage('请选择同一单词的中英两块', 'success');
  if (!state.muted) {
    soundManager.startBGM();
  }
  startTimer();
}

function setMessage(text, type = 'success') {
  state.message = text;
  state.messageType = type;
  if (state.messageTimer) {
    clearTimeout(state.messageTimer);
  }
  state.messageTimer = setTimeout(() => {
    state.message = '';
  }, 2000);
}

function handleTileClick(index) {
  if (state.isGameOver) return;
  if (state.shakeIndices.length > 0) return;
  if (state.board[index].matched) return;
  if (state.selected.includes(index)) return;

  state.selected.push(index);

  if (state.selected.length === 2) {
    const idxA = state.selected[0];
    const idxB = state.selected[1];
    const tileA = state.board[idxA];
    const tileB = state.board[idxB];

    // 配对成功
    if (tileA.id === tileB.id && tileA.kind !== tileB.kind) {
      soundManager.playSuccess(); // 播放成功音效

      const posA = state.tilePositions[idxA];
      const posB = state.tilePositions[idxB];

      const now = Date.now();
      // 3.5 秒内连续消除算 Combo
      if (now - state.lastMatchTime <= 3500) {
        state.comboCount += 1;
      } else {
        state.comboCount = 1;
      }
      state.lastMatchTime = now;

      // 触发 Fever 模式（Combo >= 3）
      if (state.comboCount >= 3) {
        state.isFever = true;
      }

      // 算分 & 时间奖励
      const addedTime = state.isFever ? 5 : 3;
      const addedScore = (100 * state.comboCount) * (state.isFever ? 2 : 1);
      state.timeLeft = Math.min(state.timeLeft + addedTime, 60); // 最多累积到 60s
      state.score += addedScore;

      // 产生粒子与提示动画
      const centerX = posA ? posA.x + posA.width / 2 : state.width / 2;
      const centerY = posA ? posA.y + posA.height / 2 : state.height / 2;

      const explosionColor = state.isFever ? '#ff1744' : '#4caf50';
      if (posA) createExplosion(state, posA.x + posA.width / 2, posA.y + posA.height / 2, explosionColor);
      if (posB) createExplosion(state, posB.x + posB.width / 2, posB.y + posB.height / 2, explosionColor);

      // 浮动文本
      let floatMsg = `+${addedTime}s`;
      if (state.comboCount > 1) {
        floatMsg = `${state.comboCount} 连击! +${addedTime}s`;
      }
      if (state.isFever) {
        floatMsg = `🔥狂暴! Combo x${state.comboCount} +${addedTime}s`;
      }
      createFloatText(state, floatMsg, centerX, centerY - 10, state.isFever ? '#ff1744' : '#ff9800');

      tileA.matched = true;
      tileB.matched = true;
      state.selected = [];

    } else {
      // 配对失败：中断 Combo，播放错误音效并产生晃动
      soundManager.playFail();

      state.comboCount = 0;
      state.isFever = false;

      state.shakeIndices = [idxA, idxB];
      state.shakeStartTime = Date.now();

      setTimeout(() => {
        state.shakeIndices = [];
        state.selected = [];
      }, 400);
    }
  }
}

module.exports = {
  state,
  initUserName,
  resetCurrentLevel,
  setMessage,
  handleTileClick,
  buildAllLevels,
  CATEGORY_META,
};