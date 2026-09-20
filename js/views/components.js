function drawRoundedRect(ctx, x, y, width, height, radius, fill, stroke, strokeWidth = 2) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }
}

function drawText(ctx, text, x, y, size, color, align = 'center', bold = false) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = color;
  ctx.font = `${bold ? 'bold ' : ''}${size}px sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawBackground(ctx, width, height, bgImage, bgImageLoaded) {
  if (bgImageLoaded && bgImage) {
    const imgWidth = bgImage.width;
    const imgHeight = bgImage.height;
    
    // 计算 Cover 铺满比例
    const scale = Math.max(width / imgWidth, height / imgHeight);
    const nw = imgWidth * scale;
    const nh = imgHeight * scale;
    const nx = (width - nw) / 2;
    const ny = (height - nh) / 2;

    ctx.drawImage(bgImage, nx, ny, nw, nh);

    // 叠加薄纱层，增强前台文字与卡片反差
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = '#f4f7ff';
    ctx.fillRect(0, 0, width, height);
  }
}

// 1. 创建爆炸粒子特效
function createExplosion(state, x, y, color = '#ff9800') {
  if (!state.particles) state.particles = [];
  const count = 24; // 粒子数量
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
    const speed = Math.random() * 4 + 2;
    state.particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: Math.random() * 4 + 3,
      alpha: 1,
      color: color,
      decay: Math.random() * 0.03 + 0.02
    });
  }
}

// 2. 更新并绘制所有粒子
function updateAndDrawParticles(ctx, state) {
  if (!state.particles || state.particles.length === 0) return;

  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;

    if (p.alpha <= 0) {
      state.particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.restore();
  }
}

module.exports = {
  drawRoundedRect,
  drawText,
  drawBackground,
  createExplosion,
  updateAndDrawParticles
};