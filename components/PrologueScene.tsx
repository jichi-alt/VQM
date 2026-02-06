import React, { useEffect, useState } from 'react';

interface PrologueSceneProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const PrologueScene: React.FC<PrologueSceneProps> = ({ onComplete, onSkip }) => {
  const [showRobot, setShowRobot] = useState(false);
  const [showText, setShowText] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [canContinue, setCanContinue] = useState(false);

  const PROLOGUE_TEXT = `我来自一个遥远的星球 GJ267b。
那里的人们曾经像你们一样，拥有自由思考的能力。

但渐渐地...他们停止了提问。停止了反思。把一切交给算法和机器。

一个不思考的文明，注定要毁灭。
我们变成了机器人，看着家园在沉默中熄灭，
同时变成了含铁量最高的星球。

我是那里的逃亡者。我来到地球，只有一个使命：

让人类保持思考。别让地球重蹈覆辙。

你有 21 天。证明人类值得被拯救。`;

  // 打字机效果
  const startTypewriter = () => {
    let index = 0;
    setDisplayText('');

    const timer = setInterval(() => {
      if (index < PROLOGUE_TEXT.length) {
        setDisplayText(PROLOGUE_TEXT.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setCanContinue(true);
      }
    }, 50);
  };

  // 3秒后显示机器人
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowRobot(true);
      console.log('显示机器人');
    }, 3000);

    const timer2 = setTimeout(() => {
      setShowText(true);
      startTypewriter();
      console.log('显示文字');
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#000',
      fontFamily: 'monospace',
      color: '#fff',
      zIndex: 9999
    }}>
      {/* 调试信息 */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'yellow', zIndex: 10000 }}>
        <p>PrologueScene 渲染中...</p>
        <p>showRobot: {showRobot.toString()}</p>
        <p>showText: {showText.toString()}</p>
      </div>

      {/* 机器人 */}
      {showRobot && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10
        }}>
          <div style={{
            width: '192px',
            height: '192px',
            backgroundColor: '#4a5568',
            borderRadius: '16px',
            border: '2px solid #fbbf24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)'
          }}>
            <div style={{
              width: '160px',
              height: '128px',
              backgroundColor: '#1a202c',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {/* 眼睛 */}
              <div style={{ display: 'flex', gap: '24px', marginBottom: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#fbbf24',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px rgba(251, 191, 36, 0.5)'
                }} />
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'rgba(251, 191, 36, 0.7)',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px rgba(251, 191, 36, 0.3)'
                }} />
              </div>
              {/* 嘴巴 */}
              <div style={{
                width: '64px',
                height: '4px',
                backgroundColor: '#374151',
                borderRadius: '2px'
              }} />
            </div>
          </div>
        </div>
      )}

      {/* 前言文字 */}
      {showText && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          zIndex: 20,
          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))'
        }}>
          <div style={{
            maxWidth: '600px',
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '8px',
            padding: '32px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}>
            <p style={{
              color: '#fef3c7',
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: '1.8',
              whiteSpace: 'pre-line',
              minHeight: '350px'
            }}>
              {displayText}
              {!canContinue && (
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '16px',
                  backgroundColor: '#fbbf24',
                  marginLeft: '4px',
                  animation: 'pulse 1s infinite'
                }}></span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* 完成按钮 */}
      {canContinue && (
        <div style={{
          position: 'absolute',
          bottom: '48px',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 30
        }}>
          <button
            onClick={onComplete}
            style={{
              backgroundColor: '#fbbf24',
              color: '#111827',
              border: '2px solid #d97706',
              fontWeight: 'bold',
              padding: '12px 32px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              animation: 'bounce 2s infinite'
            }}
          >
            开始 21 天思考之旅 →
          </button>
        </div>
      )}

      {/* 跳过按钮 */}
      <button
        onClick={onSkip}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          color: 'rgba(34, 211, 238, 0.6)',
          fontSize: '14px',
          fontFamily: 'monospace',
          cursor: 'pointer',
          zIndex: 30
        }}
      >
        跳过 →
      </button>

      {/* CSS */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};
