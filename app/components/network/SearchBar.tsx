"use client";

import { Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    debounceMs?: number;
}

export function SearchBar({ onSearch, placeholder = "Search", debounceMs = 500 }: SearchBarProps) {
    const [searchValue, setSearchValue] = useState("");
    const onSearchRef = useRef(onSearch);
    const isFirstRender = useRef(true);

    // Keep ref in sync with latest callback
    useEffect(() => {
        onSearchRef.current = onSearch;
    }, [onSearch]);

    useEffect(() => {
        // Skip the initial render to avoid triggering search on mount
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            onSearchRef.current(searchValue);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [searchValue, debounceMs]);

    return (
        <div className="relative">
            <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
    );
}
