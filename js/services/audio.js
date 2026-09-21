// 基于 Web Audio API 实现的轻量级纯代码音效合成器

class SoundManager {
  constructor() {
    this.ctx = null;
    this.bgmTimer = null;
    this.isPlayingBGM = false;
    this.muted = false;
    this.storageKey = 'GAME_MUTED';
    this.loadMutedState();
  }

  loadMutedState() {
    if (typeof wx !== 'undefined' && wx.getStorageSync) {
      try {
        this.muted = Boolean(wx.getStorageSync(this.storageKey));
      } catch (err) {
        this.muted = false;
      }
      return;
    }

    if (typeof localStorage !== 'undefined') {
      try {
        this.muted = Boolean(localStorage.getItem(this.storageKey));
      } catch (err) {
        this.muted = false;
      }
    }
  }

  persistMutedState() {
    if (typeof wx !== 'undefined' && wx.setStorageSync) {
      try {
        wx.setStorageSync(this.storageKey, this.muted ? '1' : '0');
        return;
      } catch (err) {
        console.warn('保存静音状态失败', err);
      }
    }

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey, this.muted ? '1' : '0');
      } catch (err) {
        console.warn('保存静音状态失败', err);
      }
    }
  }

  setMuted(nextMuted) {
    this.muted = Boolean(nextMuted);
    this.persistMutedState();
    if (this.muted) {
      this.stopBGM();
    }
  }

  isMuted() {
    return this.muted;
  }

  // 初始化 AudioContext
  init() {
    if (this.muted) return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 🎵 1. 游戏进行时的轻快背景音乐 (BGM Loop)
  startBGM() {
    if (this.muted) return;
    this.init();
    if (!this.ctx || this.isPlayingBGM) return;

    this.isPlayingBGM = true;
    
    // 轻快的欢快和弦旋律（C大调音阶：C5, E5, G5, A5）
    const melody = [523.25, 659.25, 783.99, 880.00, 783.99, 659.25];
    let noteIndex = 0;

    // 每 250ms 播放一个音符，形成循环乐段
    this.bgmTimer = setInterval(() => {
      if (!this.isPlayingBGM) return;
      
      const freq = melody[noteIndex % melody.length];
      this.playTone(freq, 'sine', 0.15, 0.05); // 柔和的木琴/八音盒质感
      noteIndex++;
    }, 250);
  }

  // 停止背景音乐
  stopBGM() {
    this.isPlayingBGM = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  // 🎉 2. 点击成功/消除音效 (三连音升调)
  playSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // 愉悦的升调音符: Do-Mi-Sol (C5 -> E5 -> G5)
    this.playToneAt(523.25, 'triangle', 0.12, 0.15, now);
    this.playToneAt(659.25, 'triangle', 0.12, 0.15, now + 0.08);
    this.playToneAt(783.99, 'triangle', 0.25, 0.2, now + 0.16);
  }

  // ❌ 3. 失败/匹配错误音效 (低沉双音沉降)
  playFail() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // 低沉的警告音 (F3 -> C3)
    this.playToneAt(174.61, 'sawtooth', 0.15, 0.15, now);
    this.playToneAt(130.81, 'sawtooth', 0.3, 0.15, now + 0.12);
  }

  // 通用单音播放函数
  playTone(freq, type = 'sine', duration = 0.1, volume = 0.1) {
    if (!this.ctx) return;
    this.playToneAt(freq, type, duration, volume, this.ctx.currentTime);
  }

  playToneAt(freq, type, duration, volume, startTime) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      // 音量渐隐，避免“咔哒”杂音
      gain.gain.setValueAtTime(volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      console.warn('播放音频失败:', e);
    }
  }
}

const soundManager = new SoundManager();
module.exports = soundManager;