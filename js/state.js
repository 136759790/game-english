const CATEGORY_META = require('./data/categoryMeta');
const WORD_BANK = require('./data/wordBank');
const { getCurrentUserName } = require('./services/cloudService');
const { createExplosion } = require('./views/components');

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
    // 增加 matched 状态字段
    tiles.push({ id: word.id, text: word.cn, kind: 'cn', matched: false });
    tiles.push({ id: word.id, text: word.en, kind: 'en', matched: false });
  });
  return shuffle(tiles);
}

const state = {
  levelIndex: 0,
  selected: [],
  board: [],
  shakeIndices: [],     // 正在晃动的卡片索引
  shakeStartTime: 0,    // 晃动开始时间
  particles: [],        // 粒子特效集合
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
  },
  bgImage: null,
  bgImageLoaded: false,
  allLevels: buildAllLevels(),
  CATEGORY_META,
};

async function initUserName() {
  const { loginToCloudUser, getCurrentUserName } = require('./services/cloudService');
  // 静默登录：先尝试从缓存读取，再尝试真实登录
  await loginToCloudUser();
  state.userName = getCurrentUserName();
}

function resetCurrentLevel() {
  const level = state.allLevels[state.levelIndex];
  state.board = buildBoardTiles(level);
  state.selected = [];
  state.shakeIndices = [];
  state.particles = [];
  state.locked = false;
  state.tilePositions = [];
  setMessage('请选择同一单词的中英两块', 'success');
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
  // 处于晃动冻结期，或点击已消除/已选中的卡片，直接屏蔽
  if (state.shakeIndices.length > 0) return;
  if (state.board[index].matched) return;
  if (state.selected.includes(index)) return;

  state.selected.push(index);

  if (state.selected.length === 2) {
    const idxA = state.selected[0];
    const idxB = state.selected[1];
    const tileA = state.board[idxA];
    const tileB = state.board[idxB];

    // 配对成功：ID 相同且一个是中文一个是英文
    if (tileA.id === tileB.id && tileA.kind !== tileB.kind) {
      const posA = state.tilePositions[idxA];
      const posB = state.tilePositions[idxB];

      // 1. 触发配对成功爆炸粒子效果[cite: 13]
      if (posA) createExplosion(state, posA.x + posA.width / 2, posA.y + posA.height / 2, '#4caf50');
      if (posB) createExplosion(state, posB.x + posB.width / 2, posB.y + posB.height / 2, '#4caf50');

      // 2. 标记 matched，卡片在渲染时隐藏，但不改变数组索引，避免位置变动[cite: 13]
      tileA.matched = true;
      tileB.matched = true;
      state.selected = [];

    } else {
      // 🌟 配对失败：设置晃动状态
      state.shakeIndices = [idxA, idxB];
      state.shakeStartTime = Date.now();

      // 400ms 晃动结束后清除选中
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