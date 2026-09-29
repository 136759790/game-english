let cloud = null;
let initPromise = null;

// 云环境配置（可通过 wx.setStorageSync('CLOUD_ENV_ID', 'your-env-id') 覆盖）
function getCloudConfig() {
  let resourceAppid = 'wx1ba1ac66347135d6';
  let resourceEnv = 'cloud1-d8g211tvdcd31f789';

  try {
    if (typeof wx !== 'undefined' && wx.getStorageSync) {
      const savedEnv = wx.getStorageSync('CLOUD_ENV_ID');
      if (savedEnv && String(savedEnv).trim()) {
        resourceEnv = String(savedEnv).trim();
      }
      
      const savedAppid = wx.getStorageSync('CLOUD_RESOURCE_APPID');
      if (savedAppid && String(savedAppid).trim()) {
        resourceAppid = String(savedAppid).trim();
      }
    }
  } catch (err) {
    console.warn('[跨账号 Cloud] 读取配置失败:', err);
  }

  return { resourceAppid, resourceEnv };
}

// 异步初始化跨账号 Cloud 实例
async function initCloud() {
  if (initPromise) return initPromise;
  
  if (typeof wx === 'undefined' || !wx.cloud || typeof wx.cloud.Cloud !== 'function') {
    console.warn('[跨账号 Cloud] wx.cloud.Cloud 不可用');
    return Promise.resolve(null);
  }

  const config = getCloudConfig();
  console.log('[跨账号 Cloud] 初始化配置:', config);

  initPromise = new Promise((resolve) => {
    try {
      cloud = new wx.cloud.Cloud({
        resourceAppid: config.resourceAppid,
        resourceEnv: config.resourceEnv,
      });
      
      cloud.init().then(() => {
        console.log('[跨账号 Cloud] 实例初始化成功, env:', config.resourceEnv);
        resolve(cloud);
      }).catch((err) => {
        console.warn('[跨账号 Cloud] 初始化失败:', err);
        cloud = null;
        resolve(null);
      });
    } catch (err) {
      console.warn('[跨账号 Cloud] 实例创建失败:', err);
      cloud = null;
      resolve(null);
    }
  });

  return initPromise;
}

// 获取当前 cloud 实例（可能为 null）
function getCloud() {
  return cloud;
}

module.exports = { getCloud, initCloud };