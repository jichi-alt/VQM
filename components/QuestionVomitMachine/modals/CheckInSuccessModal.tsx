import React, { useState, useEffect } from 'react';
import { X, Activity, Trophy } from 'lucide-react';

interface CheckInSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => boolean;  // 返回是否有可用的碎片
  day: number;
  isCompleted: boolean;
}

/**
 * CheckInSuccessModal - 打卡成功弹窗组件
 */
export const CheckInSuccessModal = ({ isOpen, onClose, onUnlock, day, isCompleted }: CheckInSuccessModalProps) => {
  const [showButton, setShowButton] = useState(false);
  const [isMilestone, setIsMilestone] = useState(false);
  const [exploding, setExploding] = useState(false);
  const [hasUnlockedFragment, setHasUnlockedFragment] = useState(false);

  // 判断是否是里程碑
  useEffect(() => {
    if (isOpen) {
      const milestone = day === 7 || day === 14 || day === 21;
      setIsMilestone(milestone);

      // 里程碑触发爆炸效果
      if (milestone) {
        setTimeout(() => setExploding(true), 200);
      }

      // 延迟显示按钮
      setTimeout(() => {
        setShowButton(true);
      }, 1500);
    } else {
      setShowButton(false);
      setExploding(false);
    }
  }, [isOpen, day]);

  if (!isOpen) return null;

  // 里程碑天数特殊文案
  const getMilestoneText = () => {
    if (day === 7) return "第一个周期完成！";
    if (day === 14) return "一半的路程！";
    if (day === 21) return "全部完成！";
    return "太好了，人类！";
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-300 ${
      exploding ? 'bg-amber-400/30' : 'bg-black/70'
    } transition-colors duration-300`}>
      {/* 超级夸张的粒子爆炸效果 */}
      {isMilestone && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* 放射光芒 */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`ray-${i}`}
              className="absolute left-1/2 top-1/2 w-1 h-40 bg-gradient-to-t from-amber-400 to-transparent opacity-60"
              style={{
                transform: `translateX(-50%) translateY(-50%) rotate(${i * 30}deg)`,
                animation: `rayExpand 1s ease-out ${i * 0.05}s forwards`,
                transformOrigin: 'center top',
              }}
            />
          ))}

          {/* 大量彩色粒子 */}
          {Array.from({ length: 60 }).map((_, i) => {
            const size = Math.random() * 8 + 4;
            const angle = (i / 60) * 360;
            const distance = Math.random() * 200 + 100;
            const colors = ['#fbbf24', '#fde047', '#fb923c', '#22d3ee', '#a78bfa', '#f472b6'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            return (
              <div
                key={i}
                className="absolute rounded-full shadow-lg"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: '50%',
                  top: '50%',
                  marginLeft: `-${size/2}px`,
                  marginTop: `-${size/2}px`,
                  backgroundColor: color,
                  animation: `particleExplode 1.5s ease-out ${Math.random() * 0.5}s forwards`,
                  '--tx': `${Math.cos(angle * Math.PI / 180) * distance}px`,
                  '--ty': `${Math.sin(angle * Math.PI / 180) * distance}px`,
                  zIndex: 100,
                } as React.CSSProperties}
              />
            );
          })}

          {/* 星星闪烁 */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute text-6xl"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animation: `starTwinkle 0.8s ease-in-out ${i * 0.1}s`,
                opacity: 0,
              }}
            >
              ⭐
            </div>
          ))}
        </div>
      )}

      <div className={`w-[320px] bg-space-850/90 backdrop-blur-md border-2 shadow-[6px_6px_0px_0px_rgba(251,191,36,0.3)] animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden hologram relative ${
        isMilestone ? 'border-amber-300 scale-110' : 'border-amber-400'
      }`}>
        {/* 顶部装饰条 */}
        <div className={`h-2 ${isMilestone ? 'bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300' : 'bg-amber-400/90'}`}></div>

        {/* 关闭按钮 */}
        <div className="flex justify-end px-3 py-2">
          <button onClick={onClose} className="text-cyan-400/60 hover:text-amber-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* 主要内容 */}
        <div className="px-6 pb-6 pt-2 text-center">
          {/* 奖杯图标（完成态）或活动图标（进行中） */}
          <div className="flex justify-center mb-4">
            {isCompleted ? (
              <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/50 animate-[badgeBounce_1s_ease-out]">
                <Trophy size={32} className="text-space-900" />
              </div>
            ) : (
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                isMilestone
                  ? 'bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-amber-300 shadow-amber-400/70'
                  : 'bg-space-800 border-2 border-amber-400/50'
              }`}>
                <Activity size={32} className={isMilestone ? 'text-space-900' : 'text-amber-400'} />
              </div>
            )}
          </div>

          {/* 里程碑徽章 */}
          {isMilestone && (
            <div className="mb-3 animate-[badgeSlideIn_0.5s_ease-out]">
              <span className="inline-block bg-amber-400 text-space-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                🏆 里程碑成就
              </span>
            </div>
          )}

          {/* 核心文案 */}
          <p className={`text-lg font-black mb-2 leading-relaxed ${isMilestone ? 'text-amber-300 scale-110' : 'text-amber-100'}`}>
            {getMilestoneText()}
          </p>
          <p className={`mb-6 tracking-tight ${isMilestone ? 'text-2xl text-amber-300 glow-text scale-110' : 'text-xl text-amber-400'}`}>
            这是你主动思考的第 {day} 天
          </p>

          {/* 进度可视化 */}
          <div className="flex gap-[1px] mb-6 h-2 justify-center progress-pipe">
            {[...Array(21)].map((_, i) => {
              const isActive = i < day;
              const isToday = i === day - 1;
              return (
                <div
                  key={i}
                  className={`w-1.5 rounded-[1px] progress-segment transition-all duration-500 ${
                    isActive
                      ? isCompleted || isToday
                        ? 'bg-amber-400 progress-segment-active animate-pulse'
                        : 'bg-amber-400/60'
                      : 'bg-space-700'
                  }`}
                ></div>
              );
            })}
          </div>

          {/* 继续按钮 - 延迟显示 */}
          <button
            onClick={() => {
              console.log('[CheckInSuccessModal] 点击继续按钮');
              onClose();
              console.log('[CheckInSuccessModal] onClose 已调用，准备触发 onUnlock');
              try {
                console.log('[CheckInSuccessModal] 调用 onUnlock');
                const hasFragment = onUnlock();
                setHasUnlockedFragment(hasFragment);

                if (!hasFragment) {
                  console.log('[CheckInSuccessModal] 没有可用碎片，准备跳转');
                  setTimeout(() => {
                    console.log('[CheckInSuccessModal] 触发跳转到历史页面事件');
                    window.dispatchEvent(new CustomEvent('qvm-navigate-to-history'));
                  }, 1000);
                }
              } catch (error) {
                console.error('[CheckInSuccessModal] onUnlock 调用失败:', error);
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('qvm-navigate-to-history'));
                }, 1000);
              }
            }}
            className={`w-full bg-space-800 hover:bg-space-700 text-amber-100 border border-amber-400/30 font-bold py-3 px-4 hover:border-amber-400/50 transition-all flex items-center justify-center gap-2 btn-3d btn-glow relative ${
              showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transition: 'all 0.5s ease-out' }}
          >
            <span>继续</span>
            <span className="text-amber-400">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
