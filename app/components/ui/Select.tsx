// components/ui/Select.tsx - Enhanced to handle both patterns
import React, { useState, useEffect, useRef, useId } from "react";

interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    disabled?: boolean;
    children: React.ReactNode;
    placeholder?: string;
    className?: string;
}

interface SelectTriggerProps {
    children: React.ReactNode;
    className?: string;
}

interface SelectValueProps {
    placeholder?: string;
}

interface SelectContentProps {
    children: React.ReactNode;
}

interface SelectItemProps {
    value: string;
    children: React.ReactNode;
    onSelect?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({ value, onValueChange, disabled = false, children, placeholder = "Select an option...", className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState<string>("");
    const selectRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();

    // Enhanced extraction to handle both <option> and SelectItem patterns
    const { extractedPlaceholder, items } = React.useMemo(() => {
        let finalPlaceholder = placeholder;
        const extractedItems: Array<{ value: string; label: string }> = [];

        // Function to extract items from different patterns
        const extractItems = (children: React.ReactNode) => {
            React.Children.forEach(children, (child) => {
                if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
                    // Handle HTML <option> elements
                    if (child.type === "option") {
                        const optionProps = child.props as React.OptionHTMLAttributes<HTMLOptionElement>;
                        if (optionProps.value && !optionProps.disabled) {
                            extractedItems.push({
                                value: String(optionProps.value),
                                label: typeof optionProps.children === "string" ? optionProps.children : String(optionProps.children || optionProps.value),
                            });
                        }
                    }
                    // Handle SelectTrigger pattern
                    else if (child.type === SelectTrigger) {
                        React.Children.forEach(child.props.children, (triggerChild) => {
                            if (React.isValidElement(triggerChild) && triggerChild.type === SelectValue) {
                                const triggerProps = triggerChild.props as SelectValueProps;
                                if (triggerProps.placeholder) {
                                    finalPlaceholder = triggerProps.placeholder;
                                }
                            }
                        });
                    }
                    // Handle SelectContent pattern
                    else if (child.type === SelectContent) {
                        React.Children.forEach(child.props.children, (contentChild) => {
                            if (React.isValidElement(contentChild) && contentChild.type === SelectItem) {
                                const itemProps = contentChild.props as SelectItemProps;
                                extractedItems.push({
                                    value: itemProps.value,
                                    label: typeof itemProps.children === "string" ? itemProps.children : String(itemProps.children),
                                });
                            }
                        });
                    }
                    // Handle SelectItem directly (for flexibility)
                    else if (child.type === SelectItem) {
                        const itemProps = child.props as SelectItemProps;
                        extractedItems.push({
                            value: itemProps.value,
                            label: typeof itemProps.children === "string" ? itemProps.children : String(itemProps.children),
                        });
                    }
                    // Handle nested structures recursively
                    else if (child.props?.children) {
                        extractItems(child.props.children);
                    }
                }
            });
        };

        extractItems(children);

        return {
            extractedPlaceholder: finalPlaceholder,
            items: extractedItems,
        };
    }, [children, placeholder]);

    // Update selected label when value changes
    useEffect(() => {
        const selectedItem = items.find((item) => item.value === value);
        setSelectedLabel(selectedItem ? selectedItem.label : "");
    }, [value, items]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    // Close dropdown on Escape key
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscapeKey);
            return () => document.removeEventListener("keydown", handleEscapeKey);
        }
    }, [isOpen]);

    const handleSelect = (selectedValue: string) => {
        console.log("Select: Value selected:", selectedValue);
        onValueChange(selectedValue);
        setIsOpen(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (disabled) return;

        switch (event.key) {
            case "Enter":
            case " ":
                event.preventDefault();
                setIsOpen(!isOpen);
                break;
            case "ArrowDown":
                event.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                } else {
                    // Move to next item
                    const currentIndex = items.findIndex((item) => item.value === value);
                    const nextIndex = Math.min(currentIndex + 1, items.length - 1);
                    if (nextIndex !== currentIndex && items[nextIndex]) {
                        onValueChange(items[nextIndex].value);
                    }
                }
                break;
            case "ArrowUp":
                event.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                } else {
                    // Move to previous item
                    const currentIndex = items.findIndex((item) => item.value === value);
                    const prevIndex = Math.max(currentIndex - 1, 0);
                    if (prevIndex !== currentIndex && items[prevIndex]) {
                        onValueChange(items[prevIndex].value);
                    }
                }
                break;
        }
    };

    const displayValue = selectedLabel || extractedPlaceholder;
    const hasValue = Boolean(selectedLabel);

    return (
        <div className={`relative ${className}`} ref={selectRef}>
            <button
                type="button"
                role="combobox"
                aria-expanded={isOpen}
                aria-controls={listboxId}
                aria-haspopup="listbox"
                className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${disabled ? "cursor-not-allowed opacity-50 bg-gray-50" : "cursor-pointer hover:bg-gray-50 focus:bg-gray-50"}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                aria-label={hasValue ? `Selected: ${selectedLabel}` : extractedPlaceholder}
            >
                <span className={`flex-1 text-left truncate ${!hasValue ? "text-gray-500" : "text-gray-900"}`}>{displayValue}</span>
                <svg className={`h-4 w-4 opacity-50 ml-2 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && !disabled && (
                <div id={listboxId} className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto" role="listbox" aria-label="Options">
                    {items.length > 0 ? (
                        <div className="py-1">
                            {items.map((item, index) => (
                                <button
                                    key={`${item.value}-${index}`}
                                    type="button"
                                    role="option"
                                    aria-selected={item.value === value}
                                    className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none cursor-pointer transition-colors ${item.value === value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-900"}`}
                                    onClick={() => handleSelect(item.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            handleSelect(item.value);
                                        }
                                    }}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="py-2 px-3 text-sm text-gray-500">No options available</div>
                    )}
                </div>
            )}
        </div>
    );
};

// Component versions for the structured pattern
export const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className = "" }) => {
    return <div className={className}>{children}</div>;
};

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
    return <span>{placeholder}</span>;
};

export const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
    return <>{children}</>;
};

export const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
    return <span data-value={value}>{children}</span>;
};
