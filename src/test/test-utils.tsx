import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// 自定义渲染函数，可以添加 Provider
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // 这里可以添加 Router、Context Provider 等
  return render(ui, options);
}

// 重新导出 Testing Library 工具
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
