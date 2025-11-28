"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { InfiniteScrollList } from "@/app/components/ui/InfiniteScrollList";
import { toast } from "react-toastify";
import { adminProductsApi } from "@/app/services/adminProductsApi";
import { Product, ProductStatistics, PRODUCT_TYPES } from "@/app/types/Product";
import { useDebounce } from "@/app/hooks/useDebounce";
import ConfirmationModal from "@/app/components/shared/ConfirmationModal";
import { 
    Package, 
    DollarSign, 
    Plus, 
    Edit2, 
    Power, 
    PowerOff, 
    Trash2,
    Download,
    Upload,
    ShoppingCart
} from "lucide-react";

const ProductsPage: React.FC = () => {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [isFromShopify, setIsFromShopify] = useState(false);
    const [shopName, setShopName] = useState("");
    const [role, setRole] = useState("");
    const [showCsvModal, setShowCsvModal] = useState(false);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvUploading, setCsvUploading] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "warning" | "danger" | "info" | "success";
        onConfirm: () => void;
    }>({ isOpen: false, title: "", message: "", type: "warning", onConfirm: () => {} });
    const [statistics, setStatistics] = useState<ProductStatistics>({
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        averagePrice: 0,
    });
    const [statisticsLoading, setStatisticsLoading] = useState(true);

    // Load statistics
    const loadStatistics = useCallback(async () => {
        setStatisticsLoading(true);
        try {
            const stats = await adminProductsApi.getStatistics();
            setStatistics(stats);
        } catch (err) {
            // Statistics are optional, fail silently
            console.error("Failed to load statistics:", err);
        } finally {
            setStatisticsLoading(false);
        }
    }, []);

    // Load products (infinite scroll)
    const loadProducts = useCallback(
        async (reset = false) => {
            if (!hasMore && !reset) return;
            setError(null);
            if (reset) setLoading(true);
            const skip = reset ? 0 : products.length;
            try {
                const res = await adminProductsApi.getAll({ 
                    skip, 
                    take: 50,
                    search: debouncedSearchTerm
                });
                
                if (reset) {
                    setProducts(res.data);
                    setIsFromShopify(res.isFromShopify);
                    setShopName(res.shopName || "");
                    setRole(res.role);
                } else {
                    setProducts((prev) => [...prev, ...res.data]);
                }
                setHasMore(res.hasMore);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load products");
            } finally {
                setLoading(false);
            }
        },
        [hasMore, products.length, debouncedSearchTerm]
    );

    // Initial load
    useEffect(() => {
        setProducts([]);
        setHasMore(true);
        setLoading(true);
        loadProducts(true);
        loadStatistics();
    }, [debouncedSearchTerm]);

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchTerm("");
    }, []);

    const handleStatusToggle = async (id: number, currentStatus: boolean, action: 'deactivate' | 'reactivate') => {
        setUpdatingId(id);
        try {
            if (action === 'deactivate') {
                await adminProductsApi.deactivate(id);
                toast.success("Product deactivated successfully");
            } else {
                await adminProductsApi.reactivate(id);
                toast.success("Product reactivated successfully");
            }
            await loadProducts(true);
            await loadStatistics();
        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
            else toast.error(`Failed to ${action} product`);
        } finally {
            setUpdatingId(null);
        }
    };

    const showStatusConfirmation = (id: number, currentStatus: boolean, action: 'deactivate' | 'reactivate') => {
        const isDeactivating = action === 'deactivate';
        setConfirmModal({
            isOpen: true,
            title: isDeactivating ? 'Deactivate Product' : 'Reactivate Product',
            message: isDeactivating 
                ? 'Are you sure you want to deactivate this product? This will disable all mapped items in videos.'
                : 'Are you sure you want to reactivate this product?',
            type: isDeactivating ? 'warning' : 'success',
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                handleStatusToggle(id, currentStatus, action);
            }
        });
    };

    const handleDelete = async (id: number) => {
        setUpdatingId(id);
        try {
            await adminProductsApi.delete(id);
            toast.success("Product deleted successfully");
            await loadProducts(true);
            await loadStatistics();
        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
            else toast.error("Failed to delete product");
        } finally {
            setUpdatingId(null);
        }
    };

    const showDeleteConfirmation = (id: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Product',
            message: 'Are you sure you want to delete this product? This will disable all mapped items in videos and cannot be undone.',
            type: 'danger',
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                handleDelete(id);
            }
        });
    };

    const handleExport = async (format: 'csv' | 'json') => {
        try {
            const blob = await adminProductsApi.export({ format });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Products.${format}`;
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
            toast.success(`Products exported as ${format.toUpperCase()}`);
        } catch {
            toast.error(`Failed to export products as ${format.toUpperCase()}`);
        }
    };

    const handleShopifyImport = () => {
        setConfirmModal({
            isOpen: true,
            title: "Import Shopify Products",
            message: `Import all products from ${shopName}? This will sync your Shopify products to ShopSee. If you want to update your products, just click Import again.`,
            type: "info",
            onConfirm: performShopifyImport
        });
    };

    const performShopifyImport = async () => {
        // Close the modal first
        setConfirmModal({ ...confirmModal, isOpen: false });

        try {
            setLoading(true);
            await adminProductsApi.importFromShopify();
            toast.success("Products imported successfully from Shopify");
            await loadProducts(true);
            await loadStatistics();
        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
            else toast.error("Failed to import from Shopify");
        } finally {
            setLoading(false);
        }
    };

    const handleCsvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
                toast.error("Please select a CSV file");
                return;
            }
            if (file.size > 20 * 1024 * 1024) { // 20MB limit
                toast.error("File size must be less than 20MB");
                return;
            }
            setCsvFile(file);
        }
    };

    const handleCsvImport = async () => {
        if (!csvFile) {
            toast.error("Please select a CSV file first");
            return;
        }

        setCsvUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', csvFile);

            const response = await fetch('/api/shopify/import/csv', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Import failed');
            }

            toast.success("Products imported successfully from CSV");
            setShowCsvModal(false);
            setCsvFile(null);
            await loadProducts(true);
            await loadStatistics();
        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
            else toast.error("Failed to import from CSV");
        } finally {
            setCsvUploading(false);
        }
    };

    const handleCsvModalClose = () => {
        setShowCsvModal(false);
        setCsvFile(null);
    };

    const formatPrice = (price: number, donationPrices?: number[]) => {
        if (donationPrices && donationPrices.length > 0) {
            return donationPrices.map(p => `$${p.toFixed(2)}`).join(', ');
        }
        return `$${price.toFixed(2)}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const renderProductItem = (index: number, product: Product) => (
        <div
            key={product.id}
            className="p-6 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => router.push(`/cms/admin/products/${product.id}`)}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Package className="h-5 w-5 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                            {product.name}
                        </h3>
                        {product.shopifyProductId && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Shopify
                            </span>
                        )}
                    </div>
                    <div className={`grid grid-cols-2 ${product.productTypeId === PRODUCT_TYPES.QUIZ ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-4 text-sm text-gray-500`}>
                        <div>
                            <span className="font-medium">Company:</span>
                            <br />
                            {product.companyName}
                        </div>
                        <div>
                            <span className="font-medium">Type:</span>
                            <br />
                            {product.productTypeName}
                        </div>
                        {product.productTypeId !== PRODUCT_TYPES.QUIZ && (
                            <div>
                                <span className="font-medium">Price:</span>
                                <br />
                                <span className="text-gray-900 font-medium">
                                    {formatPrice(product.price, product.donationPrices)}
                                </span>
                            </div>
                        )}
                        <div>
                            <span className="font-medium">Modified:</span>
                            <br />
                            {formatDate(product.modifiedDate)}
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {(role === "Admin" || role === "Sales" || product.companyId) && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/cms/admin/products/edit/${product.id}`);
                                }}
                                disabled={updatingId === product.id}
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            
                            {product.isActive ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        showStatusConfirmation(product.id, product.isActive, 'deactivate');
                                    }}
                                    disabled={updatingId === product.id}
                                    className="text-orange-600 hover:text-orange-700"
                                >
                                    <PowerOff className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        showStatusConfirmation(product.id, product.isActive, 'reactivate');
                                    }}
                                    disabled={updatingId === product.id}
                                    className="text-green-600 hover:text-green-700"
                                >
                                    <Power className="h-4 w-4" />
                                </Button>
                            )}
                            
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    showDeleteConfirmation(product.id);
                                }}
                                disabled={updatingId === product.id}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-600 mt-1">Manage your product catalog</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Export Dropdown */}
                    <div className="relative group">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <div className="absolute right-0 top-0 pt-10 w-32 hidden group-hover:block z-10">
                            <div className="bg-white rounded-md shadow-lg border">
                                <button
                                    onClick={() => handleExport('csv')}
                                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-md"
                                >
                                    CSV
                                </button>
                                <button
                                    onClick={() => handleExport('json')}
                                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-md"
                                >
                                    JSON
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Import Dropdown */}
                    {isFromShopify && (
                        <div className="relative group">
                            <Button variant="outline" size="sm">
                                <Upload className="h-4 w-4 mr-2" />
                                Import
                            </Button>
                            <div className="absolute right-0 top-0 pt-10 w-40 hidden group-hover:block z-10">
                                <div className="bg-white rounded-md shadow-lg border">
                                    <button
                                        onClick={handleShopifyImport}
                                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-md"
                                    >
                                        Shopify
                                    </button>
                                    <button
                                        onClick={() => setShowCsvModal(true)}
                                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-md"
                                    >
                                        CSV
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <Button onClick={() => router.push("/cms/admin/products/add")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Total Products</p>
                            {statisticsLoading ? (
                                <div className="w-16 h-6 bg-blue-400 animate-pulse rounded"></div>
                            ) : (
                                <p className="text-2xl font-bold">
                                    {statistics.totalProducts.toLocaleString()}
                                </p>
                            )}
                        </div>
                        <Package className="h-8 w-8 text-blue-200" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Active Products</p>
                            {statisticsLoading ? (
                                <div className="w-16 h-6 bg-green-400 animate-pulse rounded"></div>
                            ) : (
                                <p className="text-2xl font-bold">
                                    {statistics.activeProducts.toLocaleString()}
                                </p>
                            )}
                        </div>
                        <ShoppingCart className="h-8 w-8 text-green-200" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-r from-red-500 to-red-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm">Inactive Products</p>
                            {statisticsLoading ? (
                                <div className="w-16 h-6 bg-red-400 animate-pulse rounded"></div>
                            ) : (
                                <p className="text-2xl font-bold">
                                    {statistics.inactiveProducts.toLocaleString()}
                                </p>
                            )}
                        </div>
                        <PowerOff className="h-8 w-8 text-red-200" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Average Price</p>
                            {statisticsLoading ? (
                                <div className="w-20 h-6 bg-purple-400 animate-pulse rounded"></div>
                            ) : (
                                <p className="text-2xl font-bold">
                                    ${statistics.averagePrice.toFixed(2)}
                                </p>
                            )}
                        </div>
                        <DollarSign className="h-8 w-8 text-purple-200" />
                    </div>
                </Card>
            </div>

            {/* Search */}
            <Card className="p-6">
                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    {searchTerm && (
                        <Button variant="outline" onClick={handleClearSearch}>
                            Clear
                        </Button>
                    )}
                </div>
            </Card>

            {/* Products List */}
            <InfiniteScrollList
                data={products}
                loading={loading}
                hasMore={hasMore}
                endReached={() => loadProducts(false)}
                itemContent={renderProductItem}
                emptyIcon={<Package className="h-12 w-12 text-gray-400 mx-auto" />}
                emptyTitle="No products found"
                emptyMessage={debouncedSearchTerm ? "Try adjusting your search criteria" : "Get started by adding your first product"}
                showEmptyReset={!!debouncedSearchTerm}
                onResetFilters={handleClearSearch}
                height={600}
                footerLoading={<LoadingSpinner />}
            />

            {error && (
                <Card className="p-6">
                    <div className="text-center text-red-600">
                        <p>{error}</p>
                        <Button 
                            variant="outline" 
                            onClick={() => loadProducts(true)}
                            className="mt-4"
                        >
                            Try Again
                        </Button>
                    </div>
                </Card>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                loading={updatingId !== null}
                confirmText={confirmModal.type === 'danger' ? 'Delete' : 'Confirm'}
            />

            {/* CSV Import Modal */}
            {showCsvModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-semibold">Import Products from CSV</h3>
                            <button
                                onClick={handleCsvModalClose}
                                className="text-gray-400 hover:text-gray-600"
                                disabled={csvUploading}
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select CSV file exported from Shopify
                                    <span className="text-gray-500 text-xs ml-1">
                                        (Access your admin shopping page, then access the products page and select export as CSV File)
                                    </span>
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                                    <div className="space-y-1 text-center">
                                        <div className="flex text-sm text-gray-600">
                                            <label
                                                htmlFor="csv-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                            >
                                                <span>Upload a CSV file</span>
                                                <input
                                                    id="csv-upload"
                                                    name="csv-upload"
                                                    type="file"
                                                    accept=".csv"
                                                    className="sr-only"
                                                    onChange={handleCsvFileSelect}
                                                    disabled={csvUploading}
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">CSV up to 20MB</p>
                                        {csvFile && (
                                            <p className="text-sm text-green-600 font-medium">
                                                Selected: {csvFile.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {shopName && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                                    <p className="text-sm text-blue-800">
                                        <span className="font-medium">Connected Shop:</span> {shopName}
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleCsvModalClose}
                                    disabled={csvUploading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCsvImport}
                                    disabled={!csvFile || csvUploading}
                                >
                                    {csvUploading ? (
                                        "Importing..."
                                    ) : (
                                        "Import"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;