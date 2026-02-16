-- =====================================================
-- VQM Observation Station - Supabase 数据库设置
-- =====================================================
-- 执行说明：
-- 1. 登录 Supabase Dashboard: https://supabase.com/dashboard
-- 2. 选择你的项目
-- 3. 进入 SQL Editor
-- 4. 复制并执行以下 SQL
-- =====================================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. 用户资料表 (扩展 auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 创建新用户时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. 打卡记录表 (user_streaks)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_check_in DATE,
  start_date DATE,
  check_in_history TEXT[] DEFAULT '{}',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id)
);

-- 更新时间戳触发器
DROP TRIGGER IF EXISTS update_user_streaks_updated_at ON public.user_streaks;
CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON public.user_streaks(user_id);

-- =====================================================
-- 3. 用户回答表 (user_answers)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer TEXT NOT NULL,
  day INTEGER,  -- 回答时的打卡天数
  chapter INTEGER,  -- 问题所属章节
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON public.user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_created_at ON public.user_answers(created_at DESC);

-- =====================================================
-- 4. 问题库表 (question_bank)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.question_bank (
  id TEXT PRIMARY KEY,  -- 格式: c1-d1 (章节1-第1天)
  text TEXT NOT NULL,
  chapter INTEGER NOT NULL,  -- 1, 2, 3, 4
  day INTEGER NOT NULL,  -- 1-21
  is_first_day_only BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_question_bank_chapter_day ON public.question_bank(chapter, day);

-- =====================================================
-- 5. 已回答问题记录表 (answered_questions)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.answered_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 索引和唯一约束（避免重复记录同一问题）
CREATE INDEX IF NOT EXISTS idx_answered_questions_user_id ON public.answered_questions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_answered_questions_user_question
  ON public.answered_questions(user_id, question_text);

-- =====================================================
-- 6. 记忆碎片查看记录 (viewed_fragments)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.viewed_fragments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fragment_id TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 索引和唯一约束
CREATE INDEX IF NOT EXISTS idx_viewed_fragments_user_id ON public.viewed_fragments(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_viewed_fragments_user_fragment
  ON public.viewed_fragments(user_id, fragment_id);

-- =====================================================
-- 7. 用户偏好设置表 (user_preferences)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  seen_prologue BOOLEAN DEFAULT FALSE,
  seen_loading BOOLEAN DEFAULT FALSE,
  audio_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 更新时间戳触发器
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. 今日状态表 (daily_states) - 替代 vqm_today
-- =====================================================
CREATE TABLE IF NOT EXISTS public.daily_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,  -- 格式: YYYY-MM-DD
  question_id TEXT,
  question_text TEXT,
  answers JSONB DEFAULT '[]',  -- [{content, timestamp}]
  fragment_unlocked BOOLEAN DEFAULT FALSE,
  checked_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, date)
);

-- 更新时间戳触发器
DROP TRIGGER IF EXISTS update_daily_states_updated_at ON public.daily_states;
CREATE TRIGGER update_daily_states_updated_at
  BEFORE UPDATE ON public.daily_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 索引
CREATE INDEX IF NOT EXISTS idx_daily_states_user_date ON public.daily_states(user_id, date);

-- =====================================================
-- Row Level Security (RLS) 策略
-- =====================================================

-- 启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answered_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewed_fragments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;

-- Profiles: 用户只能读写自己的数据








CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);









CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- User Streaks








CREATE POLICY "Users can view own streak"
  ON public.user_streaks FOR SELECT
  USING (auth.uid() = user_id);









CREATE POLICY "Users can insert own streak"
  ON public.user_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);









CREATE POLICY "Users can update own streak"
  ON public.user_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- User Answers








CREATE POLICY "Users can view own answers"
  ON public.user_answers FOR SELECT
  USING (auth.uid() = user_id);









CREATE POLICY "Users can insert own answers"
  ON public.user_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);









CREATE POLICY "Users can delete own answers"
  ON public.user_answers FOR DELETE
  USING (auth.uid() = user_id);

-- Answered Questions








CREATE POLICY "Users can view own answered questions"
  ON public.answered_questions FOR SELECT
  USING (auth.uid() = user_id);









CREATE POLICY "Users can insert own answered questions"
  ON public.answered_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Viewed Fragments








CREATE POLICY "Users can view own viewed fragments"
  ON public.viewed_fragments FOR SELECT
  USING (auth.uid() = user_id);









CREATE POLICY "Users can insert own viewed fragments"
  ON public.viewed_fragments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Preferences








CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);









CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);









CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Daily States








CREATE POLICY "Users can view own daily states"
  ON public.daily_states FOR SELECT
  USING (auth.uid() = user_id);









CREATE POLICY "Users can insert own daily states"
  ON public.daily_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);









CREATE POLICY "Users can update own daily states"
  ON public.daily_states FOR UPDATE
  USING (auth.uid() = user_id);

-- Question Bank (公开访问，认证用户可读)








CREATE POLICY "Authenticated users can view questions"
  ON public.question_bank FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 初始化问题库数据
-- =====================================================

-- 章节 1：起源 (第1-6天)
INSERT INTO public.question_bank (id, text, chapter, day, is_first_day_only) VALUES
  -- 第1天专属问题（互动性超强）
  ('c1-d1-1', '如果我和你互换身体一天，你会最想让我体验你的哪个时刻？', 1, 1, true),
  ('c1-d1-2', '如果我观察你一整天，我最有可能看到你在做什么？', 1, 1, true),
  ('c1-d1-3', '如果我能读懂你此刻的想法，我会发现什么？', 1, 1, true),
  ('c1-d1-4', '如果我在你旁边坐一天，你会最想和我聊什么？', 1, 1, true),
  -- 第2-6天问题
  ('c1-d2-1', '如果我从所有人中找到你，我会最先注意到你的什么特点？', 1, 2, false),
  ('c1-d2-2', '你现在的心情，如果用人生中的一个场景来形容，会是什么？', 1, 2, false),
  ('c1-d3-1', '如果人生可以重来一次，但只能改变一个选择，你会改变什么？', 1, 3, false),
  ('c1-d3-2', '你最想被别人理解的一个想法是什么？', 1, 3, false),
  ('c1-d4-1', '什么事情会让你突然停下来，开始思考？', 1, 4, false),
  ('c1-d4-2', '如果我能看到你的一整天，我觉得最有趣的部分会是什么？', 1, 4, false),
  ('c1-d5-1', '你现在最想搞清楚的一件事是什么？', 1, 5, false),
  ('c1-d5-2', '如果用一个动作来形容现在的你，会是什么动作？', 1, 5, false),
  ('c1-d6-1', '你每天有多少时间真正属于自己？', 1, 6, false),
  ('c1-d6-2', '如果有人问你"你是谁"，你会怎么回答？', 1, 6, false);

-- 章节 2：观察 (第7-13天)
INSERT INTO public.question_bank (id, text, chapter, day, is_first_day_only) VALUES
  -- 微观/具体问题
  ('c2-d7-1', '你最希望谁能真正理解你一个想法？为什么是TA？', 2, 7, false),
  ('c2-d7-2', '你最怀念和谁的某个时刻？那个时刻有什么特别？', 2, 7, false),
  ('c2-d8-1', '你最想从别人那里得到，但很少说出口的是什么？', 2, 8, false),
  ('c2-d8-2', '如果有一个人能完全读懂你的心思，你会觉得是安慰还是害怕？', 2, 8, false),
  ('c2-d9-1', '让你感到最被理解的时刻，是什么样的？', 2, 9, false),
  ('c2-d9-2', '你最想对一个人说但没说的话是什么？', 2, 9, false),
  ('c2-d10-1', '你有没有一个时刻，突然理解了以前不懂的人？', 2, 10, false),
  ('c2-d10-2', '你觉得人际关系的本质是什么？', 2, 10, false),
  ('c2-d11-1', '你认为好的关系需要什么？', 2, 11, false),
  ('c2-d11-2', '在你看来，孤独和连接哪个更重要？', 2, 11, false),
  ('c2-d12-1', '你觉得关系中的"理解"到底是什么？', 2, 12, false),
  ('c2-d12-2', '你认为一个人应该有多少真正的朋友？', 2, 12, false),
  ('c2-d13-1', '在你看来，关系中的给予和索取应该是什么比例？', 2, 13, false),
  ('c2-d13-2', '你觉得人际关系在人生中占多大的分量？', 2, 13, false);

-- 章节 3：希望 (第14-20天)
INSERT INTO public.question_bank (id, text, chapter, day, is_first_day_only) VALUES
  -- 有趣问题
  ('c3-d14-1', '如果你能拥有一个超能力24小时，你会选什么？想做什么？', 3, 14, false),
  ('c3-d14-2', '如果能在自己额头贴一句话让所有人看到，你会写什么？', 3, 14, false),
  ('c3-d15-1', '如果能给十年后的自己发一条消息，你会说什么？', 3, 15, false),
  ('c3-d15-2', '如果能去任何地方旅行一天，你会去哪里？', 3, 15, false),
  ('c3-d16-1', '如果能给你的生活加一个作弊码，你会加什么？', 3, 16, false),
  ('c3-d16-2', '如果必须在荒岛上生活一年，你会带哪三样东西？', 3, 16, false),
  -- 严肃问题
  ('c3-d17-1', '你觉得人生最重要的是什么？为什么？', 3, 17, false),
  ('c3-d17-2', '什么事情让你觉得"我真的成长了"？', 3, 17, false),
  ('c3-d18-1', '如果可以回到过去的一个时刻重新选择，你会回到什么时候？', 3, 18, false),
  ('c3-d18-2', '你最想成为的人，和现在的你有什么不同？', 3, 18, false),
  ('c3-d19-1', '你觉得自己的人生现在是在上升、下降，还是平稳期？', 3, 19, false),
  ('c3-d19-2', '什么事情让你觉得"我还能做得更好"？', 3, 19, false),
  ('c3-d20-1', '你最想尝试但还没做的一件事是什么？', 3, 20, false),
  ('c3-d20-2', '如果未来是确定的，你会想知道吗？', 3, 20, false);

-- 章节 4：觉醒 (第21天)
INSERT INTO public.question_bank (id, text, chapter, day, is_first_day_only) VALUES
  ('c4-d21-1', '这21天里，你最惊喜地发现了自己的什么？', 4, 21, false),
  ('c4-d21-2', '如果用一个词形容这段旅程，你会选什么词？', 4, 21, false),
  ('c4-d21-3', '什么事情让你觉得"思考真的有用"？', 4, 21, false),
  ('c4-d21-4', '如果要给刚开始这段旅程的自己一句话，你会说什么？', 4, 21, false),
  ('c4-d21-5', '这21天只是一个开始，接下来你想探索什么？', 4, 21, false),
  ('c4-d21-6', '如果用一个动作来形容现在的你，会是什么动作？', 4, 21, false),
  ('c4-d21-7', '你会如何向别人描述这段21天的旅程？', 4, 21, false);

-- =====================================================
-- 完成！
-- =====================================================
-- 验证安装
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM public.profiles
UNION ALL
SELECT 'question_bank', COUNT(*) FROM public.question_bank
UNION ALL
SELECT 'user_streaks', COUNT(*) FROM public.user_streaks
UNION ALL
SELECT 'user_answers', COUNT(*) FROM public.user_answers
UNION ALL
SELECT 'answered_questions', COUNT(*) FROM public.answered_questions
UNION ALL
SELECT 'viewed_fragments', COUNT(*) FROM public.viewed_fragments
UNION ALL
SELECT 'user_preferences', COUNT(*) FROM public.user_preferences
UNION ALL
SELECT 'daily_states', COUNT(*) FROM public.daily_states;
