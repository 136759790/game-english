const { drawRoundedRect, drawText, drawBackground, drawConnectingLine, updateAndDrawParticles } = require('./components');

function renderGameScreen(ctx, width, height, state, CATEGORY_META) {
  // 1. 清空画布
  ctx.clearRect(0, 0, width, height);

  // 2. 绘制背景
  drawBackground(ctx, width, height, state.bgImage, state.bgImageLoaded);

  const level = state.allLevels[state.levelIndex];
  const totalInCategory = CATEGORY_META.find((item) => item.name === level.category)?.totalLevels || 20;

  // 3. 顶部导航栏
  const topBarY = 54;
  drawRoundedRect(ctx, 12, topBarY - 10, width - 24, 44, 14, 'rgba(255, 255, 255, 0.95)', '#ffe0b2', 1.5);
  drawText(ctx, `${level.category} • 第 ${level.number}/${totalInCategory} 关`, 24, topBarY + 12, 15, '#e65100', 'left', true);

  // 顶部重置按钮
  const restartBtnWidth = 64;
  const restartBtnHeight = 28;
  const restartBtnX = width - restartBtnWidth - 20;
  const restartBtnY = topBarY - 2;
  drawRoundedRect(ctx, restartBtnX, restartBtnY, restartBtnWidth, restartBtnHeight, 12, '#fff3e0', '#ff9800', 1.5);
  drawText(ctx, '重置', restartBtnX + restartBtnWidth / 2, restartBtnY + restartBtnHeight / 2, 12, '#e65100', 'center', true);
  state.buttonBounds.restart = { x: restartBtnX, y: restartBtnY, width: restartBtnWidth, height: restartBtnHeight };

  // 🌟 4. 棋盘区域大幅扩容（向上提升、向下填满，留出底部菜单栏）
  const bottomBarHeight = 66; // 留出底部菜单栏高度
  const startY = 100; // 提升起始坐标
  const gap = 8;
  const cols = 3;
  const panelX = 10;
  const panelPadding = 8;
  const panelWidth = width - panelX * 2;
  const tileWidth = (panelWidth - panelPadding * 2 - gap * (cols - 1)) / cols;

  const boardRows = Math.ceil(state.board.length / cols) || 4;
  const availableHeight = height - startY - bottomBarHeight - 12;

  // 动态根据可占据空间分配卡片高度，最大化填满区域
  let tileHeight = Math.floor((availableHeight - panelPadding * 2 - gap * (boardRows - 1)) / boardRows);
  tileHeight = Math.min(Math.max(tileHeight, 48), 75); // 控制合理的卡片高比

  const panelY = startY;
  const panelHeight = boardRows * tileHeight + (boardRows - 1) * gap + panelPadding * 2;

  // 绘制白色磨砂背景
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 18, 'rgba(255, 255, 255, 0.92)', 'rgba(255, 183, 77, 0.4)', 2);
  ctx.restore();

  // 🌟 5. 绘制卡片矩阵
  state.tilePositions = [];

  // 计算晃动动画平移量 (正弦高频左右平移)
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

    // 🌟 如果卡片已被消除，直接跳过绘制（保留逻辑位置与占位，绝不影响其他词卡位置）
    if (tile.matched) return;

    // 配对错误选中的两张卡片添加晃动效果
    const isShaking = state.shakeIndices.includes(index);
    if (isShaking) {
      x += shakeOffsetX;
    }

    const selected = state.selected.includes(index);

    // 配色逻辑
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
        // 错误晃动高亮红橙色
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

    // 绘制卡片框
    ctx.save();
    if (selected) {
      ctx.shadowColor = isShaking ? 'rgba(255, 82, 82, 0.6)' : 'rgba(255, 152, 0, 0.6)';
      ctx.shadowBlur = 10;
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.04)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 1;
    }

    drawRoundedRect(ctx, x, y, tileWidth, tileHeight, 10, cardGrad, borderColor, selected ? 2.5 : 1.2);
    ctx.restore();

    // 长单词动态适配字号
    let fontSize = 13;
    if (tile.text.length > 8) fontSize = 11;
    else if (tile.text.length > 5) fontSize = 12;

    drawText(ctx, tile.text, x + tileWidth / 2, y + tileHeight / 2, fontSize, textColor, 'center', true);
  });

  // 🌟 6. 渲染爆炸粒子特效
  if (updateAndDrawParticles) {
    updateAndDrawParticles(ctx, state);
  }

  // 🌟 7. 绘制底部看广告菜单栏 (提示 / 刷新)
  const menuY = height - bottomBarHeight + 8;
  const btnW = (width - 48) / 2;
  const btnH = 42;

  // 按钮 1：提示
  const hintX = 16;
  drawRoundedRect(ctx, hintX, menuY, btnW, btnH, 21, '#ffffff', '#ffb74d', 1.5);
  drawText(ctx, '💡 提示 (看广告)', hintX + btnW / 2, menuY + btnH / 2, 13, '#e65100', 'center', true);
  state.buttonBounds.hint = { x: hintX, y: menuY, width: btnW, height: btnH };

  // 按钮 2：刷新
  const refreshX = width - 16 - btnW;
  drawRoundedRect(ctx, refreshX, menuY, btnW, btnH, 21, '#ffffff', '#ffb74d', 1.5);
  drawText(ctx, '🔄 刷新 (看广告)', refreshX + btnW / 2, menuY + btnH / 2, 13, '#e65100', 'center', true);
  state.buttonBounds.refresh = { x: refreshX, y: menuY, width: btnW, height: btnH };

  // 🌟 8. 通关检测：当所有卡片均被匹配消除时弹出下一关按钮
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

module.exports = { renderGameScreen };