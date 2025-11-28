import React from "react";

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

interface DialogContentProps {
    className?: string;
    children: React.ReactNode;
}

interface DialogHeaderProps {
    children: React.ReactNode;
}

interface DialogTitleProps {
    className?: string;
    children: React.ReactNode;
}

interface DialogDescriptionProps {
    children: React.ReactNode;
}

interface DialogFooterProps {
    className?: string;
    children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
            <div className="relative z-50">{children}</div>
        </div>
    );
};

export const DialogContent: React.FC<DialogContentProps> = ({ className = "", children }) => <div className={`bg-background p-6 rounded-lg shadow-lg border max-w-lg w-full mx-4 ${className}`}>{children}</div>;

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">{children}</div>;

export const DialogTitle: React.FC<DialogTitleProps> = ({ className = "", children }) => <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h2>;

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children }) => <p className="text-sm text-muted-foreground">{children}</p>;

export const DialogFooter: React.FC<DialogFooterProps> = ({ className = "", children }) => <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 ${className}`}>{children}</div>;
