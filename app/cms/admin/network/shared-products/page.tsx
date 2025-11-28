"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Package, TrendingUp, Search, ChevronDown, ChevronUp, Edit2, Trash2, Check, X, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { SharedProductsApi } from '@/app/services/sharedProductsApi';
import type {
    SharedProductManagementModel,
    UserConnectionDetails,
    ProductSharedDetails,
    ContentCreatorProductInfo,
    ProductDetail
} from '@/app/types/sharedProducts';
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner';

type TabType = 'creators' | 'pending' | 'shared';

export default function SharedProductsPage() {
    const router = useRouter();
    const [data, setData] = useState<SharedProductManagementModel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('creators');
    const [expandedCreators, setExpandedCreators] = useState<Set<number>>(new Set());
    const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

    // Modal states
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [removeModalOpen, setRemoveModalOpen] = useState(false);

    // Modal data
    const [selectedCreator, setSelectedCreator] = useState<{ id: number; data: ContentCreatorProductInfo } | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
    const [selectedPercentage, setSelectedPercentage] = useState<string>('');
    const [reviewProduct, setReviewProduct] = useState<{ id: number; owner: string; percentage: number; details: ProductSharedDetails } | null>(null);
    const [removeData, setRemoveData] = useState<{ companyId: number; productId: number; message: string } | null>(null);
    const [editData, setEditData] = useState<{ companyId: number; productId: number; creatorInfo: ContentCreatorProductInfo; product: ProductDetail; percentage: number } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const result = await SharedProductsApi.getSharedProductsManagement();
            setData(result);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchValue(value);
        if (searchDebounce) clearTimeout(searchDebounce);

        const timeout = setTimeout(async () => {
            try {
                const results = await SharedProductsApi.searchSharedProducts(value);
                if (data) {
                    setData({
                        ...data,
                        productsSharedWithMe: results
                    });
                }
            } catch {
                toast.error('Failed to search products');
            }
        }, 500);

        setSearchDebounce(timeout);
    };

    const toggleCreatorExpanded = (creatorId: number) => {
        const newSet = new Set(expandedCreators);
        if (newSet.has(creatorId)) {
            newSet.delete(creatorId);
        } else {
            newSet.add(creatorId);
        }
        setExpandedCreators(newSet);
    };

    const handleOpenShareModal = async (creatorId: number) => {
        try {
            const info = await SharedProductsApi.getProductsForContentCreator(creatorId);
            setSelectedCreator({ id: creatorId, data: info });
            setSelectedPercentage('');
            setShareModalOpen(true);
        } catch {
            toast.error('Failed to load creator products');
        }
    };

    const handleShareProduct = async () => {
        if (!selectedCreator || !selectedProduct || !selectedPercentage) {
            toast.error('Please select a product and enter a percentage');
            return;
        }

        const percentage = parseInt(selectedPercentage.replace('%', ''));
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            toast.error('Please enter a valid percentage (0-100)');
            return;
        }

        try {
            await SharedProductsApi.shareProduct({
                companyId: selectedCreator.id,
                productId: selectedProduct.id,
                percentage
            });
            toast.success('Product sent to review');
            setShareModalOpen(false);
            loadData();
        } catch {
            toast.error('Failed to share product');
        }
    };

    const handleOpenEditModal = async (creatorId: number, productId: number) => {
        try {
            const result = await SharedProductsApi.getSharedProduct(creatorId, productId);
            if (result.productDetailsShared) {
                setEditData({
                    companyId: creatorId,
                    productId,
                    creatorInfo: {
                        ...result,
                        image: result.image || '',
                        productDetailsSharedList: result.productDetailsShared ? [result.productDetailsShared] : []
                    },
                    product: result.productDetailsShared,
                    percentage: result.percentage
                });
                setSelectedPercentage(`${result.percentage}%`);
                setEditModalOpen(true);
            }
        } catch {
            toast.error('Failed to load product details');
        }
    };

    const handleEditProduct = async () => {
        if (!editData || !selectedPercentage) return;

        const percentage = parseInt(selectedPercentage.replace('%', ''));
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            toast.error('Please enter a valid percentage (0-100)');
            return;
        }

        try {
            await SharedProductsApi.editProduct({
                companyId: editData.companyId,
                productId: editData.productId,
                percentage
            });
            toast.success('Product sent to review');
            setEditModalOpen(false);
            loadData();
        } catch {
            toast.error('Failed to edit product');
        }
    };

    const handleOpenReviewModal = async (productId: number, owner: string, percentage: number) => {
        try {
            const details = await SharedProductsApi.getProductDetails(productId);
            setReviewProduct({
                id: productId,
                owner,
                percentage,
                details: {
                    ...details,
                    owner,
                    image: details.productImage || '',
                    percentage,
                    soldCount: 0,
                    ownerId: 0
                }
            });
            setReviewModalOpen(true);
        } catch {
            toast.error('Failed to load product details');
        }
    };

    const handleAcceptProduct = async () => {
        if (!reviewProduct) return;

        try {
            await SharedProductsApi.acceptProduct(reviewProduct.id);
            toast.success('Product accepted');
            setReviewModalOpen(false);
            loadData();
        } catch {
            toast.error('Failed to accept product');
        }
    };

    const handleDeclineProduct = async () => {
        if (!reviewProduct) return;

        try {
            await SharedProductsApi.declineProduct(reviewProduct.id);
            toast.success('Product declined');
            setReviewModalOpen(false);
            loadData();
        } catch {
            toast.error('Failed to decline product');
        }
    };

    const handleOpenRemoveModal = (companyId: number, productId: number, message: string) => {
        setRemoveData({ companyId, productId, message });
        setRemoveModalOpen(true);
    };

    const handleRemoveProduct = async () => {
        if (!removeData) return;

        try {
            await SharedProductsApi.removeProduct(removeData.companyId, removeData.productId);
            toast.success('Product removed');
            setRemoveModalOpen(false);
            loadData();
        } catch {
            toast.error('Failed to remove product');
        }
    };

    const formatPercentage = (value: string) => {
        const numValue = value.replace(/[^0-9]/g, '');
        if (numValue === '') return '';
        const num = parseInt(numValue);
        if (num > 100) return '100%';
        if (num < 0) return '0%';
        return `${num}%`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Failed to load data</p>
                    <button
                        onClick={loadData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/cms/admin/network')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Network
                    </button>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Shared Products</h1>

                        {/* Tabs */}
                        <div className="flex gap-2 border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('creators')}
                                className={`px-6 py-3 font-medium transition-all relative ${
                                    activeTab === 'creators'
                                        ? 'text-purple-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Content Creators
                                    <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                                        {data.userConnectionDetailsList.length}
                                    </span>
                                </div>
                                {activeTab === 'creators' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
                                )}
                            </button>

                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`px-6 py-3 font-medium transition-all relative ${
                                    activeTab === 'pending'
                                        ? 'text-purple-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Pending Review
                                    <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">
                                        {data.pendingReviewProductsList.length}
                                    </span>
                                </div>
                                {activeTab === 'pending' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
                                )}
                            </button>

                            <button
                                onClick={() => setActiveTab('shared')}
                                className={`px-6 py-3 font-medium transition-all relative ${
                                    activeTab === 'shared'
                                        ? 'text-purple-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Shared With Me
                                    <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700">
                                        {data.productsSharedWithMe.length}
                                    </span>
                                </div>
                                {activeTab === 'shared' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Creators Tab */}
                {activeTab === 'creators' && (
                    <div className="space-y-4">
                        {data.userConnectionDetailsList.length > 0 ? (
                            data.userConnectionDetailsList.map((creator) => (
                                <ContentCreatorCard
                                    key={creator.id}
                                    creator={creator}
                                    isExpanded={expandedCreators.has(creator.id)}
                                    onToggleExpand={() => toggleCreatorExpanded(creator.id)}
                                    onOpenShareModal={() => handleOpenShareModal(creator.id)}
                                    onEdit={(productId) => handleOpenEditModal(creator.id, productId)}
                                    onRemove={(productId) => handleOpenRemoveModal(
                                        creator.id,
                                        productId,
                                        'Removing this product will also remove it from all videos of the content creator.'
                                    )}
                                />
                            ))
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 text-lg">No content creators connected yet</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pending Review Tab */}
                {activeTab === 'pending' && (
                    <div>
                        {data.pendingReviewProductsList.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {data.pendingReviewProductsList.map((product) => (
                                    <PendingProductCard
                                        key={product.id}
                                        product={product}
                                        onClick={() => handleOpenReviewModal(product.id, product.owner, product.percentage)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 text-lg">No products pending review</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Shared With Me Tab */}
                {activeTab === 'shared' && (
                    <div>
                        {/* Search */}
                        <div className="mb-6">
                            <div className="relative max-w-md">
                                <input
                                    type="search"
                                    placeholder="Search products..."
                                    value={searchValue}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
                                />
                                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                            </div>
                        </div>

                        {data.productsSharedWithMe.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {data.productsSharedWithMe.map((product) => (
                                    <SharedProductCard
                                        key={product.id}
                                        product={product}
                                        onRemove={() => handleOpenRemoveModal(
                                            product.ownerId,
                                            product.id,
                                            'Removing this product will also remove it from all your videos that contain it.'
                                        )}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 text-lg">No products shared with you yet</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Share Modal */}
                {shareModalOpen && selectedCreator && (
                    <ShareProductModal
                        creatorInfo={selectedCreator.data}
                        selectedProduct={selectedProduct}
                        percentage={selectedPercentage}
                        onSelectProduct={(product) => setSelectedProduct(product)}
                        onPercentageChange={(value) => setSelectedPercentage(formatPercentage(value))}
                        onShare={handleShareProduct}
                        onClose={() => setShareModalOpen(false)}
                    />
                )}

                {/* Edit Modal */}
                {editModalOpen && editData && (
                    <EditProductModal
                        creatorInfo={editData.creatorInfo}
                        product={editData.product}
                        percentage={selectedPercentage}
                        onPercentageChange={(value) => setSelectedPercentage(formatPercentage(value))}
                        onEdit={handleEditProduct}
                        onClose={() => setEditModalOpen(false)}
                    />
                )}

                {/* Review Modal */}
                {reviewModalOpen && reviewProduct && (
                    <ReviewProductModal
                        product={reviewProduct.details}
                        owner={reviewProduct.owner}
                        percentage={reviewProduct.percentage}
                        onAccept={handleAcceptProduct}
                        onDecline={handleDeclineProduct}
                        onClose={() => setReviewModalOpen(false)}
                    />
                )}

                {/* Remove Confirmation Modal */}
                {removeModalOpen && removeData && (
                    <ConfirmRemovalModal
                        message={removeData.message}
                        onConfirm={handleRemoveProduct}
                        onCancel={() => setRemoveModalOpen(false)}
                    />
                )}
            </div>
        </div>
    );
}

// Component: Content Creator Card
function ContentCreatorCard({
    creator,
    isExpanded,
    onToggleExpand,
    onOpenShareModal,
    onEdit,
    onRemove
}: {
    creator: UserConnectionDetails;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onOpenShareModal: () => void;
    onEdit: (productId: number) => void;
    onRemove: (productId: number) => void;
}) {
    const hasProducts = creator.sharedProductsList.length > 0 || creator.sharedPendingProductsList.length > 0;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Creator Header */}
            <div
                className={`p-6 ${hasProducts ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
                onClick={hasProducts ? onToggleExpand : undefined}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        {creator.profilePicture ? (
                            <img
                                src={creator.profilePicture}
                                alt={creator.displayName}
                                className="w-16 h-16 rounded-full object-cover ring-2 ring-purple-100"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                                <User className="w-8 h-8 text-purple-600" />
                            </div>
                        )}
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{creator.displayName}</h3>
                            <p className="text-sm text-gray-600">{creator.userRole}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-center px-4 py-2 bg-purple-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Shared</p>
                            <p className="text-lg font-bold text-purple-600">{creator.sharedProductsCount}</p>
                        </div>
                        <div className="text-center px-4 py-2 bg-emerald-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Sold</p>
                            <p className="text-lg font-bold text-emerald-600">{creator.sold}</p>
                        </div>
                        <div className="text-center px-4 py-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Revenue</p>
                            <p className="text-lg font-bold text-blue-600">${creator.revenue.toFixed(2)}</p>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenShareModal();
                            }}
                            className="p-3 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Share products"
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>

                        {hasProducts && (
                            <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors">
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Products */}
            {isExpanded && hasProducts && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {creator.sharedPendingProductsList.map((product) => (
                            <ProductCard
                                key={`pending-${product.id}`}
                                product={product}
                                isPending={true}
                                onEdit={() => onEdit(product.id)}
                                onRemove={() => onRemove(product.id)}
                            />
                        ))}
                        {creator.sharedProductsList.map((product) => (
                            <ProductCard
                                key={`accepted-${product.id}`}
                                product={product}
                                isPending={false}
                                onEdit={() => onEdit(product.id)}
                                onRemove={() => onRemove(product.id)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Component: Product Card (for creator's products)
function ProductCard({
    product,
    isPending,
    onEdit,
    onRemove
}: {
    product: ProductSharedDetails;
    isPending: boolean;
    onEdit: () => void;
    onRemove: () => void;
}) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
                {isPending && (
                    <div className="absolute top-0 left-0 right-0 bg-yellow-500 text-white text-center py-1.5 text-xs font-semibold z-10">
                        Pending Review
                    </div>
                )}
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-36 object-cover ${isPending ? 'mt-7' : ''}`}
                    />
                ) : (
                    <div className={`w-full h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${isPending ? 'mt-7' : ''}`}>
                        <Package className="w-12 h-12 text-gray-400" />
                    </div>
                )}
            </div>
            <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3 truncate">{product.name}</h4>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>Commission:</span>
                    <span className="font-bold text-purple-600">{product.percentage}%</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>Sold:</span>
                    <span className="font-bold text-gray-900">{product.soldCount}</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onEdit}
                        className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </button>
                    <button
                        onClick={onRemove}
                        className="flex-1 px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}

// Component: Pending Product Card
function PendingProductCard({
    product,
    onClick
}: {
    product: ProductSharedDetails;
    onClick: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-all hover:-translate-y-1"
        >
            {product.image ? (
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                />
            ) : (
                <div className="w-full h-48 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                    <Package className="w-16 h-16 text-yellow-600" />
                </div>
            )}
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 truncate">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-1">From: <strong className="text-gray-900">{product.owner}</strong></p>
                <div className="mt-3 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <p className="text-xs text-yellow-700 font-medium">Click to review</p>
                </div>
            </div>
        </div>
    );
}

// Component: Shared Product Card
function SharedProductCard({
    product,
    onRemove
}: {
    product: ProductSharedDetails;
    onRemove: () => void;
}) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {product.image ? (
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                />
            ) : (
                <div className="w-full h-48 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                    <Package className="w-16 h-16 text-emerald-600" />
                </div>
            )}
            <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3 truncate">{product.name}</h4>
                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Owner:</span>
                        <span className="font-medium text-gray-900">{product.owner}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Commission:</span>
                        <span className="font-bold text-emerald-600">{product.percentage}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Sold:</span>
                        <span className="font-bold text-gray-900">{product.soldCount}</span>
                    </div>
                </div>
                <button
                    onClick={onRemove}
                    className="w-full px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    Remove
                </button>
            </div>
        </div>
    );
}

// Modal: Share Product
function ShareProductModal({
    creatorInfo,
    selectedProduct,
    percentage,
    onSelectProduct,
    onPercentageChange,
    onShare,
    onClose
}: {
    creatorInfo: ContentCreatorProductInfo;
    selectedProduct: ProductDetail | null;
    percentage: string;
    onSelectProduct: (product: ProductDetail) => void;
    onPercentageChange: (value: string) => void;
    onShare: () => void;
    onClose: () => void;
}) {
    const revenue = selectedProduct ? {
        creator: (selectedProduct.price * (parseInt(percentage.replace('%', '') || '0') / 100)).toFixed(2),
        brand: (selectedProduct.price - (selectedProduct.price * (parseInt(percentage.replace('%', '') || '0') / 100))).toFixed(2)
    } : { creator: '0.00', brand: '0.00' };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-gray-900">Share Product</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Creator Info */}
                    <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl mb-6">
                        {creatorInfo.image ? (
                            <img src={creatorInfo.image} alt={creatorInfo.name} className="w-16 h-16 rounded-full ring-2 ring-purple-200" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center">
                                <User className="w-8 h-8 text-purple-600" />
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold text-gray-900">{creatorInfo.name}</h3>
                            <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                <span>{creatorInfo.followersCount.toLocaleString()} followers</span>
                                <span>{creatorInfo.videosCount} videos</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
                        <select
                            value={selectedProduct?.id || ''}
                            onChange={(e) => {
                                const product = creatorInfo.productDetailsSharedList.find(p => p.id === parseInt(e.target.value));
                                if (product) onSelectProduct(product);
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
                        >
                            <option value="">Choose a product...</option>
                            {creatorInfo.productDetailsSharedList.map((product) => (
                                <option key={product.id} value={product.id}>{product.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Product Details */}
                    {selectedProduct && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                {selectedProduct.productImage ? (
                                    <img
                                        src={selectedProduct.productImage}
                                        alt={selectedProduct.name}
                                        className="w-full h-64 object-cover rounded-xl shadow-md"
                                    />
                                ) : (
                                    <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                                        <Package className="w-24 h-24 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-900 text-lg mb-2">{selectedProduct.name}</h4>
                                <p className="text-2xl font-bold text-gray-900 mb-6">${selectedProduct.price.toFixed(2)}</p>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Commission Percentage</label>
                                    <input
                                        type="text"
                                        value={percentage}
                                        onChange={(e) => onPercentageChange(e.target.value)}
                                        placeholder="e.g., 30%"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                                    />
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Creator gets:</span>
                                        <span className="text-lg font-bold text-purple-600">${revenue.creator}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">You get:</span>
                                        <span className="text-lg font-bold text-blue-600">${revenue.brand}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onShare}
                        disabled={!selectedProduct || !percentage}
                        className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl"
                    >
                        Share Product with Creator
                    </button>
                </div>
            </div>
        </div>
    );
}

// Modal: Edit Product
function EditProductModal({
    creatorInfo,
    product,
    percentage,
    onPercentageChange,
    onEdit,
    onClose
}: {
    creatorInfo: ContentCreatorProductInfo;
    product: ProductDetail;
    percentage: string;
    onPercentageChange: (value: string) => void;
    onEdit: () => void;
    onClose: () => void;
}) {
    const revenue = {
        creator: (product.price * (parseInt(percentage.replace('%', '') || '0') / 100)).toFixed(2),
        brand: (product.price - (product.price * (parseInt(percentage.replace('%', '') || '0') / 100))).toFixed(2)
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Product Share</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Creator Info */}
                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl mb-6">
                        {creatorInfo.image ? (
                            <img src={creatorInfo.image} alt={creatorInfo.name} className="w-16 h-16 rounded-full ring-2 ring-blue-200" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center">
                                <User className="w-8 h-8 text-blue-600" />
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold text-gray-900">{creatorInfo.name}</h3>
                            <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                <span>{creatorInfo.followersCount.toLocaleString()} followers</span>
                                <span>{creatorInfo.videosCount} videos</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(product as any).productImage ? (
                                <img
                                    src={(product as unknown as {productImage: string}).productImage}
                                    alt={product.name}
                                    className="w-full h-64 object-cover rounded-xl shadow-md"
                                />
                            ) : (
                                <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                                    <Package className="w-24 h-24 text-gray-400" />
                                </div>
                            )}
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 text-lg mb-2">{product.name}</h4>
                            <p className="text-2xl font-bold text-gray-900 mb-6">${product.price.toFixed(2)}</p>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Commission Percentage</label>
                                <input
                                    type="text"
                                    value={percentage}
                                    onChange={(e) => onPercentageChange(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                />
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Creator gets:</span>
                                    <span className="text-lg font-bold text-blue-600">${revenue.creator}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">You get:</span>
                                    <span className="text-lg font-bold text-emerald-600">${revenue.brand}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                            <strong>Note:</strong> Updating this product will remove it from all videos containing it. The creator will need to review and accept the changes.
                        </p>
                    </div>

                    <button
                        onClick={onEdit}
                        disabled={!percentage}
                        className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-xl hover:from-blue-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl"
                    >
                        Confirm Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

// Modal: Review Product
function ReviewProductModal({
    product,
    owner,
    percentage,
    onAccept,
    onDecline,
    onClose
}: {
    product: ProductSharedDetails;
    owner: string;
    percentage: number;
    onAccept: () => void;
    onDecline: () => void;
    onClose: () => void;
}) {
    const creatorRevenue = ((product as unknown as {price: number}).price * (percentage / 100)).toFixed(2);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-gray-900">Review Product</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(product as any).productImage ? (
                                <img
                                    src={(product as unknown as {productImage: string}).productImage}
                                    alt={product.name}
                                    className="w-full h-64 object-cover rounded-xl shadow-md"
                                />
                            ) : (
                                <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                                    <Package className="w-24 h-24 text-gray-400" />
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                            <p className="text-3xl font-bold text-gray-900 mb-4">${(product as unknown as {price: number}).price.toFixed(2)}</p>
                            {(product as unknown as {description?: string}).description && (
                                <p className="text-gray-600 mb-6 line-clamp-3">{(product as unknown as {description: string}).description}</p>
                            )}

                            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-5 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Product owner:</span>
                                    <span className="font-semibold text-gray-900">{owner}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Commission rate:</span>
                                    <span className="font-bold text-emerald-600">{percentage}%</span>
                                </div>
                                <div className="pt-3 border-t border-gray-200">
                                    <p className="text-sm text-gray-600 mb-2">Your earnings per sale:</p>
                                    <p className="text-3xl font-bold text-emerald-600">${creatorRevenue}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onAccept}
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                        >
                            <Check className="w-5 h-5" />
                            Accept Product
                        </button>
                        <button
                            onClick={onDecline}
                            className="flex-1 px-6 py-4 border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2 font-semibold"
                        >
                            <X className="w-5 h-5" />
                            Decline
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Modal: Confirm Removal
function ConfirmRemovalModal({
    message,
    onConfirm,
    onCancel
}: {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Confirm Removal</h3>
                <p className="text-gray-600 mb-6 text-center">{message}</p>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-medium shadow-lg"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}
