'use client';

import { useState } from 'react';
import BaseModal from './BaseModal';
import InputWithValidation from '../InputWithValidation';

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
    const [urlValid, setUrlValid] = useState<boolean>(false);

    const validateImageUrl = async (url: string): Promise<void> => {
        if (!url) {
            return;
        }

        try {
            new URL(url);
        } catch {
            throw new Error('Please enter a valid URL');
        }

        // Try to load the image to verify it's actually an image
        const img = new Image();
        img.crossOrigin = 'anonymous';

        return new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('URL must point to a valid image'));
            img.src = url;
        });
    };

    return (
        <BaseModal
            title={title}
            isOpen={isOpen}
            onClose={onClose}
            body={
                <form id="upload-form" onSubmit={async (e) => {
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
                        <InputWithValidation
                            name="imageUrl"
                            placeholder="https://example.com/image.jpg"
                            label="Or enter URL:"
                            disabled={uploadedFile ? true : false}
                            validate={validateImageUrl}
                            onValueChange={setUrlInput}
                            onValidationChange={setUrlValid}
                        />
                    )}
                </form>
            }
            footer={
                <>
                    <button type="button" onClick={onClose} className="button-secondary">Cancel</button>
                    <button type="submit" form="upload-form" className={`button-primary ${(!uploadedFile && !urlInput) || (urlInput && !urlValid) ? 'disabled' : ''}`} disabled={(!uploadedFile && !urlInput) || (urlInput && !urlValid)}>
                        Upload
                    </button>
                </>
            }
        />
    );
}
