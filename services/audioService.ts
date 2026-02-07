/**
 * 音效服务
 * 使用 Web Audio API 生成各种音效，无需外部音频文件
 */

// 音效类型
export type SoundType =
  | 'button-click'      // 按钮点击
  | 'button-hover'      // 按钮悬停
  | 'success'           // 成功/打卡成功
  | 'unlock'            // 解锁记忆碎片
  | 'milestone'         // 里程碑庆祝
  | 'typing'            // 打字机效果
  | 'robot-arrival'     // 机器人降临
  | 'page-transition'   // 页面过渡
  | 'vomit';            // 吐问题（机器人呕吐）

// 音效配置
interface SoundConfig {
  duration: number;      // 持续时间（秒）
  frequency: number;     // 基础频率（Hz）
  type: OscillatorType;  // 波形类型
  volume?: number;       // 音量（0-1）
}

class AudioService {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5; // 主音量

  constructor() {
    // 延迟初始化 AudioContext（需要用户交互）
    this.audioContext = null;
  }

  // 初始化 AudioContext（必须在用户交互后调用）
  private init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.audioContext.destination);
    }
  }

  // 启用/禁用音效
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  // 设置主音量
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  // 获取是否启用
  isEnabled(): boolean {
    return this.enabled;
  }

  // 播放音效
  play(type: SoundType) {
    if (!this.enabled) return;

    try {
      this.init();

      if (!this.audioContext || !this.masterGain) return;

      // 恢复 AudioContext（如果被挂起）
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      switch (type) {
        case 'button-click':
          this.playButtonSound();
          break;
        case 'button-hover':
          this.playHoverSound();
          break;
        case 'success':
          this.playSuccessSound();
          break;
        case 'unlock':
          this.playUnlockSound();
          break;
        case 'milestone':
          this.playMilestoneSound();
          break;
        case 'typing':
          this.playTypingSound();
          break;
        case 'robot-arrival':
          this.playRobotArrivalSound();
          break;
        case 'page-transition':
          this.playPageTransitionSound();
          break;
        case 'vomit':
          this.playVomitSound();
          break;
      }
    } catch (error) {
      console.warn('Audio playback error:', error);
    }
  }

  // 按钮点击音效 - 短促的 beep
  private playButtonSound() {
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.05);
  }

  // 按钮悬停音效 - 非常轻柔的提示音
  private playHoverSound() {
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.03);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.03);
  }

  // 成功音效 - 上升音阶
  private playSuccessSound() {
    if (!this.audioContext || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      const startTime = this.audioContext.currentTime + index * 0.08;
      const duration = 0.15;

      oscillator.frequency.setValueAtTime(freq, startTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }

  // 解锁音效 - 神秘感
  private playUnlockSound() {
    if (!this.audioContext || !this.masterGain) return;

    // 创建水晶音效
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(261.63, this.audioContext.currentTime); // C4
    oscillator.frequency.exponentialRampToValueAtTime(523.25, this.audioContext.currentTime + 0.3); // C5

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.4);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.4);

    // 添加回声效果
    this.playEcho(261.63, 0.1, 0.2);
  }

  // 里程碑庆祝音效 - 琶琶琶音
  private playMilestoneSound() {
    if (!this.audioContext || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      const startTime = this.audioContext.currentTime + index * 0.1;

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(freq, startTime);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.5);
    });
  }

  // 打字音效 - 短促的 click
  private playTypingSound() {
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.02);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.02);
  }

  // 吐问题音效 - 金属齿轮碰撞声（持续1.5秒）
  private playVomitSound() {
    if (!this.audioContext || !this.masterGain) return;

    const duration = 1.5;
    const currentTime = this.audioContext.currentTime;
    const metalFreq = 350; // 固定金属音高

    // 创建大量随机碰撞声
    for (let i = 0; i < 30; i++) {
      const randomTime = Math.random() * duration;
      const randomDuration = 0.02 + Math.random() * 0.08;

      // 金属撞击音 - 方波
      const osc1 = this.audioContext.createOscillator();
      const gain1 = this.audioContext.createGain();
      osc1.type = 'square';
      osc1.connect(gain1);
      gain1.connect(this.masterGain);

      osc1.frequency.value = metalFreq;

      gain1.gain.setValueAtTime(0.12, currentTime + randomTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, currentTime + randomTime + randomDuration);

      osc1.start(currentTime + randomTime);
      osc1.stop(currentTime + randomTime + randomDuration);

      // 金属泛音 - 锯齿波（稍微失谐）
      const osc2 = this.audioContext.createOscillator();
      const gain2 = this.audioContext.createGain();
      osc2.type = 'sawtooth';
      osc2.connect(gain2);
      gain2.connect(this.masterGain);

      // 固定失谐频率，产生金属泛音
      osc2.frequency.value = metalFreq * (1.4 + Math.random() * 0.3);

      gain2.gain.setValueAtTime(0.06, currentTime + randomTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, currentTime + randomTime + randomDuration * 0.7);

      osc2.start(currentTime + randomTime);
      osc2.stop(currentTime + randomTime + randomDuration * 0.7);
    }

    // 添加大量金属噪声 - 破铜烂铁摩擦声
    for (let i = 0; i < 15; i++) {
      const randomTime = Math.random() * duration;
      const noiseDuration = 0.05 + Math.random() * 0.15;

      const bufferSize = this.audioContext.sampleRate * noiseDuration;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);

      for (let j = 0; j < bufferSize; j++) {
        // 产生粗糙的金属噪声
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.2));
      }

      const noise = this.audioContext.createBufferSource();
      noise.buffer = buffer;

      // 不同的滤波器产生不同质感
      const filterTypes = ['highpass', 'bandpass', 'lowpass'];
      const filter = this.audioContext.createBiquadFilter();
      filter.type = filterTypes[Math.floor(Math.random() * filterTypes.length)] as BiquadFilterType;
      filter.frequency.value = 1000 + Math.random() * 3000;
      filter.Q.value = 1 + Math.random() * 5;

      const noiseGain = this.audioContext.createGain();
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noiseGain.gain.setValueAtTime(0.04, currentTime + randomTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, currentTime + randomTime + noiseDuration);

      noise.start(currentTime + randomTime);
    }

    // 底层持续金属轰鸣 - 固定频率
    const drone = this.audioContext.createOscillator();
    const droneGain = this.audioContext.createGain();
    const droneFilter = this.audioContext.createBiquadFilter();

    drone.type = 'sawtooth';
    drone.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.masterGain);

    droneFilter.type = 'bandpass';
    droneFilter.frequency.value = metalFreq; // 固定频率
    droneFilter.Q.value = 10; // 高Q值产生共振峰

    drone.frequency.value = metalFreq; // 固定频率

    droneGain.gain.setValueAtTime(0.08, currentTime);
    droneGain.gain.linearRampToValueAtTime(0.02, currentTime + duration);

    drone.start(currentTime);
    drone.stop(currentTime + duration);

    // 添加 FM 调制产生金属失谐
    const modulator = this.audioContext.createOscillator();
    const modGain = this.audioContext.createGain();

    modulator.frequency.value = metalFreq * 0.5; // 固定调制频率
    modGain.gain.value = 100; // 调制深度

    modulator.connect(modGain);
    modGain.connect(drone.frequency);

    modulator.start(currentTime);
    modulator.stop(currentTime + duration);
  }

  // 机器人降临音效 - 柔和的上升音
  private playRobotArrivalSound() {
    if (!this.audioContext || !this.masterGain) return;

    const duration = 5;
    const currentTime = this.audioContext.currentTime;

    // 创建和弦上升效果
    const notes = [150, 200, 250]; // 低频和弦

    notes.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.type = 'sine';

      // 频率从低到高平滑上升
      const startFreq = freq * 0.5;
      const endFreq = freq * 2;
      oscillator.frequency.setValueAtTime(startFreq, currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(endFreq, currentTime + duration);

      // 音量包络
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(0.08, currentTime + 0.3);
      gainNode.gain.linearRampToValueAtTime(0.05, currentTime + duration - 0.3);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + duration);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + duration);
    });
  }

  // 页面过渡音效 - 柔和的 swoosh
  private playPageTransitionSound() {
    if (!this.audioContext || !this.masterGain) return;

    const noise = this.audioContext.createBufferSource();
    const bufferSize = this.audioContext.sampleRate * 0.2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // 生成白噪声
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    noise.buffer = buffer;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.15);

    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    noise.start(this.audioContext.currentTime);
    noise.stop(this.audioContext.currentTime + 0.15);
  }

  // 回声效果
  private playEcho(frequency: number, delay: number, volume: number) {
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime + delay);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(volume * 0.5, this.audioContext.currentTime + delay + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + delay + 0.3);

    oscillator.start(this.audioContext.currentTime + delay);
    oscillator.stop(this.audioContext.currentTime + delay + 0.3);
  }

  // 颤音效果
  private playTremolo(baseFreq: number, duration: number) {
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const lfo = this.audioContext.createOscillator();

    lfo.frequency.value = 8; // 8Hz 颤音
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = 50;

    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);

    lfo.start(this.audioContext.currentTime);
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
    lfo.stop(this.audioContext.currentTime + duration);
  }
}

// 单例实例
let audioServiceInstance: AudioService | null = null;

export function getAudioService(): AudioService {
  if (!audioServiceInstance) {
    audioServiceInstance = new AudioService();
  }
  return audioServiceInstance;
}

// 便捷函数
export function playSound(type: SoundType) {
  getAudioService().play(type);
}

export function setSoundEnabled(enabled: boolean) {
  getAudioService().setEnabled(enabled);
}

export function setSoundVolume(volume: number) {
  getAudioService().setVolume(volume);
}

export function isSoundEnabled(): boolean {
  return getAudioService().isEnabled();
}
