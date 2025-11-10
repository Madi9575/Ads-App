import React, { useEffect } from 'react';
import { Toast } from '../types';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XIcon } from './icons';

interface ToastMessageProps {
  toast: Toast;
  onDismiss: (id: number) => void;
}

const ToastMessage: React.FC<ToastMessageProps> = ({ toast, onDismiss }) => {
  const icons = {
    success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
    error: <XCircleIcon className="w-6 h-6 text-red-500" />,
    info: <InformationCircleIcon className="w-6 h-6 text-sky-500" />,
  };

  const Icon = icons[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, onDismiss]);

  return (
    <div className="glass-card rounded-2xl flex items-center p-4 w-full max-w-sm animate-fade-in-up">
      <div className="flex-shrink-0">{Icon}</div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-light-text">{toast.message}</p>
      </div>
      <div className="ml-4 flex-shrink-0 flex">
        <button onClick={() => onDismiss(toast.id)} className="inline-flex text-light-text-secondary hover:text-light-text">
          <span className="sr-only">Close</span>
          <XIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  setToasts: React.Dispatch<React.SetStateAction<Toast[]>>;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, setToasts }) => {
  const handleDismiss = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <div className="fixed bottom-0 right-0 p-4 sm:p-6 space-y-3 z-[100]">
      {toasts.map((toast) => (
        <ToastMessage key={toast.id} toast={toast} onDismiss={handleDismiss} />
      ))}
    </div>
  );
};

export default ToastContainer;