'use client';

import { ReactNode } from 'react';

interface BaseModalProps {
    title: string;
    message: string;
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

export default function BaseModal({ title, message, isOpen, onClose, children }: BaseModalProps) {
    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                            aria-label="Close modal"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-bold mb-4 text-primary">{title}</h2>
                        <p className="text-primary mb-6">{message}</p>

                        {children}
                    </div>
                </div>
            )}
        </>
    );
}
