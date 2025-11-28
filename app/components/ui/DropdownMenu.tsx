import React, { useState } from "react";

interface DropdownMenuProps {
    children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
    asChild?: boolean;
    children: React.ReactNode;
}

interface DropdownMenuContentProps {
    align?: "start" | "center" | "end";
    children: React.ReactNode;
}

interface DropdownMenuItemProps {
    onClick?: () => void;
    className?: string;
    children: React.ReactNode;
}

type DropdownMenuSeparatorProps = object;

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    if (child.type === DropdownMenuTrigger) {
                        return React.cloneElement(child, {
                            onClick: () => setIsOpen(!isOpen),
                            // eslint-disable-next-line
                        } as any);
                    }
                    if (child.type === DropdownMenuContent && isOpen) {
                        return React.cloneElement(child, {
                            onClose: () => setIsOpen(false),
                            // eslint-disable-next-line
                        } as any);
                    }
                }
                return null;
            })}
        </div>
    );
};

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps & { onClick?: () => void }> = ({ asChild = false, children, onClick }) => {
    if (asChild && React.isValidElement(children)) {
        // eslint-disable-next-line
        return React.cloneElement(children, { onClick } as any);
    }

    return <button onClick={onClick}>{children}</button>;
};

export const DropdownMenuContent: React.FC<DropdownMenuContentProps & { onClose?: () => void }> = ({ align = "center", children, onClose }) => {
    const alignmentClasses = {
        start: "left-0",
        center: "left-1/2 transform -translate-x-1/2",
        end: "right-0",
    };

    return (
        <div className={`absolute top-full mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${alignmentClasses[align]}`}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement<{ onClick?: () => void }>(child) && child.type === DropdownMenuItem) {
                    return React.cloneElement(child, {
                        onClickInternal: () => {
                            if (child.props.onClick) {
                                child.props.onClick();
                            }
                            onClose?.();
                        },
                        // eslint-disable-next-line
                    } as any);
                }
                return child;
            })}
        </div>
    );
};

export const DropdownMenuItem: React.FC<DropdownMenuItemProps & { onClickInternal?: () => void }> = ({ onClick, onClickInternal, className = "", children }) => (
    <div className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground ${className}`} onClick={onClickInternal || onClick}>
        {children}
    </div>
);

export const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = () => <div className="-mx-1 my-1 h-px bg-muted" />;
