const { drawRoundedRect, drawText, drawBackground } = require('./components');

function renderHomeScreen(ctx, width, height, state, CATEGORY_META) {
  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, width, height, state.bgImage, state.bgImageLoaded);

  // 🌟 1. 调整面板宽度与顶部距离（顶部预留 115px 以上，避开微信原生胶囊按钮）
  const panelWidth = Math.min(width * 0.88, 340);
  const panelHeight = 440;
  const panelX = (width - panelWidth) / 2;
  const panelY = Math.max(height * 0.22, 115);

  // 主面板卡片
  drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 24, 'rgba(255, 255, 255, 0.94)', 'rgba(255, 183, 77, 0.5)', 2.5);

  // 🌟 2. 标题区
  const titleY = panelY + 45;
  drawText(ctx, '单词牵线', width / 2, titleY, 34, '#e65100', 'center', true);
  drawText(ctx, 'WORD LINK CHALLENGE', width / 2, titleY + 26, 11, '#fb8c00', 'center', false);

  // 玩家欢迎语
  const userName = state.userName || '微信用户';
  drawText(ctx, `👋 欢迎你，${userName}`, width / 2, titleY + 62, 15, '#5d4037', 'center', false);

  // 🌟 3. 游戏进度卡片
  const currentLevel = state.allLevels[state.levelIndex] || state.allLevels[0];
  const totalInCategory = Math.max(20, (state.allLevels && state.allLevels.length) || 20);

  const infoBoxX = panelX + 20;
  const infoBoxY = titleY + 84;
  const infoBoxW = panelWidth - 40;
  const infoBoxH = 46;

  drawRoundedRect(ctx, infoBoxX, infoBoxY, infoBoxW, infoBoxH, 14, '#fff3e0', '#ffe0b2', 1.5);
  drawText(ctx, `🏆 当前进度：第 ${currentLevel.number} / ${totalInCategory} 关`, infoBoxX + infoBoxW / 2, infoBoxY + infoBoxH / 2 + 1, 14, '#e65100', 'center', true);

  // 🌟 4. 词库选择入口卡片（独立出来，操作更清晰）
  const currentBook = state.selectedDictionary && state.selectedDictionary.label ? state.selectedDictionary.label : '一年级上';
  const switchBtnW = infoBoxW;
  const switchBtnH = 42;
  const switchBtnX = infoBoxX;
  const switchBtnY = infoBoxY + infoBoxH + 12;

  drawRoundedRect(ctx, switchBtnX, switchBtnY, switchBtnW, switchBtnH, 14, '#fff8e1', '#ffcc80', 1.5);
  drawText(ctx, `📚 当前词库：${currentBook}`, switchBtnX + 16, switchBtnY + switchBtnH / 2 + 1, 13, '#5d4037', 'left', true);
  drawText(ctx, '切换 ➔', switchBtnX + switchBtnW - 16, switchBtnY + switchBtnH / 2 + 1, 13, '#f57c00', 'right', true);
  
  state.buttonBounds.homeSwitch = { x: switchBtnX, y: switchBtnY, width: switchBtnW, height: switchBtnH };

  // 🌟 5. 限时挑战与加时规则说明（让玩家提前了解倒计时机制）
  const tipBoxX = switchBtnX;
  const tipBoxY = switchBtnY + switchBtnH + 12;
  const tipBoxW = switchBtnW;
  const tipBoxH = 46;
  drawRoundedRect(ctx, tipBoxX, tipBoxY, tipBoxW, tipBoxH, 12, '#f9fbe7', '#dce775', 1.2);
  drawText(ctx, '⏱️ 挑战机制：初始 30 秒倒计时', tipBoxX + tipBoxW / 2, tipBoxY + 16, 11, '#33691e', 'center', true);
  drawText(ctx, '⚡ 每次成功配对 +3 秒，连击狂暴 +5 秒', tipBoxX + tipBoxW / 2, tipBoxY + 32, 10, '#558b2f', 'center', false);

  // 🌟 6. 主开始按钮（带有呼吸立体感与投影）
  const btnWidthMain = panelWidth - 48;
  const btnHeightMain = 52;
  const btnX = (width - btnWidthMain) / 2;
  const btnY = panelY + panelHeight - 74;

  const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnHeightMain);
  btnGrad.addColorStop(0, '#ffb74d');
  btnGrad.addColorStop(1, '#f57c00');

  ctx.save();
  ctx.shadowColor = 'rgba(245, 124, 0, 0.4)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  drawRoundedRect(ctx, btnX, btnY, btnWidthMain, btnHeightMain, 26, btnGrad, '#e65100', 2);
  ctx.restore();

  drawText(ctx, '开 始 牵 线', width / 2, btnY + btnHeightMain / 2 + 1, 20, '#ffffff', 'center', true);

  state.buttonBounds.start = { x: btnX, y: btnY, width: btnWidthMain, height: btnHeightMain };
}

function renderDictionaryScreen(ctx, width, height, state) {
  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, width, height, state.bgImage, state.bgImageLoaded);

  const panelWidth = Math.min(width * 0.9, 340);
  const panelHeight = Math.min(height * 0.78, 520);
  const panelX = (width - panelWidth) / 2;
  // 🌟 避免被微信右上角胶囊遮挡，Panel 下移至 115px 启动
  const panelY = 115;

  drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 22, 'rgba(255, 255, 255, 0.96)', '#ffcc80', 2);

  // 页面标题
  drawText(ctx, '选择词库', width / 2, panelY + 40, 24, '#e65100', 'center', true);

  // 返回按钮
  const backW = 68;
  const backH = 30;
  const backX = panelX + 16;
  const backY = panelY + 16;
  drawRoundedRect(ctx, backX, backY, backW, backH, 12, '#fff3e0', '#ffb74d', 1.5);
  drawText(ctx, '↩ 返回', backX + backW / 2, backY + backH / 2 + 1, 12, '#e65100', 'center', true);
  state.buttonBounds.dictionaryBack = { x: backX, y: backY, width: backW, height: backH };

  // 🌟 词库按键矩阵优化
  const columns = 3;
  const gap = 10;
  const btnW = (panelWidth - 36 - gap * (columns - 1)) / columns;
  const btnH = 40;
  const startX = panelX + 18;
  const startY = panelY + 76;

  const dictButtons = [];
  (state.dictionaryOptions || []).forEach((option, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = startX + col * (btnW + gap);
    const y = startY + row * (btnH + 10);
    const selected = state.selectedDictionary && state.selectedDictionary.key === option.key;

    let fillBg = '#fff8e1';
    let borderColor = '#ffe082';
    let textColor = '#d84315';

    if (selected) {
      fillBg = ctx.createLinearGradient(x, y, x, y + btnH);
      fillBg.addColorStop(0, '#ffe082');
      fillBg.addColorStop(1, '#ffb74d');
      borderColor = '#f57c00';
      textColor = '#ffffff';
    }

    drawRoundedRect(ctx, x, y, btnW, btnH, 12, fillBg, borderColor, selected ? 2 : 1.2);
    drawText(ctx, option.label, x + btnW / 2, y + btnH / 2 + 1, 12, textColor, 'center', true);
    dictButtons.push({ x, y, width: btnW, height: btnH, option });
  });

  state.wordBankButtons = dictButtons;
}

module.exports = { renderHomeScreen, renderDictionaryScreen };