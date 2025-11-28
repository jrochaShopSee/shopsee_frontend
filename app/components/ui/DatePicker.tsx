// Fixed DatePickerWithRange component
import React, { useState, useEffect } from "react";

interface DatePickerWithRangeProps {
    startDate?: string;
    endDate?: string;
    onDateChange: (startDate: string, endDate: string) => void;
}

export const DatePickerWithRange: React.FC<DatePickerWithRangeProps> = ({ startDate, endDate, onDateChange }) => {
    const [localStartDate, setLocalStartDate] = useState(startDate || "");
    const [localEndDate, setLocalEndDate] = useState(endDate || "");

    // FIXED: Sync local state when props change
    useEffect(() => {
        console.log("DatePicker: Props changed - startDate:", startDate, "endDate:", endDate);
        setLocalStartDate(startDate || "");
        setLocalEndDate(endDate || "");
    }, [startDate, endDate]);

    const handleStartDateChange = (value: string) => {
        console.log("DatePicker: Start date changed to:", value);
        setLocalStartDate(value);
        onDateChange(value, localEndDate);
    };

    const handleEndDateChange = (value: string) => {
        console.log("DatePicker: End date changed to:", value);
        setLocalEndDate(value);
        onDateChange(localStartDate, value);
    };

    return (
        <div className="flex gap-2">
            <div className="flex-1">
                <input type="date" value={localStartDate} onChange={(e) => handleStartDateChange(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Start date" />
            </div>
            <div className="flex-1">
                <input type="date" value={localEndDate} onChange={(e) => handleEndDateChange(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="End date" />
            </div>
        </div>
    );
};
