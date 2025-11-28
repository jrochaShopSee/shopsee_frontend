"use client";

import { Heart, DollarSign } from 'lucide-react';
import type { ProfileProduct } from '@/app/types/userProfile';
import Image from 'next/image';

interface ProfileProductCardProps {
    product: ProfileProduct;
    onFavoriteToggle?: (productId: number) => void;
    onClick?: () => void;
}

export function ProfileProductCard({ product, onFavoriteToggle, onClick }: ProfileProductCardProps) {
    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFavoriteToggle?.(product.id);
    };

    const formatPrice = (price: number) => {
        return `$${price.toFixed(2)}`;
    };

    const getCurrentPrice = () => {
        if (product.salePrice && product.salePrice < product.price) {
            return product.salePrice;
        }
        return product.price;
    };

    const hasDiscount = product.salePrice && product.salePrice < product.price;
    const currentPrice = getCurrentPrice();

    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            onClick={onClick}
        >
            {/* Product Image */}
            <div className="relative aspect-square bg-gray-100">
                {product.productImage ? (
                    <Image
                        src={product.productImage}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <DollarSign className="w-16 h-16 text-gray-300" />
                    </div>
                )}

                {/* Favorite Button */}
                <button
                    onClick={handleFavoriteClick}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                >
                    <Heart
                        className={`w-5 h-5 ${
                            product.isFavorited
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-400'
                        }`}
                    />
                </button>

                {/* Discount Badge */}
                {hasDiscount && product.comparePrice && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                        {Math.round((1 - currentPrice / product.comparePrice) * 100)}% OFF
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>

                {/* Pricing */}
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-blue-600">{formatPrice(currentPrice)}</span>
                    {hasDiscount && (
                        <span className="text-sm text-gray-500 line-through">{formatPrice(product.price)}</span>
                    )}
                    {product.comparePrice && product.comparePrice > currentPrice && !hasDiscount && (
                        <span className="text-sm text-gray-500 line-through">{formatPrice(product.comparePrice)}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
