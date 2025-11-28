import React from "react";
import { Card } from "@/app/components/ui/Card";

interface ListCardProps {
    left: React.ReactNode; // Main info (name, etc)
    center?: React.ReactNode; // Secondary info (status, etc)
    right?: React.ReactNode; // Actions/buttons
    onClick?: () => void;
    className?: string;
}

export const ListCard: React.FC<ListCardProps> = ({ left, center, right, onClick, className = "" }) => (
    <Card className={`flex flex-col md:flex-row items-center gap-4 p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer mb-4 last:mb-0 ${className}`} onClick={onClick}>
        <div className="flex-1 w-full md:w-auto">{left}</div>
        {center && <div className="flex flex-col items-center w-32">{center}</div>}
        {right && <div className="flex gap-2 ml-4">{right}</div>}
    </Card>
);
