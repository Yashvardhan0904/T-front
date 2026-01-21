'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right-full fade-in duration-300 ${toast.type === 'success' ? 'bg-white dark:bg-gray-800 border-green-500/20 text-gray-900 dark:text-white' :
                                toast.type === 'error' ? 'bg-white dark:bg-gray-800 border-red-500/20 text-gray-900 dark:text-white' :
                                    'bg-white dark:bg-gray-800 border-blue-500/20 text-gray-900 dark:text-white'
                            }`}
                        role="alert"
                    >
                        <div className={`p-1 rounded-full ${toast.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                                toast.type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                                    'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                            }`}>
                            {toast.type === 'success' && <CheckCircle className="w-4 h-4" />}
                            {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
                            {toast.type === 'info' && <Info className="w-4 h-4" />}
                        </div>
                        <p className="text-sm font-medium">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
