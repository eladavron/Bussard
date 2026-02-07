'use client';

import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface BaseModalProps {
    title: ReactNode | string;
    isOpen: boolean;
    onClose?: () => void;
    body: ReactNode;
    footer?: ReactNode;
    className?: string;
}

export default function BaseModal({ title, isOpen, onClose, body, footer, className }: BaseModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!mounted) {
        return null;
    }

    return createPortal(
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-auto"
                    onClick={onClose ? () => onClose() : undefined}
                >
                    <div
                        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 relative w-full flex flex-col max-h-[calc(100vh-6rem)] my-auto ${className || 'max-w-md'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                                aria-label="Close modal"
                            >
                                ✕
                            </button>
                        )}

                        <h2 className="text-xl font-bold mb-4 text-primary">{title}</h2>

                        <div className="flex-1 overflow-y-auto min-h-0">
                            {body}
                        </div>

                        {footer && (
                            <div className="flex justify-end gap-3 mt-6">
                                {footer}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>,
        window.document.body,
    );
}
