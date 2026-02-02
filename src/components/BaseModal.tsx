'use client';

import { ReactNode } from 'react';

interface BaseModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    body: ReactNode;
    footer?: ReactNode;
    className?: string;
    fullWidth?: boolean;
}

export default function BaseModal({ title, isOpen, onClose, body, footer, fullWidth }: BaseModalProps) {
    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div
                        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 relative flex flex-col w-full ${fullWidth ? 'md:max-w-[90vw] max-w-[calc(100vw-2rem)]' : 'max-w-md'}`}
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

                        <div className="flex-1 mb-6">
                            {body}
                        </div>

                        {footer && (
                            <div className="flex justify-end gap-3">
                                {footer}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
