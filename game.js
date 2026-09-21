const { state, initUserName, resetCurrentLevel, setMessage, handleTileClick, CATEGORY_META } = require('./js/state');
const { saveLevelProgressToCloud } = require('./js/services/cloudService');
const { renderHomeScreen } = require('./js/views/renderHome');
const { renderGameScreen } = require('./js/views/renderGame');
const soundManager = require('./js/services/audio');

// 全局游戏渲染循环（驱动粒子爆炸动画、狂暴光晕、浮动字与卡片晃动）
function gameLoop() {
  if (!state.ctx) return;

  if (state.screen === 'home') {
    renderHomeScreen(state.ctx, state.width, state.height, state, CATEGORY_META);
  } else if (state.screen === 'game') {
    renderGameScreen(state.ctx, state.width, state.height, state, CATEGORY_META);
  }

  // 只要处于游戏模式或包含未绘制完的动态特效，持续请求重绘
  if (state.screen === 'game' || (state.particles && state.particles.length > 0) || (state.floatTexts && state.floatTexts.length > 0)) {
    requestAnimationFrame(gameLoop);
  }
}

function startGame() {
  state.screen = 'game';
  soundManager.init(); // 初始化/唤醒 Web Audio Context
  soundManager.startBGM(); // 开启背景音乐
  resetCurrentLevel();
  gameLoop();
}

async function goToNextLevelAction() {
  if (state.isGameOver) {
    // 失败重试本关
    resetCurrentLevel();
    gameLoop();
    return;
  }

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

  // 第一次点击激活移动设备 AudioContext 音频播放限制
  soundManager.init();

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
    const settingsBtn = state.buttonBounds.settings;
    if (settingsBtn && x >= settingsBtn.x && x <= settingsBtn.x + settingsBtn.width && y >= settingsBtn.y && y <= settingsBtn.y + settingsBtn.height) {
      state.settingsOpen = !state.settingsOpen;
      gameLoop();
      return;
    }

    if (state.settingsOpen) {
      const muteBtn = state.buttonBounds.settingsMute;
      if (muteBtn && x >= muteBtn.x && x <= muteBtn.x + muteBtn.width && y >= muteBtn.y && y <= muteBtn.y + muteBtn.height) {
        const nextMuted = !soundManager.isMuted();
        soundManager.setMuted(nextMuted);
        state.muted = nextMuted;
        state.settingsOpen = false;
        if (!nextMuted) {
          soundManager.startBGM();
        }
        gameLoop();
        return;
      }

      const exitBtn = state.buttonBounds.settingsExit;
      if (exitBtn && x >= exitBtn.x && x <= exitBtn.x + exitBtn.width && y >= exitBtn.y && y <= exitBtn.y + exitBtn.height) {
        state.settingsOpen = false;
        const confirmExit = () => {
          state.screen = 'home';
          if (state.timerInterval) {
            clearInterval(state.timerInterval);
            state.timerInterval = null;
          }
          soundManager.stopBGM();
          state.isGameOver = false;
          state.selected = [];
          state.shakeIndices = [];
          gameLoop();
        };

        if (typeof wx !== 'undefined' && wx.showModal) {
          wx.showModal({
            title: '确认退出',
            content: '退出后会返回首页，当前进度也会清空，是否确认？',
            confirmText: '退出',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                confirmExit();
              }
            },
          });
          return;
        }

        if (typeof window !== 'undefined' && typeof window.confirm === 'function' && window.confirm('退出后会返回首页，当前进度也会清空，是否确认？')) {
          confirmExit();
        }
        return;
      }

      state.settingsOpen = false;
    }

    // 1. 下一关 / 失败重试
    const nextBtn = state.buttonBounds.next;
    if (nextBtn && x >= nextBtn.x && x <= nextBtn.x + nextBtn.width && y >= nextBtn.y && y <= nextBtn.y + nextBtn.height) {
      goToNextLevelAction();
      return;
    }

    if (state.isGameOver) return; // 游戏失败状态禁止点击棋盘与工具栏

    // 2. 顶部重置
    const restartBtn = state.buttonBounds.restart;
    if (restartBtn && x >= restartBtn.x && x <= restartBtn.x + restartBtn.width && y >= restartBtn.y && y <= restartBtn.y + restartBtn.height) {
      resetCurrentLevel();
      gameLoop();
      return;
    }

    // 3. 点击【💡 提示 (看广告)】
    const hintBtn = state.buttonBounds.hint;
    if (hintBtn && x >= hintBtn.x && x <= hintBtn.x + hintBtn.width && y >= hintBtn.y && y <= hintBtn.y + hintBtn.height) {
      setMessage('观看广告加载中...', 'success');
      return;
    }

    // 4. 点击【🔄 刷新 (看广告)】
    const refreshBtn = state.buttonBounds.refresh;
    if (refreshBtn && x >= refreshBtn.x && x <= refreshBtn.x + refreshBtn.width && y >= refreshBtn.y && y <= refreshBtn.y + refreshBtn.height) {
      setMessage('观看广告加载中...', 'success');
      return;
    }

    // 5. 点击词卡
    for (let index = 0; index < state.tilePositions.length; index += 1) {
      const pos = state.tilePositions[index];
      if (x >= pos.x && x <= pos.x + pos.width && y >= pos.y && y <= pos.y + pos.height) {
        handleTileClick(index);
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

function init() {
  if (typeof wx === 'undefined') {
    console.error('微信小游戏环境未就绪');
    return;
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

  initUserName();
  loadBackgroundImage();
  gameLoop();
}

init();