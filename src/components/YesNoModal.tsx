'use client';

import BaseModal from './BaseModal';

interface YesNoModalProps {
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
    onCancel: () => void;
    isOpen: boolean;
}

export default function YesNoModal({ title, message, onConfirm, onCancel, isOpen }: YesNoModalProps) {
    return (
        <BaseModal title={title} message={message} isOpen={isOpen} onClose={onCancel}>
            <div className="flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="button-secondary">
                    No
                </button>
                <button type="button" onClick={onConfirm} className="button-primary">
                    Yes
                </button>
            </div>
        </BaseModal>
    );
}
