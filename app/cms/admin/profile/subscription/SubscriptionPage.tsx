"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    CreditCard,
    AlertCircle,
    CheckCircle,
    X,
    Check,
} from "lucide-react";
import { toast } from "react-toastify";
import { profileApi } from "@/app/services/profileApi";
import {
    SubscriptionData,
    SubscriptionPlan,
    UpdateSubscriptionRequest,
    CompanyPaymentMethod,
    ProratePreviewResponse,
} from "@/app/types/Profile";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import ConfirmationModal from "@/app/components/shared/ConfirmationModal";

export default function SubscriptionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
    const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
    const [isAnnual, setIsAnnual] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);
    const [showChangeSubscriptionModal, setShowChangeSubscriptionModal] = useState(false);
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [showUpgradeFromTrialModal, setShowUpgradeFromTrialModal] = useState(false);
    const [showChangePaymentModal, setShowChangePaymentModal] = useState(false);
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
    const [showReactivateConfirmation, setShowReactivateConfirmation] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [proratePreview, setProratePreview] = useState<ProratePreviewResponse | null>(null);
    const [loadingProrate, setLoadingProrate] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [subData, plansData] = await Promise.all([
                profileApi.getSubscription(),
                profileApi.getAvailableSubscriptions(),
            ]);

            setSubscriptionData(subData);
            setAvailablePlans(plansData.subscriptions);

            console.log("Available plans:", plansData.subscriptions);
            console.log("Current subscription:", subData.subscription);

            if (subData.subscription) {
                setIsAnnual(subData.subscription.annual || false);
                setSelectedPlanId(subData.subscription.subscriptionId);
            }

            if (subData.subscriptionPaymentId) {
                setSelectedPaymentMethodId(subData.subscriptionPaymentId);
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to load subscription data");
        } finally {
            setLoading(false);
        }
    };

    const loadProratePreview = async (planId: number, annual: boolean) => {
        if (!subscriptionData?.subscription || !showChangeSubscriptionModal) return;

        // Skip prorate preview for Shopify subscriptions - they handle pricing through their own system
        const isShopifySubscription = subscriptionData.subscription.subscriptionOrigin === "shopify";
        if (isShopifySubscription) {
            setProratePreview(null);
            setLoadingProrate(false);
            return;
        }

        try {
            setLoadingProrate(true);
            const preview = await profileApi.getProratePreview({
                newSubscriptionID: planId,
                annual: annual,
            });
            setProratePreview(preview);
        } catch (err) {
            console.error("Failed to load prorate preview:", err);
            setProratePreview(null);
        } finally {
            setLoadingProrate(false);
        }
    };

    useEffect(() => {
        const isShopifySubscription = subscriptionData?.subscription?.subscriptionOrigin === "shopify";
        if (showChangeSubscriptionModal && selectedPlanId && !isShopifySubscription) {
            loadProratePreview(selectedPlanId, isAnnual);
        } else {
            setProratePreview(null);
        }
    }, [selectedPlanId, isAnnual, showChangeSubscriptionModal, subscriptionData]);

    const isCurrentSubscription = () => {
        if (!subscriptionData?.subscription || !selectedPlanId) return false;

        // For Shopify subscriptions, only compare the plan ID (not annual flag)
        const isShopifySubscription = subscriptionData.subscription.subscriptionOrigin === "shopify";
        if (isShopifySubscription) {
            return subscriptionData.subscription.subscriptionId === selectedPlanId;
        }

        // For Stripe subscriptions, compare both plan ID and annual flag
        return (
            subscriptionData.subscription.subscriptionId === selectedPlanId &&
            subscriptionData.subscription.annual === isAnnual
        );
    };

    const handleUpdateSubscription = async () => {
        if (!selectedPlanId) {
            toast.error("Please select a subscription plan");
            return;
        }

        if (isCurrentSubscription()) {
            toast.info("This is already your current subscription");
            return;
        }

        const isShopifySubscription = subscriptionData?.subscription?.subscriptionOrigin === "shopify";

        try {
            setSubmitting(true);
            const data: UpdateSubscriptionRequest = {
                newSubscriptionID: selectedPlanId,
                annual: isShopifySubscription ? false : isAnnual, // Shopify doesn't use annual toggle
            };

            const result = await profileApi.updateSubscription(data);

            if (result.status === "success") {
                // For Shopify subscriptions, always expect a redirect URL
                if (result.redirect) {
                    toast.success("Redirecting to Shopify for payment...");
                    window.location.href = result.redirect;
                    return;
                }

                // For Stripe subscriptions, close modal and reload data
                toast.success("Subscription updated successfully");
                setShowChangeSubscriptionModal(false);
                await loadData();
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update subscription");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubscribeToNew = async () => {
        if (!selectedPlanId) {
            toast.error("Please select a subscription plan");
            return;
        }

        try {
            setSubmitting(true);
            const data: UpdateSubscriptionRequest = {
                newSubscriptionID: selectedPlanId,
                annual: isAnnual,
            };

            const result = await profileApi.subscribeToNew(data);

            if (result.status === "success") {
                toast.success("Subscription created successfully");
                if (result.redirect) {
                    window.location.href = result.redirect;
                } else {
                    setShowSubscribeModal(false);
                    await loadData();
                }
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to create subscription");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubscribeFromTrial = async () => {
        if (!selectedPlanId) {
            toast.error("Please select a subscription plan");
            return;
        }

        if (!selectedPaymentMethodId) {
            toast.error("Please select a payment method");
            return;
        }

        try {
            setSubmitting(true);
            const result = await profileApi.subscribeFromTrial({
                newSubscriptionID: selectedPlanId,
                annual: isAnnual,
                paymentMethodId: selectedPaymentMethodId,
            });

            if (result.status === "success") {
                toast.success("Subscription activated successfully");
                if (result.redirect) {
                    window.location.href = result.redirect;
                } else {
                    setShowUpgradeFromTrialModal(false);
                    await loadData();
                }
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to activate subscription");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelSubscription = async () => {
        try {
            setSubmitting(true);
            const result = await profileApi.cancelSubscription();

            if (result.status === "success") {
                toast.success("Subscription canceled successfully");
                setShowCancelConfirmation(false);
                await loadData();
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to cancel subscription");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReactivateSubscription = async () => {
        try {
            setSubmitting(true);
            const result = await profileApi.reactivateSubscription();

            if (result.status === "success") {
                toast.success("Subscription reactivated successfully");
                setShowReactivateConfirmation(false);
                await loadData();
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to reactivate subscription");
        } finally {
            setSubmitting(false);
        }
    };

    const handleChangePaymentMethod = async () => {
        if (!selectedPaymentMethodId) {
            toast.error("Please select a payment method");
            return;
        }

        if (selectedPaymentMethodId === subscriptionData?.subscriptionPaymentId) {
            toast.error("This card is already set as the default");
            return;
        }

        try {
            setSubmitting(true);
            const result = await profileApi.changePaymentMethod(selectedPaymentMethodId);

            if (result.status === "success") {
                toast.success("Payment method updated successfully");
                setShowChangePaymentModal(false);
                await loadData();
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update payment method");
        } finally {
            setSubmitting(false);
        }
    };

    const renderStatusBadge = (status: string | undefined) => {
        if (!status) return null;

        const isActive = status.toLowerCase() === "active";
        const statusClass = isActive
            ? "bg-green-100 text-green-800 border-green-300"
            : "bg-orange-100 text-orange-800 border-orange-300";

        return (
            <span className={`inline-flex items-center px-4 py-2 rounded-lg border ${statusClass} font-semibold text-sm`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const renderSubscriptionPlanCards = () => {
        const activePlans = availablePlans.filter((plan) => plan.isActive);
        console.log("Rendering plans - Available:", availablePlans.length, "Active:", activePlans.length);

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activePlans.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    const price = isAnnual ? plan.priceAnnually : plan.price;
                    const period = isAnnual ? "year" : "month";

                    return (
                        <div
                            key={plan.id}
                            onClick={() => setSelectedPlanId(plan.id)}
                            className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all ${
                                isSelected
                                    ? "border-blue-500 bg-blue-50 shadow-lg"
                                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                            }`}
                        >
                            {isSelected && (
                                <div className="absolute top-4 right-4">
                                    <CheckCircle className="h-6 w-6 text-blue-600" />
                                </div>
                            )}

                            <h3 className="text-xl font-bold mb-4">{plan.subscriptionName}</h3>

                            <div className="mb-6">
                                <span className="text-3xl font-bold text-blue-600">
                                    ${price.toFixed(2)}
                                </span>
                                <span className="text-gray-600 ml-2">/ {period}</span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>{plan.videosPerMonth} videos per month</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>{plan.maxLength} min max video length</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>{plan.maxProducts} products per video</span>
                                </div>
                                {plan.revenueSplit && plan.revenueSplit > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-600" />
                                        <span>{plan.revenueSplit}% revenue split</span>
                                    </div>
                                )}
                                {plan.analytics && (
                                    <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-600" />
                                        <span>Analytics</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderPaymentMethodCards = (paymentMethods: CompanyPaymentMethod[] | undefined) => {
        if (!paymentMethods || paymentMethods.length === 0) {
            return <p className="text-gray-600">No payment methods available</p>;
        }

        return (
            <div className="space-y-3">
                {paymentMethods.map((method) => {
                    const isSelected = selectedPaymentMethodId === method.paymentMethodId;
                    const isCurrent = subscriptionData?.subscriptionPaymentId === method.paymentMethodId;

                    return (
                        <div
                            key={method.paymentMethodId}
                            onClick={() => setSelectedPaymentMethodId(method.paymentMethodId)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between ${
                                isSelected
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 bg-white hover:border-blue-300"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <CreditCard className="h-5 w-5 text-gray-600" />
                                <div>
                                    <p className="font-medium">Card ending in {method.mask}</p>
                                    {method.holderName && (
                                        <p className="text-sm text-gray-600">{method.holderName}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isCurrent && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                        Current
                                    </span>
                                )}
                                {isSelected && <CheckCircle className="h-5 w-5 text-blue-600" />}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <LoadingSpinner />
            </div>
        );
    }

    if (!subscriptionData?.subscription) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <button
                    onClick={() => router.push("/cms/admin/profile")}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Profile
                </button>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">No Active Subscription</h2>
                    <p className="text-gray-600 mb-6">
                        You do not have an active subscription. Subscribe to unlock all features.
                    </p>
                    <button
                        onClick={() => setShowSubscribeModal(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        View Subscription Plans
                    </button>
                </div>

                {/* Subscribe Modal */}
                {showSubscribeModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                                <h2 className="text-2xl font-bold">Select a Subscription</h2>
                                <button
                                    onClick={() => setShowSubscribeModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center justify-center mb-6">
                                    <span className={`mr-3 ${!isAnnual ? "font-bold" : ""}`}>Monthly</span>
                                    <button
                                        onClick={() => setIsAnnual(!isAnnual)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            isAnnual ? "bg-blue-600" : "bg-gray-200"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                isAnnual ? "translate-x-6" : "translate-x-1"
                                            }`}
                                        />
                                    </button>
                                    <span className={`ml-3 ${isAnnual ? "font-bold" : ""}`}>
                                        Annual (Save up to 20%)
                                    </span>
                                </div>

                                {renderSubscriptionPlanCards()}

                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={handleSubscribeToNew}
                                        disabled={!selectedPlanId || submitting}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? "Processing..." : "Subscribe"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const subscription = subscriptionData.subscription;
    const stats = subscriptionData.usageStats;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <button
                onClick={() => router.push("/cms/admin/profile")}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Profile
            </button>

            <h1 className="text-3xl font-bold mb-6">My Subscription</h1>

            {/* Subscription Status and Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="mb-6">{renderStatusBadge(subscription.status)}</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-1">Plan Name</h3>
                            <p className="text-lg font-medium">{subscription.name}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-1">Amount</h3>
                            <p className="text-lg font-medium">
                                ${subscription.amount?.toFixed(2)} / {subscription.annual ? "year" : "month"}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-1">Period</h3>
                            <p className="text-lg font-medium">{subscription.period}</p>
                        </div>

                        {subscription.status !== "Trial" && subscription.renewalDate && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-600 mb-1">Renewal Date</h3>
                                <p className="text-lg font-medium">{subscription.renewalDate}</p>
                            </div>
                        )}

                        {/* Payment Method - Show for non-admin subscriptions */}
                        {subscription.name !== "Admin Subscription" && !subscriptionData.externalPayments && subscriptionData.subscriptionPaymentId && subscriptionData.companyPaymentMethods && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-600 mb-1">Payment Method</h3>
                                {(() => {
                                    const currentPayment = subscriptionData.companyPaymentMethods.find(
                                        pm => pm.paymentMethodId === subscriptionData.subscriptionPaymentId
                                    );
                                    return currentPayment ? (
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-gray-600" />
                                            <p className="text-lg font-medium">
                                                Card ending in {currentPayment.mask}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-lg font-medium text-gray-500">No payment method set</p>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Usage Stats */}
                    {subscriptionData.role !== "Admin" && subscription.isActive && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-600 mb-3">Usage Statistics</h3>

                            {stats.maxMonthVideos !== null && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Monthly Videos</p>
                                    <p className="text-lg font-medium">
                                        {stats.remainingMonthVideos} / {stats.maxMonthVideos}
                                    </p>
                                </div>
                            )}

                            {stats.maxYearVideos !== null && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Yearly Videos</p>
                                    <p className="text-lg font-medium">
                                        {stats.remainingYearVideos} / {stats.maxYearVideos}
                                    </p>
                                </div>
                            )}

                            {stats.videoMaxLength !== null && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Video Max Length</p>
                                    <p className="text-lg font-medium">{stats.videoMaxLength} minutes</p>
                                </div>
                            )}

                            {stats.productPerVideo !== null && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Products Per Video</p>
                                    <p className="text-lg font-medium">{stats.productPerVideo}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            {subscription.name !== "Admin Subscription" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold mb-4">Manage Subscription</h2>

                    <div className="flex flex-wrap gap-3">
                        {subscription.cancelling ? (
                            <>
                                {subscription.subscriptionOrigin === "shopify" ? (
                                    <button
                                        onClick={() => setShowChangeSubscriptionModal(true)}
                                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Change Subscription
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowReactivateConfirmation(true)}
                                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Reactivate Subscription
                                    </button>
                                )}
                            </>
                        ) : !subscription.isActive ? (
                            <>
                                {subscription.subscriptionCanBeReactivated ? (
                                    <button
                                        onClick={() => setShowReactivateConfirmation(true)}
                                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Reactivate Subscription
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowSubscribeModal(true)}
                                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Subscribe
                                    </button>
                                )}
                            </>
                        ) : subscription.status === "trial" ? (
                            <button
                                onClick={() => setShowUpgradeFromTrialModal(true)}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Subscribe
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setShowChangeSubscriptionModal(true)}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Change Subscription
                                </button>

                                {!subscriptionData.externalPayments && (
                                    <button
                                        onClick={() => setShowChangePaymentModal(true)}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Change Payment Method
                                    </button>
                                )}

                                <button
                                    onClick={() => setShowCancelConfirmation(true)}
                                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors ml-auto"
                                >
                                    Cancel Subscription
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Change Subscription Modal */}
            {showChangeSubscriptionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative">
                        {/* Loading Overlay */}
                        {submitting && (
                            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
                                <div className="text-center">
                                    <LoadingSpinner size="lg" />
                                    <p className="mt-4 text-lg font-semibold text-gray-700">Updating your subscription...</p>
                                    <p className="text-sm text-gray-600 mt-2">Please wait while we process your request</p>
                                </div>
                            </div>
                        )}

                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Change Subscription</h2>
                                {subscriptionData.subscription.subscriptionOrigin === "shopify" ? (
                                    <p className="text-sm text-gray-600 mt-1">
                                        Choose a new plan. You'll be redirected to Shopify to complete the payment.
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-600 mt-1">
                                        Choose a new plan. Upgrades are prorated. Downgrades take effect at the end of your current billing period.
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => setShowChangeSubscriptionModal(false)}
                                disabled={submitting}
                                className="text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Only show annual toggle for non-Shopify subscriptions */}
                            {subscriptionData.subscription.subscriptionOrigin !== "shopify" && (
                                <div className="flex items-center justify-center mb-6">
                                    <span className={`mr-3 ${!isAnnual ? "font-bold" : ""}`}>Monthly</span>
                                    <button
                                        onClick={() => setIsAnnual(!isAnnual)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            isAnnual ? "bg-blue-600" : "bg-gray-200"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                isAnnual ? "translate-x-6" : "translate-x-1"
                                            }`}
                                        />
                                    </button>
                                    <span className={`ml-3 ${isAnnual ? "font-bold" : ""}`}>
                                        Annual (Save up to 20%)
                                    </span>
                                </div>
                            )}

                            {renderSubscriptionPlanCards()}

                            {/* Shopify Information Banner */}
                            {subscriptionData.subscription.subscriptionOrigin === "shopify" && selectedPlanId && !isCurrentSubscription() && (
                                <div className="mt-6 p-6 rounded-lg border-2 bg-blue-50 border-blue-200">
                                    <h3 className="text-lg font-bold mb-2">Shopify Subscription Change</h3>
                                    <p className="text-sm text-gray-700 mb-3">
                                        When you click "Change Subscription", you'll be redirected to Shopify to authorize and complete the subscription change.
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        Shopify will handle the billing and any applicable prorations based on your current billing cycle.
                                    </p>
                                </div>
                            )}

                            {/* Proration Information - Only for non-Shopify subscriptions */}
                            {subscriptionData.subscription.subscriptionOrigin !== "shopify" && loadingProrate && !isCurrentSubscription() && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-center">
                                        <LoadingSpinner size="sm" />
                                        <span className="ml-2 text-gray-600">Calculating pricing...</span>
                                    </div>
                                </div>
                            )}

                            {subscriptionData.subscription.subscriptionOrigin !== "shopify" && !loadingProrate && proratePreview && selectedPlanId && !isCurrentSubscription() && (
                                <div className={`mt-6 p-6 rounded-lg border-2 ${proratePreview.isUpgrade ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200"}`}>
                                    <h3 className="text-lg font-bold mb-4">
                                        {proratePreview.isUpgrade ? "Upgrade Summary" : "Downgrade Summary"}
                                    </h3>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Current Plan:</span>
                                            <span className="font-medium">
                                                {proratePreview.currentPlanName} - ${proratePreview.currentPrice.toFixed(2)}/{proratePreview.currentPeriod}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">New Plan:</span>
                                            <span className="font-medium">
                                                {proratePreview.newPlanName} - ${proratePreview.newPrice.toFixed(2)}/{proratePreview.newPeriod}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Days Remaining:</span>
                                            <span className="font-medium">{proratePreview.daysLeft} days</span>
                                        </div>
                                        {proratePreview.renewalDate && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Next Renewal:</span>
                                                <span className="font-medium">{proratePreview.renewalDate}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className={`p-4 rounded-lg ${proratePreview.isUpgrade ? "bg-blue-100" : "bg-green-100"}`}>
                                        {proratePreview.isUpgrade ? (
                                            <>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-lg font-bold">Charge Today:</span>
                                                    <span className="text-2xl font-bold">
                                                        ${proratePreview.proratedAmount.toFixed(2)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700">
                                                    {proratePreview.description}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center justify-center mb-3">
                                                    <span className="text-lg font-bold text-green-800">
                                                        Scheduled for Next Billing Cycle
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700 text-center">
                                                    {proratePreview.description}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {isCurrentSubscription() && selectedPlanId && !loadingProrate && (
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800 text-center">
                                        This is your current subscription plan. Please select a different plan to make changes.
                                    </p>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleUpdateSubscription}
                                    disabled={
                                        !selectedPlanId ||
                                        submitting ||
                                        (subscriptionData.subscription.subscriptionOrigin !== "shopify" && loadingProrate) ||
                                        isCurrentSubscription()
                                    }
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    {submitting
                                        ? (subscriptionData.subscription.subscriptionOrigin === "shopify" ? "Redirecting to Shopify..." : "Processing...")
                                        : isCurrentSubscription()
                                        ? "Current Subscription"
                                        : "Change Subscription"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscribe Modal */}
            {showSubscribeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Select a Subscription</h2>
                            <button
                                onClick={() => setShowSubscribeModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-center mb-6">
                                <span className={`mr-3 ${!isAnnual ? "font-bold" : ""}`}>Monthly</span>
                                <button
                                    onClick={() => setIsAnnual(!isAnnual)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        isAnnual ? "bg-blue-600" : "bg-gray-200"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            isAnnual ? "translate-x-6" : "translate-x-1"
                                        }`}
                                    />
                                </button>
                                <span className={`ml-3 ${isAnnual ? "font-bold" : ""}`}>
                                    Annual (Save up to 20%)
                                </span>
                            </div>

                            {renderSubscriptionPlanCards()}

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleSubscribeToNew}
                                    disabled={!selectedPlanId || submitting}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Processing..." : "Subscribe"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upgrade from Trial Modal */}
            {showUpgradeFromTrialModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Select a Subscription</h2>
                            <button
                                onClick={() => setShowUpgradeFromTrialModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-center">
                                <span className={`mr-3 ${!isAnnual ? "font-bold" : ""}`}>Monthly</span>
                                <button
                                    onClick={() => setIsAnnual(!isAnnual)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        isAnnual ? "bg-blue-600" : "bg-gray-200"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            isAnnual ? "translate-x-6" : "translate-x-1"
                                        }`}
                                    />
                                </button>
                                <span className={`ml-3 ${isAnnual ? "font-bold" : ""}`}>
                                    Annual (Save up to 20%)
                                </span>
                            </div>

                            {renderSubscriptionPlanCards()}

                            <div>
                                <h3 className="text-lg font-semibold mb-3">Select Payment Method</h3>
                                {renderPaymentMethodCards(subscriptionData.companyPaymentMethods)}
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => router.push("/cms/admin/profile/payment-methods")}
                                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Add New Payment Method
                                </button>
                                <button
                                    onClick={handleSubscribeFromTrial}
                                    disabled={!selectedPlanId || !selectedPaymentMethodId || submitting}
                                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Processing..." : "Subscribe"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Payment Method Modal */}
            {showChangePaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Change Payment Method</h2>
                            <button
                                onClick={() => setShowChangePaymentModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <h3 className="text-lg font-semibold">Select Payment Method</h3>
                            {renderPaymentMethodCards(subscriptionData.companyPaymentMethods)}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setShowChangePaymentModal(false)}
                                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleChangePaymentMethod}
                                    disabled={!selectedPaymentMethodId || submitting}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Updating..." : "Change Payment Method"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation */}
            <ConfirmationModal
                isOpen={showCancelConfirmation}
                onClose={() => setShowCancelConfirmation(false)}
                onConfirm={handleCancelSubscription}
                title="Cancel Subscription"
                message="Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period."
                confirmText="Yes, Cancel"
                cancelText="No, Keep Subscription"
                type="danger"
                loading={submitting}
            />

            {/* Reactivate Confirmation */}
            <ConfirmationModal
                isOpen={showReactivateConfirmation}
                onClose={() => setShowReactivateConfirmation(false)}
                onConfirm={handleReactivateSubscription}
                title="Reactivate Subscription"
                message="Reactivate your subscription? It will use the same payment method as before."
                confirmText="Yes, Reactivate"
                cancelText="Cancel"
                type="info"
                loading={submitting}
            />
        </div>
    );
}
