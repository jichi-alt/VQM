import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// 每个测试后清理
afterEach(() => {
  cleanup();
});

// 模拟环境变量
process.env.GEMINI_API_KEY = 'test-api-key';

// 模拟 IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// 模拟 ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// 模拟 matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 模拟 window.scrollTo
global.scrollTo = vi.fn();

// 模拟 AudioContext（JSDOM 环境不存在原生实现）
class MockAudioContext {
  public destination = {};
  public state = 'running';
  public sampleRate = 44100;
  createGain() {
    return {
      gain: { value: 1 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
  createBufferSource() {
    return {
      buffer: null as any,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null as any,
    };
  }
  decodeAudioData(arrayBuffer: ArrayBuffer) {
    return Promise.resolve({} as AudioBuffer);
  }
  resume = vi.fn().mockResolvedValue(undefined);
  suspend = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockResolvedValue(undefined);
}
// @ts-expect-error 测试环境注入
window.AudioContext = MockAudioContext;
// @ts-expect-error 测试环境注入
(window as any).webkitAudioContext = MockAudioContext;
