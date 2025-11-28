import React from "react";

interface FeatureCardProps {
    number?: number;
    icon?: React.ReactNode;
    title: string;
    description: string;
    className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ number, icon, title, description, className = "" }) => {
    return (
        <div className={`space-y-4 ${className}`}>
            {number && (
                <div className="w-12 h-12 mx-auto flex items-center justify-center bg-gradient-to-br from-primary to-secondary text-white rounded-full font-bold text-lg shadow-lg">
                    {number}
                </div>
            )}
            {icon && <div className="flex justify-center">{icon}</div>}
            <h4 className="text-xl font-semibold text-gray-900">{title}</h4>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    );
};
