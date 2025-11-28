import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: "default" | "elevated" | "outlined" | "ghost";
    hoverable?: boolean;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className = "", variant = "default", hoverable = false, children, ...props }, ref) => {
    const variantClasses = {
        default: "bg-white border border-gray-200 shadow-sm",
        elevated: "bg-white shadow-lg",
        outlined: "bg-white border-2 border-gray-300",
        ghost: "bg-gray-50",
    };

    const hoverClass = hoverable ? "transition-all duration-200 hover:shadow-xl hover:-translate-y-1" : "";

    return (
        <div ref={ref} className={`rounded-lg ${variantClasses[variant]} ${hoverClass} ${className}`} {...props}>
            {children}
        </div>
    );
});

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(({ className = "", children, ...props }, ref) => (
    <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
        {children}
    </div>
));

export const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(({ className = "", children, ...props }, ref) => (
    <h3 ref={ref} className={`text-2xl font-semibold leading-none tracking-tight text-gray-900 ${className}`} {...props}>
        {children}
    </h3>
));

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(({ className = "", children, ...props }, ref) => (
    <p ref={ref} className={`text-sm text-gray-600 ${className}`} {...props}>
        {children}
    </p>
));

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(({ className = "", children, ...props }, ref) => (
    <div ref={ref} className={`p-6 pt-0 ${className}`} {...props}>
        {children}
    </div>
));

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(({ className = "", children, ...props }, ref) => (
    <div ref={ref} className={`flex items-center p-6 pt-0 ${className}`} {...props}>
        {children}
    </div>
));

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";
