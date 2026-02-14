'use client';

import { useState, useRef, useEffect } from 'react';

interface InputWithValidationProps {
    name: string;
    placeholder: string;
    disabled?: boolean;
    onValidationChange?: (isValid: boolean) => void;
    onValueChange?: (value: string) => void;
    validate: (value: string) => Promise<void>;
    label?: string;
}

export default function InputWithValidation({
    name,
    placeholder,
    disabled = false,
    onValidationChange,
    onValueChange,
    validate,
    label,
}: InputWithValidationProps) {
    const [value, setValue] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isValid, setIsValid] = useState<boolean>(false);
    const [checking, setChecking] = useState<boolean>(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const performValidation = async (inputValue: string) => {
        setChecking(true);
        try {
            await validate(inputValue);
            setError('');
            setIsValid(true);
            onValidationChange?.(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Validation failed';
            setError(errorMessage);
            setIsValid(false);
            onValidationChange?.(false);
        } finally {
            setChecking(false);
        }
    };

    const debouncedValidate = (inputValue: string) => {
        // Clear previous debounce timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Debounce the validation check
        debounceTimer.current = setTimeout(() => {
            performValidation(inputValue);
        }, 800);
    };

    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        onValueChange?.(newValue);
        debouncedValidate(newValue);
    };

    const handleBlur = () => {
        if (value) {
            performValidation(value);
        }
    };

    return (
        <div className={`${disabled ? 'label-muted' : ''} mb-4 ${disabled ? 'disabled' : ''}`}>
            {label && <label className='label-secondary'>{label}</label>}
            <input
                type='url'
                name={name}
                placeholder={placeholder}
                className={error ? 'input-error' : isValid ? 'input-valid' : 'input-default'}
                disabled={disabled}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
            />
            {checking && <p className='input-message-info'>Checking...</p>}
            {error && <p className='input-message-error'>{error}</p>}
        </div>
    );
}
