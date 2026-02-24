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

// 背景音乐类型
export type BGMType = 'none' | 'voice' | 'space'; // voice=主界面m4a, space=书写界面mp3

// BGM 状态
interface BGMState {
  type: BGMType;
  volume: number;
  fadeInDuration: number;
  fadeOutDuration: number;
}

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
  private userInteracted: boolean = false; // 用户是否已交互

  constructor() {
    // 延迟初始化 AudioContext（需要用户交互）
    this.audioContext = null;

    // 监听全局用户交互事件
    const events = ['click', 'keydown', 'touchstart', 'mousedown'];
    events.forEach(event => {
      document.addEventListener(event, () => this.handleUserInteraction(), { once: true });
    });
  }

  // 处理用户首次交互
  private handleUserInteraction() {
    if (!this.userInteracted) {
      this.userInteracted = true;
      console.log('[Audio] 用户首次交互，初始化音频系统');
      this.init();

      // 确保 AudioContext 处于运行状态
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          console.log('[Audio] AudioContext 已恢复');
        }).catch(err => {
          console.warn('[Audio] AudioContext 恢复失败:', err);
        });
      }
    }
  }

  // 初始化 AudioContext（必须在用户交互后调用）
  private init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.audioContext.destination);
      console.log('[Audio] AudioContext 初始化完成，主音量:', this.volume);
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

  // 获取 AudioContext（用于 BGM 管理器）
  getAudioContext(): AudioContext | null {
    this.init();
    return this.audioContext;
  }

  // 播放音效
  async play(type: SoundType) {
    if (!this.enabled) {
      console.log('[Audio] 音效已禁用，跳过播放:', type);
      return;
    }

    try {
      this.init();

      if (!this.audioContext || !this.masterGain) {
        console.warn('[Audio] AudioContext 或 masterGain 未初始化');
        return;
      }

      // 恢复 AudioContext（如果被挂起）- 必须等待完成
      if (this.audioContext.state === 'suspended') {
        console.log('[Audio] 恢复 AudioContext');
        await this.audioContext.resume();
        console.log('[Audio] AudioContext 已恢复');
      }

      console.log('[Audio] 播放音效:', type);

      // 定义哪些音效需要侧链压缩，以及它们的持续时间和降低因子
      const duckingConfig: Record<SoundType, { duration: number; factor: number } | null> = {
        'vomit': { duration: 1.5, factor: 0.4 },          // 吐问题音效 - 1.5秒，降到 40%
        'robot-arrival': { duration: 5, factor: 0.5 },    // 机器人降临 - 5秒，降到 50%
        'milestone': { duration: 0.8, factor: 0.6 },     // 里程碑 - 0.8秒，降到 60%
        'unlock': { duration: 0.5, factor: 0.7 },        // 解锁 - 0.5秒，降到 70%
        'button-click': null,
        'button-hover': null,
        'success': null,
        'typing': null,
        'page-transition': null,
      };

      const config = duckingConfig[type];

      // 如果需要侧链压缩，启动它
      if (config && bgmManagerInstance) {
        console.log('[Audio] 启动侧链压缩，因子:', config.factor);
        bgmManagerInstance.startDucking(config.factor, 0.1);
        // 音效结束后恢复 BGM 音量
        setTimeout(() => {
          if (bgmManagerInstance) {
            console.log('[Audio] 结束侧链压缩');
            bgmManagerInstance.endDucking(0.3);
          }
        }, (config.duration + 0.2) * 1000);
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
      console.error('[Audio] 播放音效时出错:', error);
    }
  }

  // 按钮点击音效 - 短促的 beep
  private playButtonSound() {
    if (!this.audioContext || !this.masterGain) {
      console.warn('[Audio] masterGain 未初始化');
      return;
    }

    console.log('[Audio] masterGain 音量:', this.masterGain.gain.value);

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

    console.log('[Audio] 按钮音效已启动');
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
    if (!this.audioContext || !this.masterGain) {
      console.warn('[Audio] typing: masterGain 未初始化');
      return;
    }

    console.log('[Audio] typing: masterGain 音量:', this.masterGain.gain.value);

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime); // 提高音量
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.02);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.02);

    console.log('[Audio] typing 音效已启动，频率: 600Hz');
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

// ==================== BGM 管理器 ====================

/**
 * 背景音乐管理器
 * 支持播放音频文件和生成宇宙白噪音
 */
class BGMManager {
  private audioContext: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private currentBGM: BGMType = 'none';
  private currentAudioElement: HTMLAudioElement | null = null;
  private cosmicNoiseNodes: {
    oscillators: OscillatorNode[];
    noiseSource: AudioBufferSourceNode | null;
    filter: BiquadFilterNode | null;
    lfo: OscillatorNode | null;
    lfoGain: GainNode | null;
  } | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3; // BGM 默认音量较低
  private targetVolume: number = 0.3;
  private isDucking: boolean = false; // 是否正在侧链压缩状态
  private preDuckVolume: number = 0.3; // 侧链前的音量
  private lastBGMType: BGMType = 'none'; // 记住上次播放的 BGM 类型

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.bgmGain = audioContext.createGain();
    this.bgmGain.gain.value = 0;
    this.bgmGain.connect(audioContext.destination);
  }

  // 启用/禁用 BGM
  setEnabled(enabled: boolean) {
    const wasEnabled = this.enabled;
    this.enabled = enabled;

    if (!enabled && wasEnabled) {
      // 从启用切换到禁用 - 停止音乐，但记住类型
      console.log('[BGM] 禁用 BGM，记住类型:', this.currentBGM);
      this.lastBGMType = this.currentBGM;
      this.stopBGMInternal();
    } else if (enabled && !wasEnabled) {
      // 从禁用切换到启用 - 恢复音乐
      console.log('[BGM] 启用 BGM，恢复播放:', this.lastBGMType);
      this.currentBGM = this.lastBGMType;
      if (this.lastBGMType === 'voice') {
        this.playVoiceBGM(1);
      } else if (this.lastBGMType === 'space') {
        this.playSpaceBGM(1);
      }
    }
  }

  // 设置 BGM 音量
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.targetVolume = this.volume;

    // 同时控制 bgmGain 和 audioElement
    if (this.bgmGain) {
      this.bgmGain.gain.setTargetAtTime(
        this.targetVolume * (this.currentBGM !== 'none' ? 1 : 0),
        this.audioContext!.currentTime,
        0.1
      );
    }

    // 如果正在使用 audioElement，也设置它的音量
    if (this.currentAudioElement) {
      this.currentAudioElement.volume = this.volume;
    }
  }

  // 获取当前 BGM 类型
  getCurrentBGM(): BGMType {
    return this.currentBGM;
  }

  // 获取是否启用
  isEnabled(): boolean {
    return this.enabled;
  }

  // 获取当前实际音量（考虑侧链压缩）
  getCurrentVolume(): number {
    return this.volume;
  }

  /**
   * 开始侧链压缩 - 降低 BGM 音量让音效突出
   * @param duckFactor 降低因子（0-1），0.5 表示降低到 50%
   * @param fadeDuration 淡入时长（秒）
   */
  startDucking(duckFactor: number = 0.5, fadeDuration: number = 0.1) {
    if (this.isDucking) return;

    this.isDucking = true;
    this.preDuckVolume = this.volume;

    // 快速降低音量 - 同时控制 bgmGain 和 audioElement
    const duckedVolume = this.volume * duckFactor;

    if (this.bgmGain && this.audioContext) {
      this.bgmGain.gain.cancelScheduledValues(this.audioContext.currentTime);
      this.bgmGain.gain.setTargetAtTime(
        duckedVolume,
        this.audioContext.currentTime,
        fadeDuration
      );
    }

    // 也控制 audioElement
    if (this.currentAudioElement) {
      const fadeInterval = 20; // 每 20ms 更新一次
      const steps = (fadeDuration * 1000) / fadeInterval;
      let currentStep = 0;

      const fade = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        this.currentAudioElement!.volume = this.preDuckVolume * (1 - progress * (1 - duckFactor));

        if (currentStep >= steps) {
          clearInterval(fade);
          this.currentAudioElement!.volume = duckedVolume;
        }
      }, fadeInterval);
    }
  }

  /**
   * 结束侧链压缩 - 恢复 BGM 音量
   * @param fadeDuration 淡出时长（秒）
   */
  endDucking(fadeDuration: number = 0.3) {
    if (!this.isDucking) return;

    // 平滑恢复音量 - 同时控制 bgmGain 和 audioElement
    if (this.bgmGain && this.audioContext) {
      this.bgmGain.gain.cancelScheduledValues(this.audioContext.currentTime);
      this.bgmGain.gain.setTargetAtTime(
        this.preDuckVolume,
        this.audioContext.currentTime,
        fadeDuration
      );
    }

    // 也控制 audioElement
    if (this.currentAudioElement) {
      const fadeInterval = 20; // 每 20ms 更新一次
      const steps = (fadeDuration * 1000) / fadeInterval;
      let currentStep = 0;
      const startVolume = this.currentAudioElement.volume;

      const fade = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        this.currentAudioElement!.volume = startVolume + (this.preDuckVolume - startVolume) * progress;

        if (currentStep >= steps) {
          clearInterval(fade);
          this.currentAudioElement!.volume = this.preDuckVolume;
        }
      }, fadeInterval);
    }

    this.isDucking = false;
  }

  /**
   * 切换 BGM（带淡入淡出）
   * @param type BGM 类型
   * @param fadeInDuration 淡入时长（秒）
   * @param fadeOutDuration 淡出时长（秒）
   */
  async switchBGM(type: BGMType, fadeInDuration: number = 1.5, fadeOutDuration: number = 1) {
    console.log('[BGM] 切换背景音乐:', this.currentBGM, '->', type);

    if (!this.enabled || type === this.currentBGM) {
      console.log('[BGM] 跳过切换（未启用或相同类型）');
      return;
    }

    if (!this.audioContext || !this.bgmGain) {
      console.warn('[BGM] AudioContext 或 bgmGain 未初始化，等待用户交互');
      return;
    }

    // 确保 AudioContext 在运行状态
    if (this.audioContext.state === 'suspended') {
      console.log('[BGM] 尝试恢复 AudioContext...');
      try {
        await this.audioContext.resume();
        console.log('[BGM] AudioContext 恢复成功');
      } catch (err) {
        console.warn('[BGM] AudioContext 恢复失败，需要用户交互:', err);
        return;
      }
    }

    const previousBGM = this.currentBGM;

    // 检查是否都在使用 space.mp3（voice 和 space 都是同一个文件）
    // 如果都是从有音乐切换到有音乐，就不要中断
    const bothHaveMusic = previousBGM !== 'none' && type !== 'none';

    if (bothHaveMusic) {
      console.log('[BGM] 都是同一个音乐文件，不需要中断，直接更新状态');
      this.currentBGM = type;
      this.lastBGMType = type;
      return;
    }

    this.currentBGM = type;

    // 先淡出当前 BGM
    if (this.currentAudioElement && previousBGM !== 'none') {
      console.log('[BGM] 淡出当前 BGM，时长:', fadeOutDuration, '秒');
      const oldAudio = this.currentAudioElement;
      const startVolume = oldAudio.volume;
      const fadeInterval = 30; // 每 30ms 更新一次
      const steps = (fadeOutDuration * 1000) / fadeInterval;
      let currentStep = 0;

      // 创建淡出 Promise
      await new Promise<void>(resolve => {
        const fadeOut = () => {
          currentStep++;
          const progress = currentStep / steps;
          oldAudio.volume = startVolume * (1 - progress);

          if (currentStep >= steps) {
            // 淡出完成，停止音频
            oldAudio.pause();
            oldAudio.currentTime = 0;
            console.log('[BGM] 当前 BGM 淡出完成并停止');
            resolve();
          } else {
            setTimeout(fadeOut, fadeInterval);
          }
        };
        fadeOut();
      });

      this.currentAudioElement = null;
    }

    // 启动新的 BGM
    if (type === 'voice') {
      await this.playVoiceBGM(fadeInDuration);
    } else if (type === 'space') {
      await this.playSpaceBGM(fadeInDuration);
    }
    // type === 'none' 不播放任何东西

    // 更新当前 BGM 类型
    this.currentBGM = type;
    this.lastBGMType = type;
  }

  // 停止 BGM（用于禁用）
  stopBGM() {
    // 不重置 currentBGM，只停止音频播放
    this.stopBGMInternal();
    if (this.bgmGain && this.audioContext) {
      this.bgmGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.3);
    }
  }

  // 内部停止方法
  private stopBGMInternal() {
    // 停止音频文件
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }

    // 停止宇宙噪音
    if (this.cosmicNoiseNodes) {
      this.cosmicNoiseNodes.oscillators.forEach(osc => {
        try { osc.stop(); } catch {}
      });
      if (this.cosmicNoiseNodes.noiseSource) {
        try { this.cosmicNoiseNodes.noiseSource.stop(); } catch {}
      }
      if (this.cosmicNoiseNodes.lfo) {
        try { this.cosmicNoiseNodes.lfo.stop(); } catch {}
      }
      this.cosmicNoiseNodes = null;
    }
  }

  // 播放主界面背景音乐
  private async playVoiceBGM(fadeInDuration: number) {
    if (!this.bgmGain || !this.audioContext) return;

    try {
      console.log('[BGM] 尝试播放主界面背景音乐: /space.mp3');

      // 如果已有音频在播放，先停止
      if (this.currentAudioElement) {
        console.log('[BGM] 检测到已有音频在播放，先停止');
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      }

      const audio = new Audio('/space.mp3');
      audio.loop = true;
      audio.volume = 0;

      this.currentAudioElement = audio;

      // 先播放
      await audio.play();
      console.log('[BGM] 主界面背景音乐开始播放');

      // 使用淡入效果（通过 audio.volume）
      const targetVolume = 0.3; // 正常音量
      const fadeInterval = 50; // 每 50ms 更新一次
      const steps = (fadeInDuration * 1000) / fadeInterval;
      let currentStep = 0;

      const fade = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        audio.volume = targetVolume * progress;

        if (currentStep >= steps) {
          clearInterval(fade);
          audio.volume = targetVolume;
          console.log('[BGM] 主界面背景音乐淡入完成，音量:', audio.volume);
        }
      }, fadeInterval);
    } catch (error) {
      console.error('[BGM] 播放主界面背景音乐失败:', error);
      this.currentAudioElement = null;
    }
  }

  // 播放书写界面背景音乐 (space.mp3)
  private async playSpaceBGM(fadeInDuration: number) {
    if (!this.bgmGain || !this.audioContext) return;

    try {
      console.log('[BGM] 尝试播放书写界面背景音乐: /space.mp3');

      // 如果已有音频在播放，先停止
      if (this.currentAudioElement) {
        console.log('[BGM] 检测到已有音频在播放，先停止');
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      }

      const audio = new Audio('/space.mp3');
      audio.loop = true;
      audio.volume = 0;

      this.currentAudioElement = audio;

      // 先播放
      await audio.play();
      console.log('[BGM] 书写界面背景音乐开始播放，当前音量:', audio.volume, '目标音量:', this.volume);

      // 使用淡入效果（通过 audio.volume）
      const targetVolume = 0.3; // 明确设置目标音量
      const fadeInterval = 50; // 每 50ms 更新一次
      const steps = (fadeInDuration * 1000) / fadeInterval;
      let currentStep = 0;

      const fade = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        audio.volume = targetVolume * progress;

        if (currentStep >= steps) {
          clearInterval(fade);
          audio.volume = targetVolume;
          console.log('[BGM] 书写界面背景音乐淡入完成，音量:', audio.volume);
        }
      }, fadeInterval);
    } catch (error) {
      console.error('[BGM] 播放书写界面背景音乐失败:', error);
      this.currentAudioElement = null;
    }
  }

  // 生成并播放宇宙空灵白噪音（已弃用，保留供参考）
  private playCosmicNoise(fadeInDuration: number) {
    if (!this.bgmGain || !this.audioContext) return;

    const currentTime = this.audioContext.currentTime;
    const nodes = {
      oscillators: [] as OscillatorNode[],
      noiseSource: null as AudioBufferSourceNode | null,
      filter: null as BiquadFilterNode | null,
      lfo: null as OscillatorNode | null,
      lfoGain: null as GainNode | null,
    };

    // 1. 创建粉红噪音（经过滤波的白噪音）
    const noiseDuration = 10; // 10秒缓冲
    const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * noiseDuration, this.audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);

    // 生成粉红噪音（近似）
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < noiseData.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      noiseData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    nodes.noiseSource = noiseSource;

    // 滤波器 - 产生"空灵感"
    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 800; // 中频
    noiseFilter.Q.value = 0.5; // 较宽的带宽
    nodes.filter = noiseFilter;

    // LFO 调制滤波器频率
    const lfo = this.audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // 非常缓慢的调制（10秒周期）
    nodes.lfo = lfo;

    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = 400; // 调制深度：600-1200 Hz
    nodes.lfoGain = lfoGain;

    lfo.connect(lfoGain);
    lfoGain.connect(noiseFilter.frequency);

    // 噪音链路：noise → filter → bgmGain
    noiseSource.connect(noiseFilter);

    // 2. 添加低频正弦波产生"宇宙深度感"
    const deepFreqs = [60, 110, 165]; // A1, A2, E3 和弦
    deepFreqs.forEach(freq => {
      const osc = this.audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const oscGain = this.audioContext.createGain();
      oscGain.gain.value = 0.03; // 非常轻柔

      osc.connect(oscGain);
      oscGain.connect(this.bgmGain!);

      osc.start(currentTime);
      nodes.oscillators.push(osc);
    });

    // 3. 添加微弱的高频泛音产生"空灵感"
    const shimmerFreqs = [800, 1200, 1600, 2400];
    shimmerFreqs.forEach(freq => {
      const osc = this.audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const oscGain = this.audioContext.createGain();
      oscGain.gain.value = 0.008; // 极轻柔

      osc.connect(oscGain);
      oscGain.connect(this.bgmGain!);

      osc.start(currentTime);
      nodes.oscillators.push(osc);
    });

    // 启动噪音和 LFO
    noiseSource.start(currentTime);
    lfo.start(currentTime);

    this.cosmicNoiseNodes = nodes;

    // 淡入（非常轻柔的音量）
    this.bgmGain.gain.cancelScheduledValues(currentTime);
    this.bgmGain.gain.setValueAtTime(0, currentTime);
    this.bgmGain.gain.linearRampToValueAtTime(
      this.targetVolume * 0.35, // 白噪音音量更低
      currentTime + fadeInDuration
    );
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

// 强制初始化音频系统（用于自动播放场景）
export async function initAudioSystem(): Promise<void> {
  const service = getAudioService();
  const ctx = service.getAudioContext();

  if (ctx && ctx.state === 'suspended') {
    console.log('[Audio] 强制恢复 AudioContext');
    await ctx.resume();
    console.log('[Audio] AudioContext 已恢复');
  }

  // 播放一个极短的静默音来唤醒音频
  playSound('button-click');
  await new Promise(resolve => setTimeout(resolve, 100));
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

// ==================== BGM 便捷函数 ====================

let bgmManagerInstance: BGMManager | null = null;

// 初始化 BGM 管理器
export function initBGMManager(): BGMManager {
  if (!bgmManagerInstance) {
    const audioService = getAudioService();
    const ctx = audioService.getAudioContext();
    if (ctx) {
      bgmManagerInstance = new BGMManager(ctx);
    } else {
      // Fallback
      bgmManagerInstance = new BGMManager(new (window.AudioContext || (window as any).webkitAudioContext)());
    }
  }
  return bgmManagerInstance;
}

// 切换 BGM
export async function switchBGM(type: BGMType, fadeInDuration?: number, fadeOutDuration?: number) {
  const manager = initBGMManager();
  await manager.switchBGM(type, fadeInDuration, fadeOutDuration);
}

// 设置 BGM 音量
export function setBGMVolume(volume: number) {
  const manager = initBGMManager();
  manager.setVolume(volume);
}

// 启用/禁用 BGM
export function setBGMEnabled(enabled: boolean) {
  const manager = initBGMManager();
  manager.setEnabled(enabled);
}

// 获取当前 BGM 类型
export function getCurrentBGM(): BGMType {
  const manager = initBGMManager();
  return manager.getCurrentBGM();
}

// BGM 是否启用
export function isBGMEnabled(): boolean {
  const manager = initBGMManager();
  return manager.isEnabled();
}
