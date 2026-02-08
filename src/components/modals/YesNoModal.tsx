'use client';

import BaseModal from './BaseModal';

interface YesNoModalProps {
    title: string;
    message: string;
    onConfirm: () => Promise<void> | void;
    onCancel: () => void;
    isOpen: boolean;
}

export default function YesNoModal({ title, message, onConfirm, onCancel, isOpen }: YesNoModalProps) {
    return (
        <BaseModal
            title={title}
            isOpen={isOpen}
            onClose={onCancel}
            body={<p className="text-primary">{message}</p>}
            footer={
                <>
                    <button type="button" onClick={onCancel} className="button-secondary">
                        No
                    </button>
                    <button type="button" onClick={onConfirm} className="button-primary">
                        Yes
                    </button>
                </>
            }
        />
    );
}
