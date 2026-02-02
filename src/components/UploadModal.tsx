'use client';

import { form } from "@heroui/theme";
import { on } from "node:cluster";

interface UploadModalProps {
    title: string;
    message: string;
    onUpload: (formData: FormData) => Promise<void>;
    onURL?: (url: string) => Promise<void> | undefined;
    onClose: () => void;
    isOpen: boolean;
}

export default function UploadModal({ title, message, onUpload, onURL, onClose, isOpen }: UploadModalProps) {
    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-bold mb-4 text-gray-900">{title}</h2>

                        <p className="mb-6 text-gray-700">{message}</p>

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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload:
                                </label>
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                                />
                            </div>
                            {onURL && (
                                <div className="mb-4 text-sm text-gray-600">
                                    <label className="font-medium">Or enter URL:</label>
                                    <input
                                        type="url"
                                        name="imageUrl"
                                        placeholder="https://example.com/image.jpg"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            )}

                                < div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="button-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="button-primary"
                            >
                                Upload
                            </button>
                    </div>
                </form>
                    </div >
                </div >
            )
}
        </>
    );
}
