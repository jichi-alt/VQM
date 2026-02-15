import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// 模拟 Gemini API
export const geminiHandlers = [
  http.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', () => {
    return HttpResponse.json({
      candidates: [
        {
          content: {
            parts: [
              {
                text: '这是一个测试哲学问题：你认为什么是真实的存在？',
              },
            ],
          },
        },
      ],
    });
  }),
];

// 模拟 Supabase API
export const supabaseHandlers = [
  http.post('https://api.supabase.io/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
    });
  }),

  http.get('https://api.supabase.io/rest/v1/user_data', () => {
    return HttpResponse.json([
      {
        id: '1',
        user_id: 'test-user-id',
        current_day: 5,
        total_words: 1250,
        created_at: '2025-01-01T00:00:00Z',
      },
    ]);
  }),
];

// 创建 MSW 服务器
export const server = setupServer(...geminiHandlers, ...supabaseHandlers);
