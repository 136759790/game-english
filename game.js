const { state, initUserName, resetCurrentLevel, setMessage, handleTileClick, CATEGORY_META } = require('./js/state');
const { saveLevelProgressToCloud } = require('./js/services/cloudService');
const { renderHomeScreen } = require('./js/views/renderHome');
const { renderGameScreen } = require('./js/views/renderGame');

// 🌟 1. 全局游戏渲染循环（驱动粒子爆炸动画与卡片晃动动画）
function gameLoop() {
  if (!state.ctx) return;

  if (state.screen === 'home') {
    renderHomeScreen(state.ctx, state.width, state.height, state, CATEGORY_META);
  } else if (state.screen === 'game') {
    renderGameScreen(state.ctx, state.width, state.height, state, CATEGORY_META);
  }

  // 只要处于游戏界面，或存在动态粒子/晃动，持续更新渲染[cite: 14]
  if (state.screen === 'game' || (state.particles && state.particles.length > 0)) {
    requestAnimationFrame(gameLoop);
  }
}

function startGame() {
  state.screen = 'game';
  resetCurrentLevel();
  gameLoop();
}

async function goToNextLevelAction() {
  if (state.levelIndex < state.allLevels.length - 1) {
    state.levelIndex += 1;
  } else {
    state.levelIndex = 0;
  }
  const level = state.allLevels[state.levelIndex];
  await saveLevelProgressToCloud(state.levelIndex, level);
  resetCurrentLevel();
  gameLoop();
}

function handleTouchStart(event) {
  if (!event || !event.changedTouches) return;

  const touch = event.changedTouches[0];
  if (!touch) return;

  const x = touch.clientX || touch.x;
  const y = touch.clientY || touch.y;

  if (state.screen === 'home') {
    const startBtn = state.buttonBounds.start;
    if (startBtn && x >= startBtn.x && x <= startBtn.x + startBtn.width && y >= startBtn.y && y <= startBtn.y + startBtn.height) {
      startGame();
      return;
    }
  } else if (state.screen === 'game') {
    // 1. 重置关卡
    const restartBtn = state.buttonBounds.restart;
    if (restartBtn && x >= restartBtn.x && x <= restartBtn.x + restartBtn.width && y >= restartBtn.y && y <= restartBtn.y + restartBtn.height) {
      resetCurrentLevel();
      gameLoop();
      return;
    }

    // 2. 下一关
    const nextBtn = state.buttonBounds.next;
    if (nextBtn && x >= nextBtn.x && x <= nextBtn.x + nextBtn.width && y >= nextBtn.y && y <= nextBtn.y + nextBtn.height) {
      goToNextLevelAction();
      return;
    }

    // 3. 点击【💡 提示 (看广告)】
    const hintBtn = state.buttonBounds.hint;
    if (hintBtn && x >= hintBtn.x && x <= hintBtn.x + hintBtn.width && y >= hintBtn.y && y <= hintBtn.y + hintBtn.height) {
      console.log('触发：查看广告获得提示');
      setMessage('观看广告加载中...', 'success');
      // TODO: 接入微信激励广告接口 wx.createRewardedVideoAd()
      return;
    }

    // 4. 点击【🔄 刷新 (看广告)】
    const refreshBtn = state.buttonBounds.refresh;
    if (refreshBtn && x >= refreshBtn.x && x <= refreshBtn.x + refreshBtn.width && y >= refreshBtn.y && y <= refreshBtn.y + refreshBtn.height) {
      console.log('触发：查看广告刷新卡片位置');
      setMessage('观看广告加载中...', 'success');
      // TODO: 接入微信激励广告接口 wx.createRewardedVideoAd()
      return;
    }

    // 5. 点击词卡
    for (let index = 0; index < state.tilePositions.length; index += 1) {
      const pos = state.tilePositions[index];
      if (x >= pos.x && x <= pos.x + pos.width && y >= pos.y && y <= pos.y + pos.height) {
        handleTileClick(index); // 处理选牌与晃动判断[cite: 14]
        gameLoop();
        return;
      }
    }
  }
}

function loadBackgroundImage() {
  state.bgImage = wx.createImage();
  state.bgImage.onload = () => {
    state.bgImageLoaded = true;
    gameLoop();
  };
  state.bgImage.onerror = (err) => {
    console.warn('背景图加载失败，使用默认背景色', err);
    state.bgImageLoaded = false;
  };
  state.bgImage.src = 'assets/images/bg.jpg';
}

function getSystemInfo() {
  try {
    if (typeof wx.getSystemInfoSync === 'function') {
      return wx.getSystemInfoSync();
    }
  } catch (err) {
    console.warn('getSystemInfoSync 尚未就绪，使用默认尺寸', err.message);
  }
  return { windowWidth: 375, windowHeight: 667 };
}

async function init() {
  if (typeof wx === 'undefined') {
    console.error('微信小游戏环境未就绪');
    return;
  }

  // 初始化云开发
  if (wx.cloud) {
    try {
      wx.cloud.init({
        env: 'cloud1-d8g211tvdcd31f789',
        traceUser: true,
      });
      console.log('云开发初始化成功');
    } catch (err) {
      console.warn('云初始化失败（可能已初始化）', err);
    }
  }

  state.canvas = wx.createCanvas();
  if (!state.canvas) {
    console.error('创建Canvas失败');
    return;
  }

  state.ctx = state.canvas.getContext('2d');

  const systemInfo = getSystemInfo();
  state.width = systemInfo.windowWidth || 375;
  state.height = systemInfo.windowHeight || 667;
  state.canvas.width = state.width;
  state.canvas.height = state.height;

  try {
    if (typeof state.canvas.onTouchStart === 'function') {
      state.canvas.onTouchStart(handleTouchStart);
    } else if (typeof wx.onTouchStart === 'function') {
      wx.onTouchStart(handleTouchStart);
    }
  } catch (err) {
    console.warn('绑定触摸事件失败', err.message);
  }

  // 静默登录
  await initUserName();

  loadBackgroundImage();
  gameLoop();
}

init();