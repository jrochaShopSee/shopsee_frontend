import React from "react";

interface SectionHeaderProps {
    title: string;
    description?: string;
    centered?: boolean;
    className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description, centered = true, className = "" }) => {
    const wrapperClasses = centered ? "text-center max-w-3xl mx-auto" : "max-w-3xl";

    return (
        <div className={`${wrapperClasses} mb-12 ${className}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
            {description && <p className="text-lg text-gray-600 leading-relaxed">{description}</p>}
        </div>
    );
};
