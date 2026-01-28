'use client';

import { useState } from 'react';
import { uploadMovieImage } from '../app/actions';

interface YesNoModalProps {
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
    onCancel: () => void;
    isOpen: boolean;
}

export default function YesNoModal({ title, message, onConfirm, onCancel, isOpen }: YesNoModalProps) {
    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onCancel}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-bold mb-4 text-gray-900">{title}</h2>
                        <p className="text-primary">{message}</p>
                        <div className="flex justify-end gap-3 mt-6">
                            <button type="button" onClick={onCancel} className="button-secondary">
                                No
                            </button>
                            <button type="button" onClick={onConfirm} className="button-primary">
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
