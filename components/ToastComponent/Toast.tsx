import React, { useEffect, useState } from 'react';
import { useCallback } from 'react';
import {ToastProps} from "@/types/toast"

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
    const [visible, setVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    const [progress, setProgress] = useState(100);

    const handleRemove = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            setVisible(false);
            onRemove(toast.id);
        }, 400);
    }, [onRemove, toast.id]);
    
    useEffect(() => {
        if (toast.duration) {
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev - (100 / ((toast.duration ?? 0) / 50));
                    return newProgress > 0 ? newProgress : 0;
                });
            }, 50);
    
            const timer = setTimeout(() => {
                handleRemove();
            }, toast.duration);
    
            return () => {
                clearTimeout(timer);
                clearInterval(progressInterval);
            };
        }
    }, [toast.duration, onRemove, toast.id, handleRemove]);

    if (!visible) return null;

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            case 'error':
                return (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            case 'info':
                return (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            case 'warning':
                return (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            default: return null;
        }
    };

    const getToastStyles = () => {
        const baseStyles = `
            relative overflow-hidden backdrop-blur-sm border-0 rounded-2xl shadow-2xl
            transform transition-all duration-400 ease-out
            hover:scale-105 hover:shadow-3xl
        `;

        switch (toast.type) {
            case 'success':
                return `${baseStyles} bg-gradient-to-r from-green-50/90 to-emerald-50/90 border border-green-200/50`;
            case 'error':
                return `${baseStyles} bg-gradient-to-r from-red-50/90 to-rose-50/90 border border-red-200/50`;
            case 'info':
                return `${baseStyles} bg-gradient-to-r from-blue-50/90 to-sky-50/90 border border-blue-200/50`;
            case 'warning':
                return `${baseStyles} bg-gradient-to-r from-yellow-50/90 to-orange-50/90 border border-yellow-200/50`;
            default:
                return `${baseStyles} bg-white/90 border border-gray-200/50`;
        }
    };

    const getProgressBarColor = () => {
        switch (toast.type) {
            case 'success': return 'bg-gradient-to-r from-green-400 to-green-600';
            case 'error': return 'bg-gradient-to-r from-red-400 to-red-600';
            case 'info': return 'bg-gradient-to-r from-blue-400 to-blue-600';
            case 'warning': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
            default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
        }
    };

    return (
        <div
            className={`
                ${getToastStyles()}
                ${isExiting ? 'translate-x-full opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'}
                flex items-center p-5 mb-4 min-w-80 max-w-md
            `}
        >
            {/* Progress Bar */}
            {toast.duration && (
                <div className="absolute top-0 left-0 h-1 bg-black/10 w-full rounded-t-2xl">
                    <div
                        className={`h-full rounded-t-2xl transition-all duration-75 ease-linear ${getProgressBarColor()}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-white/20 rounded-2xl" />

            {/* Content */}
            <div className="relative flex items-center w-full">
                <div className="flex-shrink-0">
                    {getIcon()}
                </div>

                <div className="ml-4 flex-grow">
                    <p className="text-gray-800 font-semibold text-sm leading-relaxed">
                        {toast.message}
                    </p>
                </div>

                <button
                    onClick={handleRemove}
                    className="
                        ml-4 flex-shrink-0 w-8 h-8 rounded-full
                        bg-black/10 hover:bg-black/20 backdrop-blur-sm
                        flex items-center justify-center
                        transition-all duration-200 ease-out
                        hover:scale-110 active:scale-95
                        group
                    "
                    aria-label="ปิดการแจ้งเตือน"
                >
                    <svg
                        className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-colors"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Toast;