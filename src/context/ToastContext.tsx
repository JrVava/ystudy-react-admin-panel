import React, { createContext, useContext, useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

type ToastFunction = (message: string, duration?: number) => void;

interface ToastHelper {
  success: ToastFunction;
  error: ToastFunction;
  warning: ToastFunction;
  info: ToastFunction;
}

let activeToastEmitter: ((message: string, type: 'success' | 'error' | 'warning' | 'info', duration?: number) => void) | null = null;

export const toast: ToastHelper = {
  success: (message, duration) => {
    if (activeToastEmitter) activeToastEmitter(message, 'success', duration);
    else console.log('Toast: ', message);
  },
  error: (message, duration) => {
    if (activeToastEmitter) activeToastEmitter(message, 'error', duration);
    else console.error('Toast error: ', message);
  },
  warning: (message, duration) => {
    if (activeToastEmitter) activeToastEmitter(message, 'warning', duration);
    else console.warn('Toast warning: ', message);
  },
  info: (message, duration) => {
    if (activeToastEmitter) activeToastEmitter(message, 'info', duration);
    else console.info('Toast info: ', message);
  }
};

const ToastContext = createContext<any>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  useEffect(() => {
    activeToastEmitter = addToast;
    return () => {
      activeToastEmitter = null;
    };
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  return useContext(ToastContext);
};

const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '380px',
        width: 'calc(100% - 48px)',
        pointerEvents: 'none',
        alignItems: 'center',
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={18} style={{ color: 'var(--success)' }} />;
      case 'error':
        return <AlertCircle size={18} style={{ color: 'var(--error)' }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />;
      case 'info':
      default:
        return <Info size={18} style={{ color: 'var(--info)' }} />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'rgba(16, 185, 129, 0.4)';
      case 'error':
        return 'rgba(244, 63, 94, 0.4)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.4)';
      case 'info':
      default:
        return 'rgba(6, 182, 212, 0.4)';
    }
  };

  const getGlow = () => {
    switch (toast.type) {
      case 'success':
        return 'rgba(16, 185, 129, 0.12)';
      case 'error':
        return 'rgba(244, 63, 94, 0.12)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.12)';
      case 'info':
      default:
        return 'rgba(6, 182, 212, 0.12)';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: 'rgba(11, 15, 25, 0.9)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${getBorderColor()}`,
        borderRadius: '12px',
        boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.4), 0 0 15px ${getGlow()}`,
        color: '#ffffff',
        pointerEvents: 'auto',
        animation: 'toast-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {getIcon()}
      </div>
      <div style={{ flexGrow: 1, fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.4 }}>
        {toast.message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <X size={14} />
      </button>
    </div>
  );
};
