"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItemProps {
    question: string;
    answer: string;
}

interface AccordionProps {
    items: AccordionItemProps[];
    className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ items, className = "" }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                    <button onClick={() => toggleItem(index)} className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors" aria-expanded={openIndex === index}>
                        <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${openIndex === index ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? "max-h-96" : "max-h-0"}`}>
                        <div className="px-6 py-4 text-gray-600 border-t border-gray-100 bg-gray-50">{item.answer}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};
