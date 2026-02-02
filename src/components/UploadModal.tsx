'use client';

import { useState, useRef, useEffect } from 'react';
import BaseModal from './BaseModal';
import { url } from 'node:inspector';

interface UploadModalProps {
    title: string;
    message: string;
    onUpload: (formData: FormData) => Promise<void>;
    onURL?: (url: string) => Promise<void> | undefined;
    onClose: () => void;
    isOpen: boolean;
}

export default function UploadModal({ title, message, onUpload, onURL, onClose, isOpen }: UploadModalProps) {

    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [urlInput, setUrlInput] = useState<string>('');
    const [urlError, setUrlError] = useState<string>('');
    const [urlValid, setUrlValid] = useState<boolean>(false);
    const [urlChecking, setUrlChecking] = useState<boolean>(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const checkUrlAvailability = async (url: string) => {
        if (!url) {
            setUrlError('');
            setUrlChecking(false);
            setUrlValid(false);
            return;
        }

        try {
            new URL(url);
        } catch {
            setUrlError('Please enter a valid URL');
            setUrlChecking(false);
            setUrlValid(false);
            return;
        }

        setUrlChecking(true);
        try {
            // Try to load the image to verify it's actually an image
            const img = new Image();
            img.crossOrigin = 'anonymous';

            const loadPromise = new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error('Failed to load image'));
            });

            img.src = url;
            await loadPromise;

            setUrlError('');
            setUrlValid(true);
            setUrlChecking(false);
        } catch {
            setUrlError('URL must point to a valid image');
            setUrlValid(false);
            setUrlChecking(false);
        }
    };

    const validateUrl = (url: string) => {
        // Clear previous debounce timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Debounce the availability check
        debounceTimer.current = setTimeout(() => {
            checkUrlAvailability(url);
        }, 800);
    };

    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    return (
        <BaseModal title={title} message={message} isOpen={isOpen} onClose={onClose}>
            <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);

                if (!formData.get('image') && !formData.get('imageUrl')) {
                    alert('Please select a file or enter a URL.'); //TODO: Form validation popup
                    return;
                }

                if (formData.get('image') && formData.get('imageUrl')) {
                    alert('Please provide only one image source, either upload a file or enter a URL.'); //TODO: Prevent by disabling file upload if URL is not empty
                    return;
                }

                if (onURL) {
                    const url = formData.get('imageUrl') as string;
                    await onURL(url);
                }
                else if (onUpload) {
                    await onUpload(formData);
                }
                onClose();
            }}>

                <div className="mb-6">
                    <label className="label-primary">
                        Upload:
                    </label>
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        className={`file-input-upload ${urlInput ? 'disabled' : ''}`}
                        onChange={(e) => {
                            const file = e.target.files ? e.target.files[0] : null;
                            setUploadedFile(file);
                        }}
                        disabled={urlInput ? true : false}
                    />
                </div>
                {onURL && (
                    <div className={`label-muted mb-4 ${uploadedFile ? 'disabled' : ''}`}>
                        <label className="label-secondary">Or enter URL:</label>
                        <input
                            type="url"
                            name="imageUrl"
                            placeholder="https://example.com/image.jpg"
                            className={urlError ? 'input-error' : (urlValid ? 'input-valid' : 'input-default')}
                            disabled={uploadedFile ? true : false}
                            value={urlInput}
                            onChange={(e) => {
                                setUrlInput(e.target.value);
                                validateUrl(e.target.value);
                            }}
                            onBlur={() => {
                                if (urlInput) {
                                    validateUrl(urlInput);
                                }
                            }}
                        />
                        {urlChecking && <p className="input-message-info">Checking URL...</p>}
                        {urlError && <p className="input-message-error">{urlError}</p>}
                    </div>
                )}
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="button-secondary">Cancel</button>
                    <button type="submit" className={`button-primary ${urlError !== '' || urlChecking || (!uploadedFile && !urlInput) ? 'disabled' : ''}`} disabled={urlError !== '' || urlChecking || (!uploadedFile && !urlInput)}>
                        Upload
                    </button>
                </div>
            </form>
        </BaseModal>
    );
}
