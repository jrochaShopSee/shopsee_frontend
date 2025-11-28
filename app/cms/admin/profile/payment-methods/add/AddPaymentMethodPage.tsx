"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import { toast } from "react-toastify";
import { profileApi } from "@/app/services/profileApi";
import { ArrowLeft, CreditCard, Save } from "lucide-react";

// Validation schema
const paymentMethodSchema = z.object({
    paymentName: z.string().optional(),
    cardholderName: z.string().min(1, "Card holder's name is required"),
    cardNumber: z.string().regex(/^\d{16}$/, "Please enter a valid 16-digit card number"),
    paymentType: z.string().min(1, "Payment type is required"),
    cvv: z.string().regex(/^\d{3}$/, "Please enter a valid 3-digit CVV"),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Please enter a valid expiry date (MM/YY)"),
    billingAddressId: z.number().min(1, "Please select a billing address"),
    isDefault: z.boolean(),
});

type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;

const AddPaymentMethodPage: React.FC = () => {
    const router = useRouter();
    const [billingAddresses, setBillingAddresses] = useState<{ value: string; text: string }[]>([]);
    const [companyBillingAddresses, setCompanyBillingAddresses] = useState<{ value: string; text: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<PaymentMethodFormData>({
        resolver: zodResolver(paymentMethodSchema),
        defaultValues: {
            paymentType: "Ecommerce",
            isDefault: false,
        },
    });

    const paymentType = watch("paymentType");

    useEffect(() => {
        loadFormData();
    }, []);

    const loadFormData = async () => {
        setLoading(true);
        try {
            const data = await profileApi.getPaymentMethodFormData();
            setBillingAddresses(data.billingAddresses || []);
            setCompanyBillingAddresses(data.companyBillingAddresses || []);
        } catch {
            toast.error("Failed to load form data");
        } finally {
            setLoading(false);
        }
    };

    const getCurrentAddressList = () => {
        return paymentType === "Company" ? companyBillingAddresses : billingAddresses;
    };

    const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length >= 3) {
            value = value.slice(0, 2) + "/" + value.slice(2, 4);
        }
        setValue("expiryDate", value);
    };

    const onSubmit = async (data: PaymentMethodFormData) => {
        setSubmitting(true);
        try {
            await profileApi.addPaymentMethod(data);
            toast.success("Payment method added successfully");
            router.push("/cms/admin/profile/payment-methods");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to add payment method");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto flex justify-center items-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <button
                onClick={() => router.push("/cms/admin/profile/payment-methods")}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Payment Methods
            </button>

            <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Add New Payment Method</h1>
                        <p className="text-gray-600 mt-1">Add a credit card for shopping or subscriptions</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Cardholder Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Card Holder's Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("cardholderName")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="John Doe"
                            />
                            {errors.cardholderName && (
                                <p className="mt-1 text-sm text-red-600">{errors.cardholderName.message}</p>
                            )}
                        </div>

                        {/* Card Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Card Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("cardNumber")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="1234567890123456"
                                maxLength={16}
                            />
                            {errors.cardNumber && (
                                <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
                            )}
                        </div>

                        {/* Payment Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Name (Optional)
                            </label>
                            <input
                                type="text"
                                {...register("paymentName")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="My Card"
                            />
                        </div>

                        {/* Payment Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register("paymentType")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="Ecommerce">Ecommerce</option>
                                <option value="Company">Company</option>
                            </select>
                            {errors.paymentType && (
                                <p className="mt-1 text-sm text-red-600">{errors.paymentType.message}</p>
                            )}
                        </div>

                        {/* CVV */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                CVV <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("cvv")}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="123"
                                maxLength={3}
                            />
                            {errors.cvv && (
                                <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>
                            )}
                        </div>

                        {/* Expiry Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expiry Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("expiryDate")}
                                onChange={handleExpiryDateChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="MM/YY"
                                maxLength={5}
                            />
                            {errors.expiryDate && (
                                <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Billing Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Billing Address <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register("billingAddressId", { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={0}>Select an address</option>
                            {getCurrentAddressList().map((addr) => (
                                <option key={addr.value} value={addr.value}>
                                    {addr.text}
                                </option>
                            ))}
                        </select>
                        {errors.billingAddressId && (
                            <p className="mt-1 text-sm text-red-600">{errors.billingAddressId.message}</p>
                        )}
                    </div>

                    {/* Default Card Checkbox */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            {...register("isDefault")}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                            Set as default card for future purchases
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/cms/admin/profile/payment-methods")}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {submitting ? (
                                <>
                                    <LoadingSpinner />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Add Payment Method
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AddPaymentMethodPage;
