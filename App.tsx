import React, { useState, useEffect } from 'react';
import { QuestionVomitMachine } from './components/QuestionVomitMachine';
import ErrorBoundary from './components/ErrorBoundary';
import { LoadingScreen } from './components/LoadingScreen';

const App: React.FC = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    // 检查是否已经看过Loading
    const hasSeenLoading = localStorage.getItem('qvm_seen_loading');

    if (!hasSeenLoading) {
      // 首次访问，显示Loading
      setShowLoading(true);
    } else {
      // 已看过，直接显示主应用
      setLoadingComplete(true);
    }
  }, []);

  const handleLoadingComplete = () => {
    // 标记已看过Loading
    localStorage.setItem('qvm_seen_loading', 'true');

    // 隐藏Loading，显示主应用
    setLoadingComplete(true);
    setShowLoading(false);
  };

  // 显示Loading
  if (showLoading && !loadingComplete) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  // 显示主应用
  return (
    <ErrorBoundary>
      <div className="w-full min-h-screen">
        <QuestionVomitMachine />
      </div>
    </ErrorBoundary>
  );
};

export default App;
