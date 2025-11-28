"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { profileApi } from "@/app/services/profileApi";
import { PaymentMethodViewModel } from "@/app/types/Profile";
import ConfirmationModal from "@/app/components/shared/ConfirmationModal";
import { ArrowLeft, CreditCard, Trash2, Star, Building2, ShoppingBag } from "lucide-react";

const PaymentMethodsPage: React.FC = () => {
    const router = useRouter();
    const [customerPayments, setCustomerPayments] = useState<PaymentMethodViewModel[]>([]);
    const [companyPayments, setCompanyPayments] = useState<PaymentMethodViewModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionId, setActionId] = useState<number | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "warning" | "danger" | "info" | "success";
        onConfirm: () => void;
    }>({ isOpen: false, title: "", message: "", type: "warning", onConfirm: () => {} });

    const loadPaymentMethods = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await profileApi.getPaymentMethods();
            setCustomerPayments(data.customerPayments || []);
            setCompanyPayments(data.companyPayments || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load payment methods");
            toast.error("Failed to load payment methods");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPaymentMethods();
    }, []);

    const handleDelete = async (paymentId: number, type: string) => {
        setActionId(paymentId);
        try {
            await profileApi.deletePaymentMethod(paymentId, type);
            toast.success("Payment method deleted successfully");
            await loadPaymentMethods();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete payment method");
        } finally {
            setActionId(null);
        }
    };

    const handleSetDefault = async (paymentId: number, type: string) => {
        setActionId(paymentId);
        try {
            await profileApi.setDefaultPaymentMethod(paymentId, type);
            toast.success(`${type} payment method set as default successfully`);
            await loadPaymentMethods();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to set as default");
        } finally {
            setActionId(null);
        }
    };

    const showDeleteConfirmation = (paymentId: number, type: string, cardMask: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Payment Method",
            message: `Are you sure you want to delete this card ending in ${cardMask}?`,
            type: "danger",
            onConfirm: () => {
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                handleDelete(paymentId, type);
            },
        });
    };

    const showSetDefaultConfirmation = (paymentId: number, type: string, cardMask: string) => {
        const typeLabel = type === "Company" ? "Company" : "Ecommerce";

        setConfirmModal({
            isOpen: true,
            title: `Set as Default ${typeLabel} Payment`,
            message: `Do you want to set card ending in ${cardMask} as the default ${typeLabel.toLowerCase()} payment method?`,
            type: "info",
            onConfirm: () => {
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                handleSetDefault(paymentId, type);
            },
        });
    };

    const renderPaymentCard = (payment: PaymentMethodViewModel, type: "Customer" | "Company") => {
        return (
            <Card key={payment.paymentMethodId} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${type === "Company" ? "bg-purple-50" : "bg-blue-50"}`}>
                            {type === "Company" ? (
                                <Building2 className="h-5 w-5 text-purple-600" />
                            ) : (
                                <ShoppingBag className="h-5 w-5 text-blue-600" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-gray-400" />
                                <h3 className="text-lg font-medium text-gray-900">
                                    {payment.name || "Card"}
                                </h3>
                                {payment.isDefault && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <Star className="h-3 w-3 fill-current" />
                                        Default
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                {payment.mask}
                            </p>
                            {payment.holderName && (
                                <p className="text-sm text-gray-500 mt-1">
                                    {payment.holderName}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => showDeleteConfirmation(payment.paymentMethodId, type, payment.mask)}
                            disabled={actionId === payment.paymentMethodId}
                            className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                            title="Delete Payment Method"
                        >
                            {actionId === payment.paymentMethodId ? (
                                <LoadingSpinner />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {!payment.isDefault && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => showSetDefaultConfirmation(payment.paymentMethodId, type, payment.mask)}
                            disabled={actionId === payment.paymentMethodId}
                            className="text-green-600 hover:text-green-700 border-green-300 hover:bg-green-50"
                        >
                            <Star className="h-4 w-4 mr-2" />
                            Set as Default
                        </Button>
                    </div>
                )}
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="p-6 max-w-7xl mx-auto flex justify-center items-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <button
                    onClick={() => router.push("/cms/admin/profile")}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Profile
                </button>
                <Card className="p-6">
                    <div className="text-center text-red-600">
                        <p>{error}</p>
                        <Button variant="outline" onClick={loadPaymentMethods} className="mt-4">
                            Try Again
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <button
                        onClick={() => router.push("/cms/admin/profile")}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Profile
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">My Payment Methods</h1>
                    <p className="text-gray-600 mt-1">Manage your payment methods for shopping and subscriptions</p>
                </div>
                <Button
                    onClick={() => router.push("/cms/admin/profile/payment-methods/add")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Add New Payment Method
                </Button>
            </div>

            {/* Ecommerce Payment Methods Section */}
            {customerPayments.length > 0 && (
                <div>
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-blue-600" />
                            Ecommerce Payment Methods
                        </h2>
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                            These payment methods are used for shopping
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {customerPayments.map((payment) => renderPaymentCard(payment, "Customer"))}
                    </div>
                </div>
            )}

            {/* Company Payment Methods Section */}
            {companyPayments.length > 0 && (
                <div>
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-purple-600" />
                            Company Payment Methods
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            These payment methods are used for subscriptions and addons
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {companyPayments.map((payment) => renderPaymentCard(payment, "Company"))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {customerPayments.length === 0 && companyPayments.length === 0 && (
                <Card className="p-12">
                    <div className="text-center">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Methods Found</h3>
                        <p className="text-gray-600 mb-6">
                            You do not have any payment method registered
                        </p>
                    </div>
                </Card>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                loading={actionId !== null}
                confirmText="Confirm"
            />
        </div>
    );
};

export default PaymentMethodsPage;
