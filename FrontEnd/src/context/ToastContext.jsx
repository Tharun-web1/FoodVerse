import { createContext, useState, useContext, useCallback } from 'react';
import './Toast.css';

const ToastContext = createContext(null);

const ICON_MAP = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, closing: true } : t));
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 400); // Match CSS animation time
    }, []);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, closing: false }]);
        setTimeout(() => removeToast(id), 5000); // Standard duration
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container-custom">
                {toasts.map(toast => (
                    <div 
                        key={toast.id} 
                        className={`toast-custom toast-${toast.type} ${toast.closing ? 'hide' : ''}`}
                    >
                        <div className="toast-icon">{ICON_MAP[toast.type]}</div>
                        <div className="toast-message">{toast.message}</div>
                        <button onClick={() => removeToast(toast.id)} className="toast-close">
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
