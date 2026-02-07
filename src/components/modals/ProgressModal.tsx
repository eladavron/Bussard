import { Alert } from '@heroui/react';
import BaseModal from './BaseModal';

interface ProgressModalProps {
    title: string;
    message: string;
    isOpen: boolean;
    progress: number; // 0 to 100
    errors?: string[]; // Optional array of error messages
    warnings?: string[]; // Optional array of warning messages
}

export default function ProgressModal({ title, message, isOpen, progress, errors, warnings, onClose }: ProgressModalProps & { onClose: () => void }) {
    return (
        <BaseModal
            title={title}
            isOpen={isOpen}
            onClose={progress < 100 ? undefined : onClose}
            footer={progress >= 100 ? (
                <button
                    onClick={onClose}
                    className="button-primary"
                >
                    Close
                </button>
            ) : undefined}
            className={(warnings && warnings.length > 0) || (errors && errors.length > 0) ? 'w-3/4' : 'w-1/2'}
            body={
                <>
                    <div className="mb-6">
                        <p className="mb-4 text-primary">{message}</p>
                        <progress className="progress w-full" value={progress} max={100}></progress>
                    </div>
                    {errors && errors.length > 0 && (
                        <div className="mt-4 flex flex-col gap-2">
                            {errors.map((error, index) => (
                                <Alert key={index} color="danger" className="alert alert-danger">{error}</Alert>
                            ))}
                        </div>
                    )}
                    {warnings && warnings.length > 0 && (
                        <div className="mt-4 flex flex-col gap-2">
                            {warnings.map((warning, index) => (
                                <Alert key={index} color="warning" className="alert alert-warning">{warning}</Alert>
                            ))}
                        </div>
                    )}
                </>
            }
        />
    );
}