import React from 'react';
import { X } from 'lucide-react';

interface SilentObserverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

/**
 * SilentObserverModal - 确认弹窗组件
 */
export const SilentObserverModal = ({ isOpen, onClose, onConfirm, message }: SilentObserverModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[300px] bg-space-850/90 backdrop-blur-md border border-cyan-400/30 shadow-[4px_4px_0px_0px_rgba(34,211,238,0.2)] animate-in zoom-in-95 duration-200 flex flex-col hologram">
        <div className="flex justify-end px-2 py-2">
          <button onClick={onClose} className="text-cyan-400/60 hover:text-amber-400 transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="px-6 pb-2 pt-0">
          <p className="text-sm text-amber-100 font-bold leading-relaxed text-center whitespace-pre-line">
            {message}
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 p-6">
          <button onClick={onClose} className="text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors px-4 py-2">
            取消
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className="text-xs font-bold text-space-900 bg-amber-400 hover:bg-amber-300 px-6 py-2 transition-colors border border-transparent rounded btn-3d">
            确定
          </button>
        </div>
      </div>
    </div>
  );
};
