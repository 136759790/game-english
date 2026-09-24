const { drawRoundedRect, drawText, drawBackground, updateAndDrawParticles } = require('./components');

function renderGameScreen(ctx, width, height, state, CATEGORY_META) {
  ctx.clearRect(0, 0, width, height);

  // 1. 背景绘制
  drawBackground(ctx, width, height, state.bgImage, state.bgImageLoaded);

  // Fever 狂暴模式全屏金色呼吸光晕
  if (state.isFever) {
    ctx.save();
    ctx.strokeStyle = `rgba(255, 235, 59, ${0.4 + Math.sin(Date.now() / 150) * 0.3})`;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    ctx.restore();
  }

  // 倒计时濒危预警微红呼吸边框（<= 5秒）
  if (state.timeLeft <= 5 && !state.isGameOver) {
    ctx.save();
    const alertAlpha = 0.2 + Math.sin(Date.now() / 120) * 0.15;
    ctx.strokeStyle = `rgba(244, 67, 54, ${alertAlpha})`;
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, width - 6, height - 6);
    ctx.restore();
  }

  const level = state.allLevels[state.levelIndex] || { category: '单词', number: 1 };
  const totalInCategory = level.totalLevels || (state.allLevels && state.allLevels.length) || 1;

  // 🌟 2. 顶部导航栏（高度 40px，左右对齐完全填满）
  const topBarY = 105;
  const topBarHeight = 40;
  const marginX = 14; // 左右统一边距
  const btnGap = 8;    // 按钮与标题栏间距

  // 2.1 ◀ 返回按钮（最左端对齐）
  const backBtnW = 56;
  const backBtnX = marginX;
  const backBtnY = topBarY;
  drawRoundedRect(ctx, backBtnX, backBtnY, backBtnW, topBarHeight, 12, '#fff3e0', '#ffb74d', 1.8);
  drawText(ctx, '◀ 返回', backBtnX + backBtnW / 2, backBtnY + topBarHeight / 2 + 1, 12, '#e65100', 'center', true);
  state.buttonBounds.backHome = { x: backBtnX, y: backBtnY, width: backBtnW, height: topBarHeight };

  // 2.2 ⚙ 设置按钮（最右端对齐，右边不留无用空间）
  const settingsBtnWidth = 56;
  const settingsBtnX = width - marginX - settingsBtnWidth;
  const settingsBtnY = topBarY;
  const settingsPanelW = 120;
  const settingsPanelH = 84;

  drawRoundedRect(ctx, settingsBtnX, settingsBtnY, settingsBtnWidth, topBarHeight, 12, '#fff3e0', '#ffb74d', 1.8);
  drawText(ctx, '⚙ 设置', settingsBtnX + settingsBtnWidth / 2, settingsBtnY + topBarHeight / 2 + 1, 12, '#e65100', 'center', true);
  state.buttonBounds.settings = { x: settingsBtnX, y: settingsBtnY, width: settingsBtnWidth, height: topBarHeight };

  // 2.3 中间关卡标题栏（沾满两端中间的所有空间）
  const titleBarX = backBtnX + backBtnW + btnGap;
  const titleBarWidth = settingsBtnX - btnGap - titleBarX;
  drawRoundedRect(ctx, titleBarX, topBarY, titleBarWidth, topBarHeight, 14, 'rgba(255, 255, 255, 0.95)', '#ffe0b2', 1.5);
  drawText(ctx, `${level.category} • ${level.number}/${totalInCategory}关`, titleBarX + titleBarWidth / 2, topBarY + topBarHeight / 2 + 1, 12, '#e65100', 'center', true);

  // 清除重置按钮绑定
  state.buttonBounds.restart = null;

  // 下拉设置菜单面板（挂载在右侧设置按钮下方）
  if (state.settingsOpen) {
    const menuX = settingsBtnX + settingsBtnWidth - settingsPanelW;
    const menuY = settingsBtnY + topBarHeight + 6;
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

  // 🌟 3. 核心仪表盘（全新磨砂白底卡片容器，清晰突出倒计时与关键数据）
  const dashCardX = marginX;
  const dashCardW = width - marginX * 2;
  const dashCardY = topBarY + topBarHeight + 8;
  const dashCardH = 48;

  // 3.1 绘制仪表盘背景底卡
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  drawRoundedRect(ctx, dashCardX, dashCardY, dashCardW, dashCardH, 14, 'rgba(255, 255, 255, 0.95)', '#ffe0b2', 1.5);
  ctx.restore();

  const isDanger = state.timeLeft <= 5;
  const contentCenterY = dashCardY + 19;

  // 3.2 仪表盘左侧：得分
  drawText(ctx, `⭐ 得分 ${state.score}`, dashCardX + 12, contentCenterY, 13, '#e65100', 'left', true);

  // 3.3 仪表盘中间：独立高亮倒计时胶囊标签
  const pillW = 96;
  const pillH = 26;
  const pillX = (width - pillW) / 2;
  const pillY = dashCardY + 6;

  if (isDanger) {
    const pulseAlpha = 0.6 + Math.sin(Date.now() / 120) * 0.35;
    ctx.save();
    ctx.shadowColor = 'rgba(229, 57, 53, 0.5)';
    ctx.shadowBlur = 8;
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 13, `rgba(255, 235, 238, ${pulseAlpha})`, '#e53935', 1.6);
    ctx.restore();
    drawText(ctx, `⚠️ 剩 ${state.timeLeft} 秒`, width / 2, pillY + pillH / 2 + 1, 13, '#c62828', 'center', true);
  } else {
    drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 13, '#fff3e0', '#ffb74d', 1.4);
    drawText(ctx, `⏰ 剩 ${state.timeLeft} 秒`, width / 2, pillY + pillH / 2 + 1, 13, '#e65100', 'center', true);
  }

  // 3.4 仪表盘右侧：状态（FEVER / Combo / 配对加时）
  const rightX = dashCardX + dashCardW - 12;
  if (state.isFever) {
    drawText(ctx, '🔥 FEVER双倍', rightX, contentCenterY, 12, '#d50000', 'right', true);
  } else if (state.comboCount > 1) {
    drawText(ctx, `⚡ 连击 x${state.comboCount}`, rightX, contentCenterY, 12, '#ff6d00', 'right', true);
  } else {
    drawText(ctx, '配对+3秒', rightX, contentCenterY, 11, '#8d6e63', 'right', false);
  }

  // 3.5 仪表盘底部：倒计时微型进度条（卡片底沿一体化）
  const progressX = dashCardX + 10;
  const progressY = dashCardY + dashCardH - 7;
  const progressW = dashCardW - 20;
  const progressH = 4;
  drawRoundedRect(ctx, progressX, progressY, progressW, progressH, 2, '#f0f0f0', null, 0);

  const timeRatio = Math.min(Math.max(state.timeLeft / 60, 0), 1);
  if (timeRatio > 0) {
    const barGrad = ctx.createLinearGradient(progressX, 0, progressX + progressW * timeRatio, 0);
    if (isDanger) {
      barGrad.addColorStop(0, '#ff5252');
      barGrad.addColorStop(1, '#ff1744');
    } else {
      barGrad.addColorStop(0, '#ffb74d');
      barGrad.addColorStop(1, '#f57c00');
    }
    drawRoundedRect(ctx, progressX, progressY, progressW * timeRatio, progressH, 2, barGrad, null, 0);
  }

  // 4. 棋盘绘制（小尺寸精致卡片）
  const bottomBarHeight = 60;
  const startY = dashCardY + dashCardH + 8;
  const gap = 6;
  const cols = 4;
  const panelX = 14;
  const panelPadding = 5;
  const panelWidth = width - panelX * 2;
  const tileWidth = (panelWidth - panelPadding * 2 - gap * (cols - 1)) / cols;

  const boardRows = Math.ceil(state.board.length / cols) || 4;
  const availableHeight = height - startY - bottomBarHeight - 16;

  let tileHeight = Math.floor((availableHeight - panelPadding * 2 - gap * (boardRows - 1)) / boardRows);
  tileHeight = Math.min(Math.max(tileHeight, 42), 60); 

  const panelY = startY;
  const panelHeight = boardRows * tileHeight + (boardRows - 1) * gap + panelPadding * 2;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 16, 'rgba(255, 255, 255, 0.94)', 'rgba(255, 183, 77, 0.4)', 1.8);
  ctx.restore();

  // 卡片矩阵
  state.tilePositions = [];
  let shakeOffsetX = 0;
  if (state.shakeIndices.length > 0) {
    const elapsed = Date.now() - state.shakeStartTime;
    shakeOffsetX = Math.sin(elapsed / 25) * 6;
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
      ctx.shadowColor = isShaking ? 'rgba(255, 82, 82, 0.5)' : 'rgba(255, 152, 0, 0.5)';
      ctx.shadowBlur = 8;
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.03)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 1;
    }

    drawRoundedRect(ctx, x, y, tileWidth, tileHeight, 10, cardGrad, borderColor, selected ? 2 : 1.2);
    ctx.restore();

    let fontSize = 12;
    if (tile.text.length > 8) fontSize = 10;
    else if (tile.text.length > 5) fontSize = 11;

    drawText(ctx, tile.text, x + tileWidth / 2, y + tileHeight / 2, fontSize, textColor, 'center', true);
  });

  // 5. 粒子效果
  if (updateAndDrawParticles) {
    updateAndDrawParticles(ctx, state);
  }

  // 6. 底部工具栏
  const menuY = height - bottomBarHeight + 6;
  const btnW = (width - 40) / 2;
  const btnH = 40;

  const hintX = 14;
  drawRoundedRect(ctx, hintX, menuY, btnW, btnH, 20, '#ffffff', '#ffb74d', 1.5);
  drawText(ctx, '💡 提示 (看广告)', hintX + btnW / 2, menuY + btnH / 2, 12, '#e65100', 'center', true);
  state.buttonBounds.hint = { x: hintX, y: menuY, width: btnW, height: btnH };

  const refreshX = width - 14 - btnW;
  drawRoundedRect(ctx, refreshX, menuY, btnW, btnH, 20, '#ffffff', '#ffb74d', 1.5);
  drawText(ctx, '🔄 刷新 (看广告)', refreshX + btnW / 2, menuY + btnH / 2, 12, '#e65100', 'center', true);
  state.buttonBounds.refresh = { x: refreshX, y: menuY, width: btnW, height: btnH };

  // 7. 结算弹窗（失败结算 OR 通关结算）
  if (state.isGameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, width, height);

    const dialogW = 250;
    const dialogH = 175;
    const dialogX = (width - dialogW) / 2;
    const dialogY = (height - dialogH) / 2;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    drawRoundedRect(ctx, dialogX, dialogY, dialogW, dialogH, 18, '#ffffff', '#ffab91', 2);
    ctx.restore();

    drawText(ctx, '⌛ 时间耗尽', width / 2, dialogY + 34, 20, '#d84315', 'center', true);
    drawText(ctx, '倒计时已归零，别灰心！', width / 2, dialogY + 64, 12, '#8d6e63', 'center', false);
    drawText(ctx, `本局得分: ${state.score} 分`, width / 2, dialogY + 92, 16, '#e65100', 'center', true);

    const retryBtnW = 130;
    const retryBtnH = 38;
    const retryBtnX = (width - retryBtnW) / 2;
    const retryBtnY = dialogY + 120;
    drawRoundedRect(ctx, retryBtnX, retryBtnY, retryBtnW, retryBtnH, 19, '#ff9800', '#f57c00', 1);
    drawText(ctx, '再试一次 ↺', width / 2, retryBtnY + retryBtnH / 2 + 1, 14, '#ffffff', 'center', true);

    state.buttonBounds.next = { x: retryBtnX, y: retryBtnY, width: retryBtnW, height: retryBtnH };

  } else {
    const isAllMatched = state.board.length > 0 && state.board.every((tile) => tile.matched);
    if (isAllMatched) {
      // 半透明背景遮罩
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, 0, width, height);

      const winCardW = Math.min(width * 0.82, 280);
      const winCardH = 185;
      const winCardX = (width - winCardW) / 2;
      const winCardY = (height - winCardH) / 2 - 15;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;
      drawRoundedRect(ctx, winCardX, winCardY, winCardW, winCardH, 20, '#ffffff', '#81c784', 2.5);
      ctx.restore();

      const isAllClear = state.levelIndex >= state.allLevels.length - 1;
      const titleText = isAllClear ? '🏆 恭喜全部通关！' : '🎉 本关通关！';
      drawText(ctx, titleText, width / 2, winCardY + 36, 20, '#2e7d32', 'center', true);

      // 重点展示玩家本关通关时还剩几秒与得分
      drawText(ctx, `⏱️ 剩余时间: ${state.timeLeft} 秒`, width / 2, winCardY + 70, 15, '#2e7d32', 'center', true);
      drawText(ctx, `本关得分: ${state.score} 分`, width / 2, winCardY + 96, 14, '#e65100', 'center', true);

      const nextBtnWidth = 150;
      const nextBtnHeight = 42;
      const nextBtnX = (width - nextBtnWidth) / 2;
      const nextBtnY = winCardY + winCardH - 56;

      const btnText = isAllClear ? '重头再战 ↺' : '进入下一关 ➔';
      const nextGrad = ctx.createLinearGradient(nextBtnX, nextBtnY, nextBtnX, nextBtnY + nextBtnHeight);
      nextGrad.addColorStop(0, '#66bb6a');
      nextGrad.addColorStop(1, '#43a047');

      drawRoundedRect(ctx, nextBtnX, nextBtnY, nextBtnWidth, nextBtnHeight, 21, nextGrad, '#2e7d32', 1.5);
      drawText(ctx, btnText, width / 2, nextBtnY + nextBtnHeight / 2 + 1, 15, '#ffffff', 'center', true);

      state.buttonBounds.next = { x: nextBtnX, y: nextBtnY, width: nextBtnWidth, height: nextBtnHeight };
    } else {
      state.buttonBounds.next = null;
    }
  }
}

module.exports = { renderGameScreen };