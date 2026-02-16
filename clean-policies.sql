-- =====================================================
-- 清理所有旧的 RLS 策略
-- 在 Supabase SQL Editor 中单独执行这个文件
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own streak" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can insert own streak" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can update own streak" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can view own answers" ON public.user_answers;
DROP POLICY IF EXISTS "Users can insert own answers" ON public.user_answers;
DROP POLICY IF EXISTS "Users can delete own answers" ON public.user_answers;
DROP POLICY IF EXISTS "Users can view own answered questions" ON public.answered_questions;
DROP POLICY IF EXISTS "Users can insert own answered questions" ON public.answered_questions;
DROP POLICY IF EXISTS "Users can view own viewed fragments" ON public.viewed_fragments;
DROP POLICY IF EXISTS "Users can insert own viewed fragments" ON public.viewed_fragments;
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can view own daily states" ON public.daily_states;
DROP POLICY IF EXISTS "Users can insert own daily states" ON public.daily_states;
DROP POLICY IF EXISTS "Users can update own daily states" ON public.daily_states;
DROP POLICY IF EXISTS "Authenticated users can view questions" ON public.question_bank;

SELECT '所有旧策略已清理完成！' as status;
