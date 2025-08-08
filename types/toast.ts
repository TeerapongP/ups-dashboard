export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

export interface ToastProps {
    toast: {
        id: string;
        type: Toast['type'];
        message: string;
        duration?: number;
    };
    onRemove: (id: string) => void;
}