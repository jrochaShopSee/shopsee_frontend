"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { profileApi } from "@/app/services/profileApi";
import { Profile } from "@/app/types/Profile";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import {
    User,
    MapPin,
    CreditCard,
    Calendar,
    Edit2,
    Building2,
    Home,
    Wallet,
    Heart
} from "lucide-react";

const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await profileApi.getProfile();
                setProfile(data);
            } catch {
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-6">
                <p className="text-red-600">Failed to load profile</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">My Profile</h1>

            {/* General Section */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500 p-2 rounded-lg">
                            <User className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">General</h2>
                    </div>
                    <button
                        onClick={() => router.push("/cms/admin/profile/general")}
                        className="text-blue-600 hover:text-blue-700"
                        title="Edit"
                    >
                        <Edit2 className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex gap-2">
                        <span className="font-semibold text-gray-700">Display Name:</span>
                        <span className="text-gray-900">{profile.displayName}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-semibold text-gray-700">Email:</span>
                        <span className="text-gray-900">{profile.email}</span>
                    </div>
                    {profile.dateOfBirth && (
                        <div className="flex gap-2">
                            <span className="font-semibold text-gray-700">Date of Birth:</span>
                            <span className="text-gray-900">{profile.dateOfBirth}</span>
                        </div>
                    )}
                    {profile.question && (
                        <div className="flex gap-2">
                            <span className="font-semibold text-gray-700">Security Question:</span>
                            <span className="text-gray-900">{profile.question}</span>
                        </div>
                    )}
                    {profile.image && (
                        <div className="mt-4">
                            <span className="font-semibold text-gray-700">Profile Image:</span>
                            <div className="mt-2">
                                <img
                                    src={profile.image}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Address Information */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-500 p-2 rounded-lg">
                            <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">Address Information</h2>
                    </div>
                    <button
                        onClick={() => router.push("/cms/admin/profile/addresses")}
                        className="text-purple-600 hover:text-purple-700"
                        title="View my addresses"
                    >
                        <Edit2 className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    {(profile.role === "Company" || profile.role === "Admin") && (
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Your Company Address
                            </h3>
                            {profile.companyAddress ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <span className="font-semibold text-gray-700">Name:</span>
                                        <span className="ml-2 text-gray-900">
                                            {profile.companyAddress.firstName} {profile.companyAddress.lastName}
                                        </span>
                                    </div>
                                    {profile.companyAddress.company && (
                                        <div>
                                            <span className="font-semibold text-gray-700">Company:</span>
                                            <span className="ml-2 text-gray-900">{profile.companyAddress.company}</span>
                                        </div>
                                    )}
                                    <div className="md:col-span-2">
                                        <span className="font-semibold text-gray-700">Address:</span>
                                        <span className="ml-2 text-gray-900">
                                            {profile.companyAddress.streetAddress}
                                            {profile.companyAddress.streetAddress2 && `, ${profile.companyAddress.streetAddress2}`}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">City:</span>
                                        <span className="ml-2 text-gray-900">{profile.companyAddress.city}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">State:</span>
                                        <span className="ml-2 text-gray-900">{profile.companyAddress.state}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">ZIP:</span>
                                        <span className="ml-2 text-gray-900">{profile.companyAddress.zip}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">Country:</span>
                                        <span className="ml-2 text-gray-900">{profile.companyAddress.country}</span>
                                    </div>
                                    {profile.companyAddress.email && (
                                        <div>
                                            <span className="font-semibold text-gray-700">Email:</span>
                                            <span className="ml-2 text-gray-900">{profile.companyAddress.email}</span>
                                        </div>
                                    )}
                                    {profile.companyAddress.phone && (
                                        <div>
                                            <span className="font-semibold text-gray-700">Phone:</span>
                                            <span className="ml-2 text-gray-900">{profile.companyAddress.phone}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-4">
                                    You don&apos;t have any company address selected as your default address, please select a new address{" "}
                                    <a
                                        href="/cms/admin/profile/addresses"
                                        className="text-blue-600 hover:text-blue-700 underline"
                                    >
                                        here
                                    </a>
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Your Default Shipping Address
                        </h3>
                        {profile.shippingAddress ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <span className="font-semibold text-gray-700">Name:</span>
                                    <span className="ml-2 text-gray-900">
                                        {profile.shippingAddress.firstName} {profile.shippingAddress.lastName}
                                    </span>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="font-semibold text-gray-700">Address:</span>
                                    <span className="ml-2 text-gray-900">
                                        {profile.shippingAddress.streetAddress}
                                        {profile.shippingAddress.streetAddress2 && `, ${profile.shippingAddress.streetAddress2}`}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">City:</span>
                                    <span className="ml-2 text-gray-900">{profile.shippingAddress.city}</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">State:</span>
                                    <span className="ml-2 text-gray-900">{profile.shippingAddress.state}</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">ZIP:</span>
                                    <span className="ml-2 text-gray-900">{profile.shippingAddress.zip}</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Country:</span>
                                    <span className="ml-2 text-gray-900">{profile.shippingAddress.country}</span>
                                </div>
                                {profile.shippingAddress.email && (
                                    <div>
                                        <span className="font-semibold text-gray-700">Email:</span>
                                        <span className="ml-2 text-gray-900">{profile.shippingAddress.email}</span>
                                    </div>
                                )}
                                {profile.shippingAddress.phone && (
                                    <div>
                                        <span className="font-semibold text-gray-700">Phone:</span>
                                        <span className="ml-2 text-gray-900">{profile.shippingAddress.phone}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-4">
                                You don&apos;t have any default shipping address, please set an address as your default shipping address{" "}
                                <a
                                    href="/cms/admin/profile/addresses"
                                    className="text-blue-600 hover:text-blue-700 underline"
                                >
                                    here
                                </a>
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Subscription Section */}
            {profile.subscription?.name && (
                <section className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-500 p-2 rounded-lg">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800">Subscription</h2>
                        </div>
                        <button
                            onClick={() => router.push("/cms/admin/profile/subscription")}
                            className="text-green-600 hover:text-green-700"
                            title="Edit"
                        >
                            <Edit2 className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex gap-2">
                            <span className="font-semibold text-gray-700">Name:</span>
                            <span className="text-gray-900">{profile.subscription.name}</span>
                        </div>
                        {profile.subscription.amount !== undefined && (
                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-700">Amount:</span>
                                <span className="text-gray-900">${profile.subscription.amount.toFixed(2)}</span>
                            </div>
                        )}
                        {profile.subscription.status && (
                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-700">Status:</span>
                                <span className="text-gray-900 capitalize">{profile.subscription.status}</span>
                            </div>
                        )}
                        {profile.subscription.renewalDate && (
                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-700">Renewal Date:</span>
                                <span className="text-gray-900">{profile.subscription.renewalDate}</span>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Payment Information */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-500 p-2 rounded-lg">
                            <Wallet className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">Payment Information</h2>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    {/* Credit Card */}
                    {profile.creditCard ? (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Credit Card
                                </h3>
                                <button
                                    onClick={() => router.push("/cms/admin/profile/payment-methods")}
                                    className="text-orange-600 hover:text-orange-700"
                                    title="Edit"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                                <div className="flex gap-2">
                                    <span className="font-semibold text-gray-700">Cardholder Name:</span>
                                    <span className="text-gray-900">{profile.creditCard.cardHolderName}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="font-semibold text-gray-700">Card Number:</span>
                                    <span className="text-gray-900">{profile.creditCard.cardNumber}</span>
                                </div>
                                {profile.creditCard.expiryDate && (
                                    <div className="flex gap-2">
                                        <span className="font-semibold text-gray-700">Expiry Date:</span>
                                        <span className="text-gray-900">{profile.creditCard.expiryDate}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-4">
                            You don&apos;t have any default credit card, please set one{" "}
                            <a
                                href="/cms/admin/profile/payment-methods"
                                className="text-blue-600 hover:text-blue-700 underline"
                            >
                                here
                            </a>
                        </p>
                    )}

                    {/* Bank Account */}
                    {profile.bankAccount && (
                        <>
                            <hr className="border-gray-200" />
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />
                                        Bank Account
                                    </h3>
                                    <button
                                        onClick={() => router.push("/cms/admin/profile/bank-account")}
                                        className="text-orange-600 hover:text-orange-700"
                                        title="Edit"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                                    {profile.bankAccount.bankName && (
                                        <div className="flex gap-2">
                                            <span className="font-semibold text-gray-700">Bank Name:</span>
                                            <span className="text-gray-900">{profile.bankAccount.bankName}</span>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <span className="font-semibold text-gray-700">Account Holder:</span>
                                        <span className="text-gray-900">{profile.bankAccount.accountHolderName}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-semibold text-gray-700">Routing Number:</span>
                                        <span className="text-gray-900">{profile.bankAccount.routingNumber}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-semibold text-gray-700">Account Number:</span>
                                        <span className="text-gray-900">{profile.bankAccount.accountNumber}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* User Interests */}
            {profile.userInterests && profile.userInterests.length > 0 && (
                <section className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-pink-500 p-2 rounded-lg">
                                <Heart className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800">Interests</h2>
                        </div>
                        <button
                            onClick={() => router.push("/cms/admin/profile/interests")}
                            className="text-pink-600 hover:text-pink-700"
                            title="Edit"
                        >
                            <Edit2 className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-wrap gap-2">
                            {profile.userInterests.map((interest) => (
                                <span
                                    key={interest.categoryId}
                                    className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm"
                                >
                                    {interest.categoryName}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default ProfilePage;
