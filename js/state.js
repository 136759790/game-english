const { getCurrentUserName, saveLevelRecordToCloud } = require('./services/cloudService');
const { createExplosion, createFloatText } = require('./views/components');
const soundManager = require('./services/audio'); // 引入音频服务

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
  // 默认五年级上册 PEP_SL_XiaoXue5_1_t
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

// 规范化远程/本地词库格式，兼容数组、单元对象、键值对映射等多种结构
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

function getCloudEnvId() {
  return 'cloud1-d8g211tvdcd31f789';
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

// 获取词库本地缓存 key
function getDictCacheKey(fileName) {
  return `ge_dict_cache_${fileName}`;
}

// 远程获取词库并缓存至本地
async function loadDictionaryFromCloud(fileId, dictName) {
  if (!fileId) return null;

  const cacheKey = getDictCacheKey(dictName);

  // 1. 优先读取本地持久化缓存（首页选过则秒开，不重复耗费网络下载）
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

  // 2. 本地无缓存，从远程微信小程序云存储下载
  if (typeof wx === 'undefined' || !wx.cloud || typeof wx.cloud.downloadFile !== 'function') {
    console.warn('[词库] wx.cloud 未就绪，无法远程下载');
    return null;
  }

  if (!ensureCloudReady()) {
    console.warn('[词库] ensureCloudReady 未就绪');
    return null;
  }

  console.log('[词库] 开始从远程云存储下载:', fileId);

  try {
    const downloadRes = await wx.cloud.downloadFile({ fileID: fileId });
    const tempFilePath = downloadRes && downloadRes.tempFilePath;
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

    // 3. 下载成功后保存到本地缓存
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

// 🌟 根据单词数量设置关卡数量，一关 16 个单词
const WORDS_PER_LEVEL = 16;

function buildAllLevels(wordList = getFallbackWordList(), dictionaryLabel = '小学词库', dictionaryKey = 'PEP_SL_XiaoXue5_1_t') {
  const safeWords = Array.isArray(wordList) && wordList.length > 0 ? wordList : getFallbackWordList();
  const totalWords = safeWords.length;
  // 根据单词数量动态计算关卡数量
  const totalLevels = Math.max(1, Math.ceil(totalWords / WORDS_PER_LEVEL));
  const result = [];

  for (let i = 1; i <= totalLevels; i += 1) {
    const startIndex = (i - 1) * WORDS_PER_LEVEL;
    let sliceWords = safeWords.slice(startIndex, startIndex + WORDS_PER_LEVEL);

    // 若最后一关单词不足 16 个且总单词量充足，从末尾向前截取 16 个，确保卡片数量饱满
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

// 应用选中的词库：从远程下载并缓存到本地，然后构建 16 词一关的关卡矩阵
async function applyDictionaryOption(option) {
  const selected = option || getInitialDictionary();
  const dictionaryLabel = getDictionaryLabel(selected);
  const cleanDictName = selected.dictName || 'PEP_SL_XiaoXue5_1_t';

  // 记录选择项
  try {
    if (typeof wx !== 'undefined' && wx.setStorageSync) {
      wx.setStorageSync('ge_selected_dict_key', selected.key);
    }
  } catch (e) {}

  // 首页选哪个就从远程获取并缓存到本地哪个
  const cloudWords = selected && selected.fileId ? await loadDictionaryFromCloud(selected.fileId, cleanDictName) : null;
  const sourceWords = cloudWords && cloudWords.length ? cloudWords : getFallbackWordList();

  state.selectedDictionary = selected;
  state.wordBankSource = cloudWords && cloudWords.length ? 'cloud' : 'local';
  state.dictionaryLoadError = cloudWords && cloudWords.length ? '' : '云词库加载失败，已使用本地备份词库';
  // 根据单词数量设置关卡数量，一关 16 个单词
  state.allLevels = buildAllLevels(sourceWords, dictionaryLabel, cleanDictName);
  state.levelIndex = 0;

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
  timeLeft: 35,             // 初始倒计时 35s（16词关卡更充裕）
  maxTime: 35,              // 基础满时间
  timerInterval: null,      // 定时器句柄
  comboCount: 0,            // 当前连击数
  lastMatchTime: 0,         // 上一次配对成功的时间戳
  isFever: false,           // 是否处于 Fever 狂暴状态
  isGameOver: false,        // 是否超时失败
  isPaused: false,          // 是否暂停计时（点击返回二次确认弹窗等）

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
      // 若当前关卡所有卡片都已配对完成，暂停倒计时，避免在通关结算弹窗停留时扣时间
      const isAllMatched = state.board && state.board.length > 0 && state.board.every((tile) => tile.matched);
      if (isAllMatched) return;

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
      state.timeLeft = Math.min(state.timeLeft + addedTime, 75); // 最多累积到 75s
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

      // 🌟 检测本关是否已全部消除完成并记录通关数据到 ge_level_record
      const isLevelClear = state.board.length > 0 && state.board.every((tile) => tile.matched);
      if (isLevelClear) {
        const currentLevel = state.allLevels[state.levelIndex] || { number: state.levelIndex + 1 };
        const dictName = (state.selectedDictionary && (state.selectedDictionary.dictName || state.selectedDictionary.fileName))
          ? state.selectedDictionary.fileName.replace('.json', '')
          : 'PEP_SL_XiaoXue5_1_t';

        saveLevelRecordToCloud(dictName, currentLevel.number, state.score, state.timeLeft);
      }

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
  applyDictionaryOption,
  CATEGORY_META,
  DICT_OPTIONS,
};