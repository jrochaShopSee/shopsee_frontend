"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { adminProductsApi } from "@/app/services/adminProductsApi";
import { ProductDetails, PRODUCT_TYPES } from "@/app/types/Product";
import { ArrowLeft, Edit2, Package, DollarSign, Calendar, ExternalLink, Power, PowerOff, Trash2, AlertTriangle, ShoppingCart, Truck, Tag } from "lucide-react";

interface ProductDetailsPageProps {
    productId: string;
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ productId }) => {
    const router = useRouter();
    const [product, setProduct] = useState<ProductDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load product details
    useEffect(() => {
        const loadProduct = async () => {
            try {
                const productData = await adminProductsApi.getById(productId);
                setProduct(productData);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load product");
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            loadProduct();
        }
    }, [productId]);

    const handleStatusToggle = async (action: "deactivate" | "reactivate") => {
        if (!product) return;

        const confirmMessage = action === "deactivate" ? "Are you sure you want to deactivate this product? This will disable all mapped items in videos." : "Are you sure you want to reactivate this product?";

        if (!confirm(confirmMessage)) return;

        setUpdating(true);
        try {
            if (action === "deactivate") {
                await adminProductsApi.deactivate(product.id);
                toast.success("Product deactivated successfully");
            } else {
                await adminProductsApi.reactivate(product.id);
                toast.success("Product reactivated successfully");
            }

            // Refresh product data
            const updatedProduct = await adminProductsApi.getById(productId);
            setProduct(updatedProduct);
        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
            else toast.error(`Failed to ${action} product`);
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!product) return;

        if (!confirm("Are you sure you want to delete this product? This will disable all mapped items in videos.")) {
            return;
        }

        setUpdating(true);
        try {
            await adminProductsApi.delete(product.id);
            toast.success("Product deleted successfully");
            router.push("/cms/admin/products");
        } catch (err) {
            if (err instanceof Error) toast.error(err.message);
            else toast.error("Failed to delete product");
        } finally {
            setUpdating(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getProductTypeName = (typeId: number) => {
        const typeMap: { [key: number]: string } = {
            [PRODUCT_TYPES.SIMPLE]: "Simple",
            [PRODUCT_TYPES.VARIABLE]: "Variable",
            [PRODUCT_TYPES.EXTERNAL]: "External",
            4: "Digital", // Digital type (not defined in current PRODUCT_TYPES)
            [PRODUCT_TYPES.DONATION]: "Donation",
            [PRODUCT_TYPES.PHYSICAL]: "Physical",
            [PRODUCT_TYPES.QUIZ]: "Quiz",
        };
        return typeMap[typeId] || "Unknown";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-6">
                <div className="text-center text-red-600">
                    <p>{error}</p>
                    <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                        Try Again
                    </Button>
                </div>
            </Card>
        );
    }

    if (!product) return null;

    const isShopifyProduct = product.shopifyProductId !== null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.push("/cms/admin/products")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                        <p className="text-gray-600">Product Details</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <Button variant="outline" onClick={() => router.push(`/cms/admin/products/edit/${product.id}`)} disabled={updating}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                    </Button>

                    {product.isActive ? (
                        <Button variant="outline" onClick={() => handleStatusToggle("deactivate")} disabled={updating} className="text-orange-600 hover:text-orange-700">
                            <PowerOff className="h-4 w-4 mr-2" />
                            Deactivate
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={() => handleStatusToggle("reactivate")} disabled={updating} className="text-green-600 hover:text-green-700">
                            <Power className="h-4 w-4 mr-2" />
                            Reactivate
                        </Button>
                    )}

                    <Button variant="outline" onClick={handleDelete} disabled={updating} className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Status Badge and Shopify Warning */}
            <div className="flex items-center gap-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${product.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{product.isActive ? "Active" : "Inactive"}</span>

                {isShopifyProduct && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">Shopify Product</span>}
            </div>

            {/* Shopify Product Info */}
            {isShopifyProduct && (
                <Card className="p-4 bg-purple-50 border-purple-200">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-purple-900">{product.shopifyProductId ? "Product Imported from Shopify" : "CSV Product Imported from Shopify"}</h3>
                            <p className="text-sm text-purple-700 mt-1">This product was imported from your Shopify store and is synchronized with your shop.</p>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card className="p-6 text-white">
                    <div className="flex items-center gap-3 mb-6">
                        <Package className="h-5 w-5 text-blue-600" />
                        <h2 className="text-lg font-semibold">Basic Information</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Company</dt>
                            <dd className="mt-1 text-sm text-gray-900">{product.companyName}</dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-gray-500">Product Type</dt>
                            <dd className="mt-1 text-sm text-gray-900">{getProductTypeName(product.productTypeId)}</dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-gray-500">{product.productTypeId === PRODUCT_TYPES.QUIZ ? "Quiz Question" : "Description"}</dt>
                            <dd className="mt-1 text-sm text-gray-900">{product.description || (product.productTypeId === PRODUCT_TYPES.QUIZ ? "No question provided" : "No description provided")}</dd>
                        </div>

                        {product.sku && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">SKU</dt>
                                <dd className="mt-1 text-sm text-gray-900">{product.sku}</dd>
                            </div>
                        )}

                        {product.barCode && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Barcode</dt>
                                <dd className="mt-1 text-sm text-gray-900">{product.barCode}</dd>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Quiz Settings - Show for Quiz products */}
                {product.productTypeId === PRODUCT_TYPES.QUIZ && product.quizSettings && (
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Package className="h-5 w-5 text-purple-600" />
                            <h2 className="text-lg font-semibold">Quiz Settings</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Must Answer</dt>
                                <dd className="mt-1 text-sm text-gray-900">{product.quizSettings.mustAnswer ? "Yes" : "No"}</dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500 mb-2">Answers</dt>
                                <dd className="space-y-2">
                                    {product.quizSettings.answers && product.quizSettings.answers.map((answer: any, index: number) => (
                                        <div key={index} className={`p-3 rounded-lg border ${answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-900">{answer.text}</span>
                                                {answer.isCorrect && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                        Correct
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </dd>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Pricing Information - Hide for Quiz products */}
                {product.productTypeId !== PRODUCT_TYPES.QUIZ && (
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <h2 className="text-lg font-semibold">Pricing</h2>
                        </div>

                        <div className="space-y-4">
                            {product.productTypeId === PRODUCT_TYPES.DONATION && product.donationPriceList.length > 0 ? (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Donation Options</dt>
                                    <dd className="mt-1">
                                        <div className="flex flex-wrap gap-2">
                                            {product.donationPriceList.map((donation, index) => (
                                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {formatPrice(donation.price)}
                                                </span>
                                            ))}
                                        </div>
                                    </dd>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Price</dt>
                                        <dd className="mt-1 text-lg font-semibold text-gray-900">{formatPrice(product.price)}</dd>
                                    </div>

                                    {product.comparePrice && product.comparePrice > 0 && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Compare Price</dt>
                                            <dd className="mt-1 text-sm text-gray-600 line-through">{formatPrice(product.comparePrice)}</dd>
                                        </div>
                                    )}

                                    {product.salePrice && product.salePrice > 0 && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Sale Price</dt>
                                            <dd className="mt-1 text-sm font-semibold text-red-600">{formatPrice(product.salePrice)}</dd>
                                        </div>
                                    )}
                                </>
                            )}

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Show Price</dt>
                                <dd className="mt-1 text-sm text-gray-900">{product.showPrice ? "Yes" : "No"}</dd>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Physical Product Details */}
                {product.productTypeId === PRODUCT_TYPES.PHYSICAL && (
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Truck className="h-5 w-5 text-purple-600" />
                            <h2 className="text-lg font-semibold">Physical Details</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Length</dt>
                                <dd className="mt-1 text-sm text-gray-900">{product.length} in</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Width</dt>
                                <dd className="mt-1 text-sm text-gray-900">{product.width} in</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Height</dt>
                                <dd className="mt-1 text-sm text-gray-900">{product.height} in</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Weight</dt>
                                <dd className="mt-1 text-sm text-gray-900">{product.weight} lbs</dd>
                            </div>
                        </div>

                        {product.customShipping && (
                            <div className="mt-4 pt-4 border-t">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Shipping</h4>
                                {product.flatRateShippingCost && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Flat Rate Cost</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{formatPrice(product.flatRateShippingCost)}</dd>
                                    </div>
                                )}
                                <div className="mt-2">
                                    <dt className="text-sm font-medium text-gray-500">Per Product</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{product.shippingPerProduct ? "Yes" : "No"}</dd>
                                </div>
                            </div>
                        )}
                    </Card>
                )}

                {/* External Link */}
                {product.productTypeId === 3 && product.externalLink && (
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <ExternalLink className="h-5 w-5 text-blue-600" />
                            <h2 className="text-lg font-semibold">External Link</h2>
                        </div>

                        <div>
                            <a href={product.externalLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
                                {product.externalLink}
                            </a>
                        </div>
                    </Card>
                )}

                {/* Inventory Management */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <ShoppingCart className="h-5 w-5 text-indigo-600" />
                        <h2 className="text-lg font-semibold">Inventory</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Manage Inventory</dt>
                            <dd className="mt-1 text-sm text-gray-900">{product.manageInventory ? "Yes" : "No"}</dd>
                        </div>

                        {product.manageInventory && (
                            <>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Current Stock</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{product.currentInventory ?? "Not set"}</dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Allow Backorders</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{product.allowBackorders ? "Yes" : "No"}</dd>
                                </div>
                            </>
                        )}
                    </div>
                </Card>

                {/* Dates */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar className="h-5 w-5 text-gray-600" />
                        <h2 className="text-lg font-semibold">Timeline</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Created Date</dt>
                            <dd className="mt-1 text-sm text-gray-900">{formatDate(product.createdDate)}</dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-gray-500">Modified Date</dt>
                            <dd className="mt-1 text-sm text-gray-900">{formatDate(product.modifiedDate)}</dd>
                        </div>
                    </div>
                </Card>

                {/* Shopify Details */}
                {isShopifyProduct && (
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Tag className="h-5 w-5 text-purple-600" />
                            <h2 className="text-lg font-semibold">Shopify Details</h2>
                        </div>

                        <div className="space-y-4">
                            {product.shopifyProductId && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Shopify Product ID</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{product.shopifyProductId}</dd>
                                </div>
                            )}

                            {product.shopifyShopId && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Shop ID</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{product.shopifyShopId}</dd>
                                </div>
                            )}

                            {product.shopifyDefaultVariantId && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Default Variant ID</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{product.shopifyDefaultVariantId}</dd>
                                </div>
                            )}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ProductDetailsPage;
