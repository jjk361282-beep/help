import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const getAlertClass = () => {
    switch (toast.type) {
      case 'success':
        return 'alert-success text-white bg-emerald-600 border-emerald-600';
      case 'error':
        return 'alert-error text-white bg-rose-600 border-rose-600';
      case 'info':
      default:
        return 'alert-info text-white bg-slate-900 border-slate-900';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 shrink-0" />;
      default:
        return <Info className="w-5 h-5 shrink-0" />;
    }
  };

  return (
    <div className="toast toast-top toast-end z-50 p-4">
      <div className={`alert shadow-xl rounded-2xl flex items-center gap-3 px-4 py-3 ${getAlertClass()}`}>
        {getIcon()}
        <div className="text-sm font-medium pr-2">
          {toast.message}
        </div>
        <button
          onClick={onClose}
          className="btn btn-ghost btn-xs btn-circle text-white/80 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
