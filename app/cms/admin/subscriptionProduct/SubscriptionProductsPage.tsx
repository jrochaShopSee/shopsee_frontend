"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/Dialog";
import { toast } from "react-toastify";
import { subscriptionProductApi } from "@/app/services/subscriptionProductApi";
import { SubscriptionProduct } from "@/app/types/SubscriptionProduct";
import { Package, DollarSign, Plus, ExternalLink, Trash2, AlertTriangle } from "lucide-react";

const SubscriptionProductsPage: React.FC = () => {
    const router = useRouter();
    const [subscriptionProducts, setSubscriptionProducts] = useState<SubscriptionProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [statistics, setStatistics] = useState({
        totalSubscriptionProducts: 0,
        activeSubscriptionProducts: 0,
        averagePrice: 0,
    });
    const [statisticsLoading, setStatisticsLoading] = useState(true);
    const [statisticsError, setStatisticsError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<{ id: number; name: string } | null>(null);

    // Load statistics
    const loadStatistics = useCallback(async () => {
        setStatisticsLoading(true);
        setStatisticsError(null);
        try {
            const stats = await subscriptionProductApi.getStatistics();
            setStatistics({
                totalSubscriptionProducts: stats.totalSubscriptionProducts,
                activeSubscriptionProducts: stats.activeSubscriptionProducts,
                averagePrice: stats.averagePrice,
            });
        } catch (err) {
            setStatisticsError(err instanceof Error ? err.message : "Failed to load statistics");
        } finally {
            setStatisticsLoading(false);
        }
    }, []);

    // Load subscription products (infinite scroll)
    const loadSubscriptionProducts = useCallback(
        async (reset = false) => {
            if (!hasMore && !reset) return;
            setError(null);
            if (reset) setLoading(true);
            const skip = reset ? 0 : subscriptionProducts.length;
            try {
                const res = await subscriptionProductApi.getAll({ skip, take: 50 });
                if (reset) {
                    setSubscriptionProducts(res.data);
                } else {
                    setSubscriptionProducts((prev) => [...prev, ...res.data]);
                }
                setHasMore(res.hasMore);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load subscription products");
            } finally {
                setLoading(false);
            }
        },
        [hasMore, subscriptionProducts.length]
    );

    // Initial load
    useEffect(() => {
        setSubscriptionProducts([]);
        setHasMore(true);
        setLoading(true);
        loadSubscriptionProducts(true);
        loadStatistics();
    }, []);

    const handleStatusToggle = async (id: number, currentStatus: boolean) => {
        setUpdatingId(id);
        try {
            await subscriptionProductApi.toggleStatus(id, !currentStatus);
            toast.success(`Subscription product ${!currentStatus ? "enabled" : "disabled"}`);
            await loadSubscriptionProducts(true);
            await loadStatistics();
        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
            else toast.error("Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleResubmitToStripe = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setUpdatingId(id);
        try {
            await subscriptionProductApi.resubmitToStripe(id);
            toast.success("Successfully submitted to Stripe");
            await loadSubscriptionProducts(true);
        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
            else toast.error("Failed to submit to Stripe");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDeleteClick = (id: number, name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setProductToDelete({ id, name });
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return;

        setUpdatingId(productToDelete.id);
        setDeleteDialogOpen(false);

        try {
            await subscriptionProductApi.delete(productToDelete.id);
            toast.success("Subscription product deleted successfully");
            await loadSubscriptionProducts(true);
            await loadStatistics();
        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
            else toast.error("Failed to delete subscription product");
        } finally {
            setUpdatingId(null);
            setProductToDelete(null);
        }
    };

    // UI
    if (loading && subscriptionProducts.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return <div className="p-6 max-w-7xl mx-auto text-red-600">{error}</div>;
    }

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return amount?.toLocaleString("en-US", { style: "currency", currency: "USD" });
    };

    // Group subscription products by type
    const groupedProducts = subscriptionProducts.reduce((acc, product) => {
        const type = product.subscriptionTypeName || "Other";
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(product);
        return acc;
    }, {} as Record<string, SubscriptionProduct[]>);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <Package className="w-8 h-8 mr-3 text-purple-500" />
                            Subscription Products
                        </h1>
                        <p className="text-gray-600 mt-2">Manage subscription products and pricing</p>
                    </div>
                    <Button onClick={() => router.push("/cms/admin/subscriptionProduct/add")} className="flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>Add New</span>
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Total Products</p>
                                {statisticsLoading ? <div className="w-16 h-6 bg-purple-400 animate-pulse rounded"></div> : statisticsError ? <p className="text-xl font-bold text-red-200">Error</p> : <p className="text-2xl font-bold">{statistics.totalSubscriptionProducts.toLocaleString()}</p>}
                            </div>
                            <Package className="w-8 h-8 text-purple-200" />
                        </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Active Products</p>
                                {statisticsLoading ? <div className="w-16 h-6 bg-green-400 animate-pulse rounded"></div> : statisticsError ? <p className="text-xl font-bold text-red-200">Error</p> : <p className="text-2xl font-bold">{statistics.activeSubscriptionProducts.toLocaleString()}</p>}
                            </div>
                            <DollarSign className="w-8 h-8 text-green-200" />
                        </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Average Price</p>
                                {statisticsLoading ? <div className="w-20 h-6 bg-blue-400 animate-pulse rounded"></div> : statisticsError ? <p className="text-xl font-bold text-red-200">Error</p> : <p className="text-2xl font-bold">{formatCurrency(statistics.averagePrice)}</p>}
                            </div>
                            <DollarSign className="w-8 h-8 text-blue-200" />
                        </div>
                    </Card>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <div className="text-red-600 text-sm">{error}</div>
                        <Button onClick={() => loadSubscriptionProducts(true)} variant="outline" size="sm" className="ml-auto">
                            Retry
                        </Button>
                    </div>
                </div>
            )}

            {/* Grouped Subscription Products */}
            <div className="space-y-8">
                {Object.entries(groupedProducts).map(([typeName, products]) => (
                    <div key={typeName} className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">{typeName}</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{product.subscriptionName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{product.isActive ? "Active" : "Inactive"}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(product.price)} / Month</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <Button size="sm" variant="outline" onClick={() => router.push(`/cms/admin/subscriptionProduct/edit/${product.id}`)}>
                                                    Edit
                                                </Button>

                                                {product.isActive ? (
                                                    <>
                                                        {!product.merchantId && (
                                                            <Button size="sm" variant="default" onClick={(e) => handleResubmitToStripe(product.id, e)} disabled={updatingId === product.id} className="bg-blue-600 hover:bg-blue-700">
                                                                {updatingId === product.id ? (
                                                                    <>
                                                                        <LoadingSpinner />
                                                                        <span className="ml-2">Adding...</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ExternalLink className="w-3 h-3 mr-1" />
                                                                        Add To Stripe
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStatusToggle(product.id, product.isActive);
                                                            }}
                                                            disabled={updatingId === product.id}
                                                        >
                                                            {updatingId === product.id ? (
                                                                <>
                                                                    <LoadingSpinner />
                                                                    <span className="ml-2">Disabling...</span>
                                                                </>
                                                            ) : (
                                                                "Disable"
                                                            )}
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusToggle(product.id, product.isActive);
                                                        }}
                                                        disabled={updatingId === product.id}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        {updatingId === product.id ? (
                                                            <>
                                                                <LoadingSpinner />
                                                                <span className="ml-2">Enabling...</span>
                                                            </>
                                                        ) : (
                                                            "Enable"
                                                        )}
                                                    </Button>
                                                )}

                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={(e) => handleDeleteClick(product.id, product.subscriptionName, e)}
                                                    disabled={updatingId === product.id}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    {updatingId === product.id ? (
                                                        <>
                                                            <LoadingSpinner />
                                                            <span className="ml-2">Deleting...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trash2 className="w-3 h-3 mr-1" />
                                                            Delete
                                                        </>
                                                    )}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}

                {subscriptionProducts.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No subscription products found</h3>
                    </div>
                )}

                {hasMore && !loading && (
                    <div className="flex justify-center py-6">
                        <Button onClick={() => loadSubscriptionProducts(false)} variant="outline" disabled={loading}>
                            {loading ? <LoadingSpinner /> : "Load More"}
                        </Button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-red-600">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            Delete Subscription Product
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-3 text-gray-700">
                        <p className="text-sm text-gray-600">
                            Are you sure you want to delete <span className="font-semibold">"{productToDelete?.name}"</span>?
                        </p>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                            <p className="font-medium text-red-800 mb-2">This action will:</p>
                            <ul className="list-disc list-inside space-y-1 text-red-700">
                                <li>Remove the product from the database</li>
                                <li>Archive the product in Stripe (if it exists)</li>
                            </ul>
                        </div>
                        <p className="text-sm font-medium text-red-600">This action cannot be undone.</p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SubscriptionProductsPage;
