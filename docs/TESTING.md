# 测试指南

本文档说明如何为 VQM 观测站项目编写和运行测试。

## 🚀 快速开始

### 运行所有测试
```bash
npm test
```

### 交互式测试 UI
```bash
npm run test:ui
```

### 单次运行测试（用于 CI）
```bash
npm run test:run
```

### 生成测试覆盖率报告
```bash
npm run test:coverage
```

## 📁 测试文件结构

```
workspace/
├── src/test/
│   ├── setup.ts           # 测试环境配置
│   ├── test-utils.tsx     # 测试工具函数
│   └── mocks/
│       └── handlers.ts    # MSW API 模拟
├── services/__tests__/     # 服务层测试
├── components/__tests__/   # 组件测试
└── pages/__tests__/        # 页面测试
```

## 📝 测试类型

### 1. 单元测试

测试独立的函数和类：

```typescript
// services/__tests__/memoryFragments.test.ts
import { describe, it, expect } from 'vitest';
import { getFragmentById } from '../memoryFragments';

describe('Memory Fragments', () => {
  it('应该返回正确 ID 的碎片', () => {
    const fragment = getFragmentById('frag_1_1');
    expect(fragment?.id).toBe('frag_1_1');
  });
});
```

### 2. 组件测试

测试 React 组件的渲染和交互：

```typescript
// components/__tests__/MyComponent.test.tsx
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('应该渲染标题', () => {
    render(<MyComponent title="测试标题" />);
    expect(screen.getByText('测试标题')).toBeInTheDocument();
  });

  it('点击按钮应该触发回调', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<MyComponent onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 3. 集成测试

测试多个模块协作：

```typescript
// services/__tests__/geminiService.integration.test.ts
import { server } from '@/test/mocks/handlers';
import { generatePhilosophicalQuestion } from '../geminiService';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());

describe('Gemini Service 集成测试', () => {
  it('应该成功生成问题', async () => {
    const question = await generatePhilosophicalQuestion(1);
    expect(question).toBeDefined();
  });
});
```

## 🎯 测试覆盖目标

### 优先级 P0（必须测试）
- [ ] `memoryFragments.ts` - 数据访问函数
- [ ] `authService.ts` - 认证逻辑
- [ ] 关键 UI 组件（QuestionVomitMachine 的核心功能）

### 优先级 P1（应该测试）
- [ ] `geminiService.ts` - AI 问题生成
- [ ] `audioService.ts` - 音频控制
- [ ] 表单验证逻辑
- [ ] 本地存储操作

### 优先级 P2（可选测试）
- [ ] 动画效果
- [ ] 纯展示组件
- [ ] 样式相关

## 🔧 常见测试场景

### 模拟 API 调用

```typescript
import { server } from '@/test/mocks/handlers';
import { http, HttpResponse } from 'msw';

it('应该处理 API 错误', async () => {
  // 覆盖默认 handler
  server.use(
    http.post('https://api.example.com/endpoint', () => {
      return HttpResponse.status(500);
    })
  );

  // 测试错误处理
});
```

### 测试异步操作

```typescript
it('应该等待异步更新', async () => {
  render(<MyComponent />);

  // 等待元素出现
  await waitFor(() => {
    expect(screen.getByText('加载完成')).toBeInTheDocument();
  });
});
```

### 测试本地存储

```typescript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock;

it('应该保存到本地存储', () => {
  saveData('key', 'value');
  expect(localStorageMock.setItem).toHaveBeenCalledWith('key', JSON.stringify('value'));
});
```

## 📊 测试覆盖率

运行 `npm run test:coverage` 后，查看覆盖率报告：

```bash
npm run test:coverage
open coverage/index.html
```

目标覆盖率：
- 语句覆盖率：> 80%
- 分支覆盖率：> 70%
- 函数覆盖率：> 80%
- 行覆盖率：> 80%

## 🎓 最佳实践

1. **测试用户行为，而不是实现细节**
   ```typescript
   // ✅ 好的测试
   expect(screen.getByRole('button', { name: '提交' })).toBeEnabled();

   // ❌ 不好的测试
   expect(component.state.isSubmitting).toBe(false);
   ```

2. **使用 describe 组织相关测试**
   ```typescript
   describe('用户认证', () => {
     describe('登录', () => {
       it('应该验证邮箱格式');
       it('应该处理错误密码');
     });
   });
   ```

3. **保持测试简单和独立**
   - 每个测试应该独立运行
   - 避免测试之间的依赖

4. **使用有意义的测试描述**
   ```typescript
   it('应该在第 21 天解锁所有记忆碎片'); // ✅ 清晰
   it('test unlock'); // ❌ 不清晰
   ```

## 🔗 相关资源

- [Vitest 文档](https://vitest.dev/)
- [Testing Library 文档](https://testing-library.com/react)
- [MSW 文档](https://mswjs.io/)
