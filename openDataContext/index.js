// 微信开放数据域入口文件
// 该目录必须存在，并包含 index.js，才能满足 game.json 中 openDataContext 配置要求。

const canvas = wx.getSharedCanvas ? wx.getSharedCanvas() : null;

if (canvas) {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

module.exports = {};
