/**
 * useDailyState - 每日状态管理 Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { getDailyState, saveDailyState, type DailyState } from '../../services/dataService';

const createEmptyDailyState = (): DailyState => ({
  date: new Date().toISOString().split('T')[0],
  answers: [],
  fragmentUnlocked: false,
  checkedIn: false,
});

export const useDailyState = (userId?: string) => {
  const [dailyState, setDailyState] = useState<DailyState>(createEmptyDailyState());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDailyState = async () => {
      const data = await getDailyState(userId);
      if (data) {
        setDailyState(data);
      } else {
        setDailyState(createEmptyDailyState());
      }
      setLoading(false);
    };
    loadDailyState();
  }, [userId]);

  const updateDailyState = useCallback(async (updates: Partial<DailyState>) => {
    const newState = { ...dailyState, ...updates };
    setDailyState(newState);
    await saveDailyState(newState, userId);
  }, [dailyState, userId]);

  const addAnswer = useCallback(async (content: string) => {
    const newAnswers = [
      ...dailyState.answers,
      { content, timestamp: new Date().toISOString() },
    ];
    await updateDailyState({ answers: newAnswers });
  }, [dailyState, updateDailyState]);

  const setQuestion = useCallback(async (questionId: string, questionText: string) => {
    await updateDailyState({ questionId, questionText });
  }, [updateDailyState]);

  const markCheckedIn = useCallback(async () => {
    await updateDailyState({ checkedIn: true });
  }, [updateDailyState]);

  const unlockFragment = useCallback(async () => {
    await updateDailyState({ fragmentUnlocked: true });
  }, [updateDailyState]);

  return {
    dailyState,
    loading,
    updateDailyState,
    addAnswer,
    setQuestion,
    markCheckedIn,
    unlockFragment,
  };
};
