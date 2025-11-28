import React from "react";
import { Virtuoso } from "react-virtuoso";

interface InfiniteScrollListProps<T> {
    data: T[];
    loading: boolean;
    hasMore: boolean;
    endReached: () => void;
    itemContent: (index: number, item: T) => React.ReactNode;
    emptyIcon?: React.ReactNode;
    emptyTitle?: string;
    emptyMessage?: string;
    onResetFilters?: () => void;
    showEmptyReset?: boolean;
    height?: number | string;
    footerLoading?: React.ReactNode;
    footerEnd?: React.ReactNode;
}

export function InfiniteScrollList<T>({ data, loading, hasMore, endReached, itemContent, emptyIcon, emptyTitle, emptyMessage, onResetFilters, showEmptyReset = false, height = 600, footerLoading, footerEnd }: InfiniteScrollListProps<T>) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {loading && data.length === 0 ? (
                <div className="flex items-center justify-center py-12">{footerLoading || <span>Loading...</span>}</div>
            ) : data.length === 0 ? (
                <div className="text-center py-12">
                    {emptyIcon}
                    {emptyTitle && <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyTitle}</h3>}
                    {emptyMessage && <p className="text-gray-500">{emptyMessage}</p>}
                    {showEmptyReset && onResetFilters && (
                        <button onClick={onResetFilters} className="mt-4 px-4 py-2 border rounded text-sm text-gray-700 hover:bg-gray-50">
                            Clear Search
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ height }} className="flex flex-col">
                    <Virtuoso
                        data={data}
                        endReached={() => {
                            if (!loading && hasMore) {
                                endReached();
                            }
                        }}
                        itemContent={(index: number, item: T) => <div className="p-2">{itemContent(index, item)}</div>}
                        components={{
                            Footer: () => (loading && data.length > 0 ? <div className="flex justify-center py-4">{footerLoading || <span>Loading...</span>}</div> : !hasMore && data.length > 0 ? <div className="text-center py-4 text-gray-500 text-sm">{footerEnd || `All items loaded (${data.length} total)`}</div> : null),
                        }}
                    />
                </div>
            )}
        </div>
    );
}
