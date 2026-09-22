const { drawRoundedRect, drawText, drawBackground, updateAndDrawParticles } = require('./components');

function renderGameScreen(ctx, width, height, state, CATEGORY_META) {
  ctx.clearRect(0, 0, width, height);

  // 1. 背景绘制
  drawBackground(ctx, width, height, state.bgImage, state.bgImageLoaded);

  // 🌟 如果处于 Fever 狂暴模式，绘制全屏金色呼吸光晕
  if (state.isFever) {
    ctx.save();
    ctx.strokeStyle = `rgba(255, 235, 59, ${0.4 + Math.sin(Date.now() / 150) * 0.3})`;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    ctx.restore();
  }

  const level = state.allLevels[state.levelIndex];
  const totalInCategory = CATEGORY_META.find((item) => item.name === level.category)?.totalLevels || 20;

  // 2. 顶部信息栏：避开微信胶囊按钮
  const topBarY = 115;
  const settingsBtnWidth = 58;
  const settingsBtnHeight = 30;
  const settingsBtnX = 14;
  const settingsBtnY = topBarY - 3;
  const settingsPanelW = 120;
  const settingsPanelH = 84;

  drawRoundedRect(ctx, settingsBtnX, settingsBtnY, settingsBtnWidth, settingsBtnHeight, 12, '#fff3e0', '#ffb74d', 1.8);
  drawText(ctx, '⚙ 设置', settingsBtnX + settingsBtnWidth / 2, settingsBtnY + settingsBtnHeight / 2 + 1, 12, '#e65100', 'center', true);
  state.buttonBounds.settings = { x: settingsBtnX, y: settingsBtnY, width: settingsBtnWidth, height: settingsBtnHeight };

  const titleBarX = settingsBtnX + settingsBtnWidth + 10;
  const titleBarWidth = width - titleBarX - 88;
  drawRoundedRect(ctx, titleBarX, topBarY - 10, titleBarWidth, 40, 14, 'rgba(255, 255, 255, 0.95)', '#ffe0b2', 1.5);
  drawText(ctx, `${level.category} • 第 ${level.number}/${totalInCategory} 关`, titleBarX + 12, topBarY + 12, 13, '#e65100', 'left', true);

  // 重置按钮
  const restartBtnWidth = 56;
  const restartBtnHeight = 26;
  const restartBtnX = width - restartBtnWidth - 18;
  const restartBtnY = topBarY - 1;
  drawRoundedRect(ctx, restartBtnX, restartBtnY, restartBtnWidth, restartBtnHeight, 12, '#fff3e0', '#ff9800', 1.5);
  drawText(ctx, '重置', restartBtnX + restartBtnWidth / 2, restartBtnY + restartBtnHeight / 2, 12, '#e65100', 'center', true);
  state.buttonBounds.restart = { x: restartBtnX, y: restartBtnY, width: restartBtnWidth, height: restartBtnHeight };

  if (state.settingsOpen) {
    const menuX = settingsBtnX;
    const menuY = settingsBtnY + settingsBtnHeight + 6;
    drawRoundedRect(ctx, menuX, menuY, settingsPanelW, settingsPanelH, 14, 'rgba(255,255,255,0.98)', '#ffd180', 1.5);

    const muteLabel = state.muted ? '🔊 开音' : '🔇 静音';
    const muteBtnX = menuX + 10;
    const muteBtnY = menuY + 12;
    const itemW = settingsPanelW - 20;
    const itemH = 26;
    drawRoundedRect(ctx, muteBtnX, muteBtnY, itemW, itemH, 10, '#fff3e0', '#ffb74d', 1.4);
    drawText(ctx, muteLabel, muteBtnX + itemW / 2, muteBtnY + itemH / 2 + 1, 12, '#e65100', 'center', true);
    state.buttonBounds.settingsMute = { x: muteBtnX, y: muteBtnY, width: itemW, height: itemH };

    const exitBtnX = menuX + 10;
    const exitBtnY = menuY + 46;
    drawRoundedRect(ctx, exitBtnX, exitBtnY, itemW, itemH, 10, '#fff8e1', '#ffcc80', 1.4);
    drawText(ctx, '↩ 返回首页', exitBtnX + itemW / 2, exitBtnY + itemH / 2 + 1, 12, '#5d4037', 'center', true);
    state.buttonBounds.settingsExit = { x: exitBtnX, y: exitBtnY, width: itemW, height: itemH };
  } else {
    state.buttonBounds.settingsMute = null;
    state.buttonBounds.settingsExit = null;
  }

  // 3. 倒计时 & 得分 Dashboard 仪表盘
  const dashY = topBarY + 38;
  drawText(ctx, `得分: ${state.score}`, 24, dashY, 15, '#d84315', 'left', true);

  if (state.isFever) {
    drawText(ctx, `🔥 FEVER狂暴 (双倍积分)`, width - 24, dashY, 13, '#d50000', 'right', true);
  } else if (state.comboCount > 1) {
    drawText(ctx, `Combo x${state.comboCount}`, width - 24, dashY, 14, '#ff6d00', 'right', true);
  }

  // 倒计时进度条
  const progressY = dashY + 10;
  const progressW = width - 48;
  const progressH = 8;
  drawRoundedRect(ctx, 24, progressY, progressW, progressH, 4, '#e0e0e0', null, 0);

  const timeRatio = Math.min(Math.max(state.timeLeft / 60, 0), 1);
  const barGrad = ctx.createLinearGradient(24, 0, 24 + progressW * timeRatio, 0);
  if (state.timeLeft <= 5) {
    barGrad.addColorStop(0, '#ff5252');
    barGrad.addColorStop(1, '#ff1744');
  } else {
    barGrad.addColorStop(0, '#ffb74d');
    barGrad.addColorStop(1, '#f57c00');
  }

  if (timeRatio > 0) {
    drawRoundedRect(ctx, 24, progressY, progressW * timeRatio, progressH, 4, barGrad, null, 0);
  }
  drawText(ctx, `⏱️ ${state.timeLeft}s`, width / 2, progressY + 14, 12, state.timeLeft <= 5 ? '#d50000' : '#5d4037', 'center', true);

  // 🌟 4. 棋盘绘制：放大卡片尺寸
  const bottomBarHeight = 60;
  const startY = progressY + 22; // 缩减上方留白，增大卡片区域
  const gap = 10; // 稍微加大卡片间距，增强点击舒适度
  const cols = 3;
  const panelX = 12;
  const panelPadding = 10;
  const panelWidth = width - panelX * 2;
  const tileWidth = (panelWidth - panelPadding * 2 - gap * (cols - 1)) / cols;

  const boardRows = Math.ceil(state.board.length / cols) || 4;
  const availableHeight = height - startY - bottomBarHeight - 16;

  // 🌟 放大卡片：解除 72px 限制，允许卡片根据屏幕高度自适应拉大（最大支持 110px）
  let tileHeight = Math.floor((availableHeight - panelPadding * 2 - gap * (boardRows - 1)) / boardRows);
  tileHeight = Math.min(Math.max(tileHeight, 60), 110); 

  const panelY = startY;
  const panelHeight = boardRows * tileHeight + (boardRows - 1) * gap + panelPadding * 2;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 18, 'rgba(255, 255, 255, 0.92)', 'rgba(255, 183, 77, 0.4)', 2);
  ctx.restore();

  // 卡片矩阵
  state.tilePositions = [];
  let shakeOffsetX = 0;
  if (state.shakeIndices.length > 0) {
    const elapsed = Date.now() - state.shakeStartTime;
    shakeOffsetX = Math.sin(elapsed / 25) * 7;
  }

  state.board.forEach((tile, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    let x = panelX + panelPadding + col * (tileWidth + gap);
    const y = startY + panelPadding + row * (tileHeight + gap);

    state.tilePositions.push({ x, y, width: tileWidth, height: tileHeight });

    if (tile.matched) return;

    const isShaking = state.shakeIndices.includes(index);
    if (isShaking) x += shakeOffsetX;

    const selected = state.selected.includes(index);

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
      if (isShaking) {
        cardGrad.addColorStop(0, '#ff8a80');
        cardGrad.addColorStop(1, '#ff5252');
        borderColor = '#d50000';
        textColor = '#ffffff';
      } else {
        cardGrad.addColorStop(0, '#ffe082');
        cardGrad.addColorStop(1, '#ffb300');
        borderColor = '#f57c00';
        textColor = '#ffffff';
      }
    }

    ctx.save();
    if (selected) {
      ctx.shadowColor = isShaking ? 'rgba(255, 82, 82, 0.6)' : 'rgba(255, 152, 0, 0.6)';
      ctx.shadowBlur = 10;
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.04)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 1;
    }

    drawRoundedRect(ctx, x, y, tileWidth, tileHeight, 12, cardGrad, borderColor, selected ? 2.5 : 1.2);
    ctx.restore();

    // 🌟 配合变大的卡片，放大字体尺寸
    let fontSize = 16;
    if (tile.text.length > 8) fontSize = 12;
    else if (tile.text.length > 5) fontSize = 14;

    drawText(ctx, tile.text, x + tileWidth / 2, y + tileHeight / 2, fontSize, textColor, 'center', true);
  });

  // 5. 渲染动态粒子/浮动文字
  if (updateAndDrawParticles) {
    updateAndDrawParticles(ctx, state);
  }

  // 6. 底部广告工具栏
  const menuY = height - bottomBarHeight + 6;
  const btnW = (width - 48) / 2;
  const btnH = 40;

  const hintX = 16;
  drawRoundedRect(ctx, hintX, menuY, btnW, btnH, 20, '#ffffff', '#ffb74d', 1.5);
  drawText(ctx, '💡 提示 (看广告)', hintX + btnW / 2, menuY + btnH / 2, 13, '#e65100', 'center', true);
  state.buttonBounds.hint = { x: hintX, y: menuY, width: btnW, height: btnH };

  const refreshX = width - 16 - btnW;
  drawRoundedRect(ctx, refreshX, menuY, btnW, btnH, 20, '#ffffff', '#ffb74d', 1.5);
  drawText(ctx, '🔄 刷新 (看广告)', refreshX + btnW / 2, menuY + btnH / 2, 13, '#e65100', 'center', true);
  state.buttonBounds.refresh = { x: refreshX, y: menuY, width: btnW, height: btnH };

  // 7. 结算逻辑
  if (state.isGameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, width, height);

    const dialogW = 240;
    const dialogH = 160;
    const dialogX = (width - dialogW) / 2;
    const dialogY = (height - dialogH) / 2;

    drawRoundedRect(ctx, dialogX, dialogY, dialogW, dialogH, 16, '#ffffff', '#ffab91', 2);
    drawText(ctx, '⌛ 时间耗尽', width / 2, dialogY + 35, 20, '#d84315', 'center', true);
    drawText(ctx, `最终得分: ${state.score}`, width / 2, dialogY + 70, 15, '#5d4037', 'center', true);

    const retryBtnW = 120;
    const retryBtnH = 36;
    const retryBtnX = (width - retryBtnW) / 2;
    const retryBtnY = dialogY + 105;
    drawRoundedRect(ctx, retryBtnX, retryBtnY, retryBtnW, retryBtnH, 18, '#ff9800', '#f57c00', 1);
    drawText(ctx, '再试一次', width / 2, retryBtnY + retryBtnH / 2, 14, '#ffffff', 'center', true);

    state.buttonBounds.next = { x: retryBtnX, y: retryBtnY, width: retryBtnW, height: retryBtnH };

  } else {
    const isAllMatched = state.board.length > 0 && state.board.every((tile) => tile.matched);
    if (isAllMatched) {
      const nextBtnWidth = 160;
      const nextBtnHeight = 48;
      const nextBtnX = (width - nextBtnWidth) / 2;
      const nextBtnY = height / 2 - 24;

      const isAllClear = state.levelIndex >= state.allLevels.length - 1;
      const btnText = isAllClear ? '🎉 全部通关' : '进入下一关 ➔';

      const nextGrad = ctx.createLinearGradient(nextBtnX, nextBtnY, nextBtnX, nextBtnY + nextBtnHeight);
      nextGrad.addColorStop(0, '#66bb6a');
      nextGrad.addColorStop(1, '#43a047');

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 12;
      drawRoundedRect(ctx, nextBtnX, nextBtnY, nextBtnWidth, nextBtnHeight, 24, nextGrad, '#2e7d32', 2);
      ctx.restore();

      drawText(ctx, btnText, width / 2, nextBtnY + nextBtnHeight / 2, 17, '#ffffff', 'center', true);

      state.buttonBounds.next = { x: nextBtnX, y: nextBtnY, width: nextBtnWidth, height: nextBtnHeight };
    } else {
      state.buttonBounds.next = null;
    }
  }
}

module.exports = { renderGameScreen };