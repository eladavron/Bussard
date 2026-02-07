import { Alert } from '@heroui/react';
import BaseModal from './BaseModal';
import { ImportError } from '@/src/types/import_error';
import { downloadData } from '@/src/lib/global';

interface ProgressModalProps {
    title: string;
    message: string;
    isOpen: boolean;
    progress: number; // 0 to 100
    errors?: ImportError[]; // Optional array of error messages
    warnings?: ImportError[]; // Optional array of warning messages
}

export default function ProgressModal({ title, message, isOpen, progress, errors, warnings, onClose }: ProgressModalProps & { onClose: () => void }) {
    return (
        <BaseModal
            title={title}
            isOpen={isOpen}
            onClose={progress < 100 ? undefined : onClose}
            footer={progress >= 100 ? (
                <div className="flex flex-row gap-2 justify-end">
                    {(warnings && warnings.length > 0) || (errors && errors.length > 0) ? (
                        <button className="button-secondary" onClick={() => {
                            const jsonContent = {
                                warnings: (warnings && warnings.length > 0) ? warnings.map(w => w.message) : [],
                                errors: (errors && errors.length > 0) ? errors.map(e => e.message) : [],
                            };
                            downloadData(jsonContent, 'import_issues.json');
                        }}>
                            Export Failures
                        </button>
                    ) : null}
                    <button
                        onClick={onClose}
                        className="button-primary"
                    >
                        Close
                    </button>
                </div>
            ) : undefined}
            className={(warnings && warnings.length > 0) || (errors && errors.length > 0) ? 'max-w-3/4' : 'max-w-1/2'}
            body={
                <>
                    <div className="mb-6">
                        <p className="mb-4 text-primary">{message}</p>
                        <progress className="progress w-full" value={progress} max={100}></progress>
                    </div>
                    {errors && errors.length > 0 && (
                        <div className="mt-4 flex flex-col gap-2">
                            {errors.map((error, index) => (
                                <Alert key={index} color="danger" className="alert alert-danger">{error.message}</Alert>
                            ))}
                        </div>
                    )}
                    {warnings && warnings.length > 0 && (
                        <div className="mt-4 flex flex-col gap-2">
                            {warnings.map((warning, index) => (
                                <Alert key={index} color="warning" className="alert alert-warning">{warning.message}</Alert>
                            ))}
                        </div>
                    )}
                </>
            }
        />
    );
}