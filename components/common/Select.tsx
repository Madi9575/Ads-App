import React, { useState, useMemo, FC, useEffect, useRef } from 'react';
import { ChevronDownIcon } from '../icons';

interface SelectProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> { 
    label?: string;
    name: string;
    options: (string | { value: any, label: string })[];
    value: any;
    onChange: (event: { target: { name: string; value: any } }) => void;
    required?: boolean;
    icon?: React.ReactNode;
    direction?: 'up' | 'down';
}

const Select: FC<SelectProps> = ({ label, name, options, value, onChange, required, icon, direction = 'down', ...props }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    const handleSelect = (optionValue: any) => {
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    const selectedLabel = useMemo(() => {
        const selectedOption = options.find(opt => (typeof opt === 'string' ? opt : opt.value) === value);
        if (selectedOption) {
            return typeof selectedOption === 'string' ? selectedOption : selectedOption.label;
        }
        // Handle placeholder for object-based options with empty initial value
        const firstOption = options[0];
        if(typeof firstOption === 'object' && firstOption.value === ''){
            return firstOption.label;
        }
        if (!value) return `Sélectionnez...`;
        return value; 
    }, [value, options]);

    const buttonClasses = `w-full bg-white/50 border border-black/10 rounded-btn text-sm focus:ring-2 focus:ring-offset-1 focus:ring-light-accent/50 focus:outline-none flex items-center justify-between text-left p-3 ${icon ? 'pl-10' : ''}`;
    
    const dropdownClasses = `absolute z-[999] min-w-full w-max bg-white/80 backdrop-blur-md shadow-lg rounded-2xl max-h-60 overflow-auto focus:outline-none py-2 border border-black/10 ${
        direction === 'up' ? 'bottom-full mb-1' : 'mt-1'
    }`;


    return (
        <div ref={wrapperRef} className={`relative ${isOpen ? 'z-50' : ''}`}>
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-light-text-secondary mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {icon}
                    </div>
                )}
                <button
                    type="button"
                    id={name}
                    {...props}
                    onClick={() => setIsOpen(!isOpen)}
                    className={buttonClasses}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                >
                    <span className="truncate">{selectedLabel}</span>
                    <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'transform rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <ul
                        className={dropdownClasses}
                        role="listbox"
                    >
                        {options.map((opt, index) => {
                            const optValue = typeof opt === 'string' ? opt : opt.value;
                            const optLabel = typeof opt === 'string' ? opt : opt.label;
                            const isSelected = optValue === value;
                            return (
                                <li
                                    key={index}
                                    onClick={() => handleSelect(optValue)}
                                    className={`cursor-pointer select-none relative py-2 px-4 text-sm mx-2 my-0.5 rounded-lg ${
                                        isSelected ? 'text-light-accent bg-light-accent/10 font-semibold' : 'text-light-text'
                                    } hover:bg-light-accent/10`}
                                    role="option"
                                    aria-selected={isSelected}
                                >
                                    <span className="whitespace-nowrap">{optLabel}</span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Select;