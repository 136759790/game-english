const { drawRoundedRect, drawText, drawBackground } = require('./components');

function renderHomeScreen(ctx, width, height, state, CATEGORY_META) {
  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, width, height, state.bgImage, state.bgImageLoaded);

  // 渲染玻璃质感主卡片容器
  const panelWidth = Math.min(width * 0.88, 340);
  const panelHeight = 350;
  const panelX = (width - panelWidth) / 2;
  const panelY = height * 0.32;

  drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 22, 'rgba(255, 255, 255, 0.92)', 'rgba(255, 183, 77, 0.5)', 3);

  // 游戏标题
  const titleY = panelY + 52;
  drawText(ctx, '单词牵线', width / 2, titleY, 36, '#e65100', 'center', true);
  drawText(ctx, 'WORD LINK CHALLENGE', width / 2, titleY + 28, 12, '#fb8c00', 'center', false);

  // 用户与关卡进度信息
  const userName = state.userName;
  drawText(ctx, `👋 欢迎玩家：${userName}`, width / 2, titleY + 75, 16, '#5d4037', 'center', false);

  const currentLevel = state.allLevels[state.levelIndex];
  const totalInCategory = CATEGORY_META.find((item) => item.name === currentLevel.category)?.totalLevels || 20;

  // 进度展示框
  const progressBoxX = panelX + 24;
  const progressBoxY = titleY + 112;
  const progressBoxW = panelWidth - 48;
  drawRoundedRect(ctx, progressBoxX, progressBoxY, progressBoxW, 44, 12, '#fff3e0', '#ffe0b2', 1.5);

  drawText(ctx, `当前模式：${currentLevel.category} (第 ${currentLevel.number}/${totalInCategory} 关)`, width / 2, progressBoxY + 22, 15, '#e65100', 'center', true);

  // 开始游戏大按钮
  const btnWidth = panelWidth - 60;
  const btnHeight = 54;
  const btnX = (width - btnWidth) / 2;
  const btnY = panelY + panelHeight - 75;

  const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnHeight);
  btnGrad.addColorStop(0, '#ffa726');
  btnGrad.addColorStop(1, '#f57c00');

  drawRoundedRect(ctx, btnX, btnY, btnWidth, btnHeight, 27, btnGrad, '#e65100', 2);
  drawText(ctx, '开始牵线', width / 2, btnY + btnHeight / 2, 22, '#ffffff', 'center', true);

  state.buttonBounds.start = { x: btnX, y: btnY, width: btnWidth, height: btnHeight };
}

module.exports = { renderHomeScreen };