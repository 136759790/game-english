// 本地错题缓存（避免频繁读取本地存储）
let localMistakesCache = null;
let localMistakesCacheTime = 0;
const MISTAKES_CACHE_DURATION = 5000; // 5秒缓存

// 获取本地错题本（带缓存）
function getCachedLocalMistakes(dictName) {
  const now = Date.now();
  if (localMistakesCache && (now - localMistakesCacheTime) < MISTAKES_CACHE_DURATION) {
    return localMistakesCache;
  }
  localMistakesCache = getLocalMistakes(dictName);
  localMistakesCacheTime = now;
  return localMistakesCache;
}
const { getCurrentUserName, saveLevelRecordToCloud, getUserMaxPassedLevel, recordMistakeToCloud, updateMistakeCorrectToCloud, getLocalMistakes } = require('./services/cloudService');
const { createExplosion, createFloatText } = require('./views/components');
const soundManager = require('./services/audio');
const { initCloud, getCloud } = require('./services/cloud');

const CATEGORY_META = [
  { key: 'primary', name: '小学', totalLevels: 20 },
  { key: 'junior', name: '初中', totalLevels: 20 },
  { key: 'senior', name: '高中', totalLevels: 20 },
  { key: 'cet4', name: '四级', totalLevels: 20 },
  { key: 'cet6', name: '六级', totalLevels: 20 },
];

const DICT_OPTIONS = [
  { key: 'xiaoXue1_1', grade: 1, semester: 1, label: '一年级上', fileId: 'cloud://cloud1-d8g211tvdcd31f789.636c-cloud1-d8g211tvdcd31f789-1331721156/ge/PEP_SL_XiaoXue1_1_t.json', dictName: 'PEP_SL_XiaoXue1_1_t' },
  { key: 'xiaoXue1_2', grade: 1, semester: 2, label: '一年级下', fileId: 'cloud://cloud1-d8g211tvdcd31f789.636c-cloud1-d8g211tvdcd31f789-1331721156/ge/PEP_SL_XiaoXue1_2_t.json', dictName: 'PEP_SL_XiaoXue1_2_t' },
  { key: 'xiaoXue2_1', grade: 2, semester: 1, label: '二年级上', fileId: 'cloud://cloud1-d8g211tvdcd31f789.636c-cloud1-d8g211tvdcd31f789-1331721156/ge/PEP_SL_XiaoXue2_1_t.json', dictName: 'PEP_SL_XiaoXue2_1_t' },
  { key: 'xiaoXue2_2', grade: 2, semester: 2, label: '二年级下', fileId: 'cloud://cloud1-d8g211tvdcd31f789.636c-cloud1-d8g211tvdcd31f789-1331721156/ge/PEP_SL_XiaoXue2_2_t.json', dictName: 'PEP_SL_XiaoXue2_2_t' },
  { key: 'xiaoXue3_1', grade: 3, semester: 1, label: '三年级上', fileId: 'cloud://cloud1-d8g211tvdcd31f789.636c-cloud1-d8g211tvdcd31f789-1331721156/ge/PEP_SL_XiaoXue3_1_t.json', dictName: 'PEP_SL_XiaoXue3_1_t' },
  { key: 'xiaoXue3_2', grade: 3, semester: 2, label: '三年级下', fileId: 'cloud://cloud1-d8g211tvdcd31f789.636c-cloud1-d8g211tvdcd31f789-1331721156/ge/PEP_SL_XiaoXue3_2_t.json', dictName: 'PEP_SL_XiaoXue3_2_t' },
  { key: 'xiaoXue4_1', grade: 4, semester: 1, label: '四年级上', fileId: 'cloud://cloud1-d8g211tvdcd31f789.636c-cloud1-d8g211tvdcd31f789-1331721156/ge/PEP_SL_XiaoXue4_1_t.json', dictName: 'PEP_SL_XiaoXue4_1_t' },
  { key: 'xiaoXue4_2', grade: 4, semester: 2, label: '四年级下', fileId: 'cloud://cloud1-d8g211tvdcd31f789.636c-cloud1-d8g211tvdcd31f789-1331721156/ge/PEP_SL_XiaoXue4_2_t.json', dictName: 'PEP_SL_XiaoXue4_2_t' },
  { key: 'xiaoXue5_1', grade: 5, semester: 1, label: '五年级上', fileId: 'cloud://cloud1-d8g211tvdcd31f789.636c-cloud1-d8g211tvdcd31f789-1331721156/ge/PEP_SL_XiaoXue5_1_t.json', dictName: 'PEP_SL_XiaoXue5_1_t' },
  { key: 'xiaoXue5_2', grade: 5, semester: 2, label: '五年级下', fileId: 'cloud://cloud1-d8g211tvdcd31f789.636c-cloud1-d8g211tvdcd31f789-1331721156/ge/PEP_SL_XiaoXue5_2_t.json', dictName: 'PEP_SL_XiaoXue5_2_t' },
  { key: 'xiaoXue6_1', grade: 6, semester: 1, label: '六年级上', fileId: 'cloud://cloud1-d8g211tvdcd31f789.636c-cloud1-d8g211tvdcd31f789-1331721156/ge/PEP_SL_XiaoXue6_1_t.json', dictName: 'PEP_SL_XiaoXue6_1_t' },
  { key: 'xiaoXue6_2', grade: 6, semester: 2, label: '六年级下', fileId: 'cloud://cloud1-d8g211tvdcd31f789.636c-cloud1-d8g211tvdcd31f789-1331721156/ge/PEP_SL_XiaoXue6_2_t.json', dictName: 'PEP_SL_XiaoXue6_2_t' },
];

function getInitialDictionary() {
  try {
    if (typeof wx !== 'undefined' && wx.getStorageSync) {
      const savedKey = wx.getStorageSync('ge_selected_dict_key');
      if (savedKey) {
        const found = DICT_OPTIONS.find((item) => item.key === savedKey);
        if (found) return found;
      }
    }
  } catch (err) {
    console.warn('读取上次选择词库失败', err);
  }
  return DICT_OPTIONS.find((item) => item.key === 'xiaoXue5_1') || DICT_OPTIONS[0];
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getDictionaryLabel(option) {
  return option && option.label ? option.label : '小学词库';
}

function getFallbackWordList() {
  return [];
}

function normalizeWordEntries(rawWords) {
  if (!rawWords) return [];

  let list = [];
  if (Array.isArray(rawWords)) {
    list = rawWords;
  } else if (typeof rawWords === 'object') {
    if (Array.isArray(rawWords.words)) {
      list = rawWords.words;
    } else if (Array.isArray(rawWords.data)) {
      list = rawWords.data;
    } else if (Array.isArray(rawWords.list)) {
      list = rawWords.list;
    } else {
      const values = Object.values(rawWords);
      const allArrays = values.length > 0 && values.every((v) => Array.isArray(v));
      if (allArrays) {
        list = values.flat();
      } else {
        return Object.entries(rawWords)
          .map(([en, cn]) => ({
            en: String(en).trim(),
            cn: String(cn).trim(),
          }))
          .filter((item) => item.en && item.cn);
      }
    }
  }

  return list.reduce((result, item) => {
    if (!item || typeof item !== 'object') {
      return result;
    }

    const en = item.en || item.word || item.name || item.english || item.text || item.headWord || '';
    let cnRaw = item.cn || item.chinese || item.translation || item.meaning || item.zh || item.trans || item.meanings;

    if (Array.isArray(cnRaw)) {
      cnRaw = cnRaw
        .map((c) => {
          if (typeof c === 'string') return c;
          if (c && typeof c === 'object') return c.tranCn || c.cn || c.meaning || '';
          return '';
        })
        .filter(Boolean)
        .join('；');
    } else if (cnRaw && typeof cnRaw === 'object') {
      cnRaw = cnRaw.tranCn || cnRaw.cn || cnRaw.chinese || JSON.stringify(cnRaw);
    }

    const enClean = String(en).trim();
    const cnClean = String(cnRaw || '').trim();

    if (enClean && cnClean) {
      result.push({ en: enClean, cn: cnClean });
    }

    return result;
  }, []);
}

function getDictCacheKey(fileName) {
  return `ge_dict_cache_${fileName}`;
}

async function loadDictionaryFromCloud(fileId, dictName) {
  if (!fileId) return null;

  const cacheKey = getDictCacheKey(dictName);

  try {
    if (typeof wx !== 'undefined' && wx.getStorageSync) {
      const cached = wx.getStorageSync(cacheKey);
      if (Array.isArray(cached) && cached.length > 0) {
        console.log('[词库] 命中本地缓存:', dictName, '单词总数:', cached.length);
        return cached;
      }
    }
  } catch (err) {
    console.warn('[词库] 读取本地缓存失败:', err);
  }

  if (typeof wx === 'undefined' || !wx.cloud) {
    console.warn('[词库] wx.cloud 未就绪，无法远程下载');
    return null;
  }

  // 确保跨账号 Cloud 实例已初始化
  let cloudInstance = getCloud();
  if (!cloudInstance) {
    console.log('[词库] 等待 Cloud 实例初始化...');
    cloudInstance = await initCloud();
  }

  if (!cloudInstance) {
    console.warn('[词库] 跨环境 Cloud 实例未就绪');
    return null;
  }

  console.log('[词库] 开始通过 cloudInstance 从远程云存储下载:', fileId,cloudInstance);

  try {
    // 🌟 必须使用 cloudInstance 实例来下载跨环境资源
    const downloadRes = await cloudInstance.downloadFile({
      fileID: fileId,
    });
    const tempFilePath = downloadRes && downloadRes.tempFilePath;
    console.log('[词库] downloadFile 结果:', downloadRes);
    if (!tempFilePath) {
      console.warn('[词库] downloadFile 未返回 tempFilePath:', downloadRes);
      return null;
    }

    const fs = wx.getFileSystemManager && wx.getFileSystemManager();
    if (!fs || typeof fs.readFile !== 'function') {
      return null;
    }

    const fileContent = await new Promise((resolve, reject) => {
      fs.readFile({
        filePath: tempFilePath,
        encoding: 'utf8',
        success: (res) => resolve(res.data || res),
        fail: reject,
      });
    });

    const parsed = typeof fileContent === 'string' ? JSON.parse(fileContent) : fileContent;
    const words = normalizeWordEntries(parsed);
    if (!words || !words.length) {
      console.warn('[词库] 远程词库解析后单词列表为空:', dictName);
      return null;
    }

    console.log('[词库] 远程下载并解析成功:', dictName, '有效词汇量:', words.length);

    try {
      if (typeof wx !== 'undefined' && wx.setStorageSync) {
        wx.setStorageSync(cacheKey, words);
        console.log('[词库] 已成功保存到本地缓存:', cacheKey);
      }
    } catch (saveErr) {
      console.warn('[词库] 写入本地缓存失败:', saveErr);
    }

    return words;
  } catch (err) {
    console.warn('[词库] 远程下载失败:', dictName, err);
    return null;
  }
}

const WORDS_PER_LEVEL = 16;

function buildAllLevels(wordList = getFallbackWordList(), dictionaryLabel = '小学词库', dictionaryKey = 'PEP_SL_XiaoXue5_1_t') {
  const safeWords = Array.isArray(wordList) && wordList.length > 0 ? wordList : getFallbackWordList();
  const totalWords = safeWords.length;
  const totalLevels = Math.max(1, Math.ceil(totalWords / WORDS_PER_LEVEL));
  const result = [];

  for (let i = 1; i <= totalLevels; i += 1) {
    const startIndex = (i - 1) * WORDS_PER_LEVEL;
    let sliceWords = safeWords.slice(startIndex, startIndex + WORDS_PER_LEVEL);

    if (sliceWords.length < 8 && safeWords.length >= WORDS_PER_LEVEL) {
      sliceWords = safeWords.slice(-WORDS_PER_LEVEL);
    }

    const words = sliceWords.map((item, idx) => ({
      id: `${dictionaryKey}-${i}-${idx}`,
      cn: item.cn,
      en: item.en,
    }));

    result.push({
      category: dictionaryLabel,
      dictionaryKey,
      number: i,
      totalLevels,
      words,
    });
  }

  return result;
}

function buildBoardTiles(level) {
  const tiles = [];
  (level.words || []).forEach((word) => {
    tiles.push({ id: word.id, text: word.cn, kind: 'cn', matched: false });
    tiles.push({ id: word.id, text: word.en, kind: 'en', matched: false });
  });
  return shuffle(tiles);
}

async function applyDictionaryOption(option) {
  const selected = option || getInitialDictionary();
  const dictionaryLabel = getDictionaryLabel(selected);
  const cleanDictName = selected.dictName || 'PEP_SL_XiaoXue5_1_t';

  try {
    if (typeof wx !== 'undefined' && wx.setStorageSync) {
      wx.setStorageSync('ge_selected_dict_key', selected.key);
    }
  } catch (e) {}

  const cloudWords = selected && selected.fileId ? await loadDictionaryFromCloud(selected.fileId, cleanDictName) : null;
  const sourceWords = cloudWords && cloudWords.length ? cloudWords : getFallbackWordList();

  state.selectedDictionary = selected;
  state.wordBankSource = cloudWords && cloudWords.length ? 'cloud' : 'local';
  state.dictionaryLoadError = cloudWords && cloudWords.length ? '' : '云词库加载失败，已使用本地备份词库';
  state.allLevels = buildAllLevels(sourceWords, dictionaryLabel, cleanDictName);
  
  // 恢复用户的最高通关关卡
  const maxLevel = getUserMaxPassedLevel(cleanDictName);
  if (maxLevel > 0 && maxLevel <= state.allLevels.length) {
    state.levelIndex = maxLevel - 1; // 关卡从 0 开始索引
    console.log(`[关卡记录] 恢复到 ${cleanDictName} 第 ${maxLevel} 关`);
  } else {
    state.levelIndex = 0;
  }

  return sourceWords;
}

const initialDict = getInitialDictionary();
const initialDictName = initialDict.dictName || 'PEP_SL_XiaoXue5_1_t';

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
  wordBankButtons: [],
  dictionaryOptions: DICT_OPTIONS,
  selectedDictionary: initialDict,
  wordBankSource: 'local',
  dictionaryLoadError: '',
  buttonBounds: {
    start: null,
    homeSwitch: null,
    dictionaryBack: null,
    backHome: null,
    restart: null,
    next: null,
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

  score: 0,
  timeLeft: 35,
  maxTime: 35,
  timerInterval: null,
  comboCount: 0,
  lastMatchTime: 0,
  isFever: false,
  isGameOver: false,
  isPaused: false,

  allLevels: buildAllLevels(getFallbackWordList(), getDictionaryLabel(initialDict), initialDictName),
  CATEGORY_META,
};

function initUserName() {
  state.userName = getCurrentUserName();
}

function startTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    if (state.screen === 'game' && !state.isGameOver && !state.settingsOpen && !state.isPaused) {
      const isAllMatched = state.board && state.board.length > 0 && state.board.every((tile) => tile.matched);
      if (isAllMatched) return;

      state.timeLeft -= 1;
      
      if (Date.now() - state.lastMatchTime > 3500) {
        state.comboCount = 0;
        state.isFever = false;
      }

      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.isGameOver = true;
        soundManager.stopBGM();
        soundManager.playFail();
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

  state.score = 0;
  state.timeLeft = 35;
  state.comboCount = 0;
  state.isFever = false;
  state.isGameOver = false;
  state.isPaused = false;

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

    if (tileA.id === tileB.id && tileA.kind !== tileB.kind) {
      soundManager.playSuccess();

      const posA = state.tilePositions[idxA];
      const posB = state.tilePositions[idxB];

      const now = Date.now();
      if (now - state.lastMatchTime <= 3500) {
        state.comboCount += 1;
      } else {
        state.comboCount = 1;
      }
      state.lastMatchTime = now;

      if (state.comboCount >= 3) {
        state.isFever = true;
      }

      const addedTime = state.isFever ? 5 : 3;
      const addedScore = (100 * state.comboCount) * (state.isFever ? 2 : 1);
      state.timeLeft = Math.min(state.timeLeft + addedTime, 75);
      state.score += addedScore;

      const centerX = posA ? posA.x + posA.width / 2 : state.width / 2;
      const centerY = posA ? posA.y + posA.height / 2 : state.height / 2;

      const explosionColor = state.isFever ? '#ff1744' : '#4caf50';
      if (posA) createExplosion(state, posA.x + posA.width / 2, posA.y + posA.height / 2, explosionColor);
      if (posB) createExplosion(state, posB.x + posB.width / 2, posB.y + posB.height / 2, explosionColor);

      let floatMsg = `+${addedTime}s`;
      if (state.comboCount > 1) {
        floatMsg = `${state.comboCount} 连击! +${addedTime}s`;
      }
      if (state.isFever) {
        floatMsg = `🔥狂暴! Combo x${state.comboCount} +${addedTime}s`;
      }
      createFloatText(state, floatMsg, centerX, centerY - 10, state.isFever ? '#ff1744' : '#ff9800');

      // 如果这个单词之前在错题本中，更新正确次数（异步非阻塞）
      const wordEn = tileA.kind === 'en' ? tileA.text : tileB.text;
      const dictName = state.selectedDictionary && state.selectedDictionary.dictName ? state.selectedDictionary.dictName : 'PEP_SL_XiaoXue5_1_t';
      const localMistakes = getCachedLocalMistakes(dictName);
      if (localMistakes[wordEn]) {
        console.log(`[错题本] 用户答对了错题本中的单词: ${wordEn}`);
        // 异步更新，不阻塞游戏
        setTimeout(() => updateMistakeCorrectToCloud(dictName, wordEn), 0);
      }

      tileA.matched = true;
      tileB.matched = true;
      state.selected = [];

      const isLevelClear = state.board.length > 0 && state.board.every((tile) => tile.matched);
      if (isLevelClear) {
        const currentLevel = state.allLevels[state.levelIndex] || { number: state.levelIndex + 1 };
        const cleanDictName = (state.selectedDictionary && state.selectedDictionary.dictName)
          ? state.selectedDictionary.dictName
          : 'PEP_SL_XiaoXue5_1_t';

        // 异步保存，不阻塞游戏
        setTimeout(() => saveLevelRecordToCloud(cleanDictName, currentLevel.number, state.score, state.timeLeft), 0);
      }

    } else {
      soundManager.playFail();

      state.comboCount = 0;
      state.isFever = false;

      state.shakeIndices = [idxA, idxB];
      state.shakeStartTime = Date.now();

      // 记录答错的单词到错题本（异步非阻塞，不卡顿）
      const wordEn = tileA.kind === 'en' ? tileA.text : tileB.text;
      const wordCn = tileA.kind === 'cn' ? tileA.text : tileB.text;
      const dictName = state.selectedDictionary && state.selectedDictionary.dictName ? state.selectedDictionary.dictName : 'PEP_SL_XiaoXue5_1_t';
      const currentLevel = state.allLevels[state.levelIndex] || { number: state.levelIndex + 1 };
      
      console.log(`[错题本] 用户答错单词: ${wordEn} - ${wordCn}`);
      // 异步记录，不阻塞游戏
      setTimeout(() => recordMistakeToCloud(dictName, wordEn, wordCn, currentLevel.number), 0);

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
  applyDictionaryOption,
  CATEGORY_META,
  DICT_OPTIONS,
};