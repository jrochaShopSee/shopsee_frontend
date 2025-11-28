"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BasePage from "../components/shared/BasePage";
import { Container } from "../components/ui/Container";
import { SectionHeader } from "../components/ui/SectionHeader";
import PricingCard from "./PricingCard";
import axiosClient from "../utils/axiosClient";
import { SubscriptionModel, SubscriptionPlan } from "../types/ShopseeSubscriptionProps";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import SubscriptionModal from "../components/shared/SubscriptionModal";
import { SignUpInfoResponse } from "../types/getSignUpInfoProps";
import { useMainStore } from "../store";
import { DollarSign } from "lucide-react";

function PricingContent() {
    const searchParams = useSearchParams();
    const [loaded, setLoaded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [subscriptionId, setSubscriptionId] = useState(0);
    const [isFromShopify, setIsFromShopify] = useState(false);
    const [isAnnual, setIsAnnual] = useState(false);

    const { shopifyShopId, setShopifyShopId } = useMainStore();

    // Get shopId from URL and store it in Zustand (persists in sessionStorage)
    useEffect(() => {
        const shopIdFromUrl = searchParams.get("shopId");
        if (shopIdFromUrl) {
            setShopifyShopId(shopIdFromUrl);
        }

        const fromShopify = !!shopifyShopId || !!shopIdFromUrl;
        setIsFromShopify(fromShopify);

        // Force monthly pricing for Shopify users (no annual option)
        if (fromShopify) {
            setIsAnnual(false);
        }
    }, [shopifyShopId, searchParams, setShopifyShopId]);

    const [plans, setPlans] = useState<SubscriptionModel[]>([]);
    const [signUpInfo, setSignUpInfo] = useState<SignUpInfoResponse>({
        Categories: [],
        CountryList: [],
        HintQuestionsList: [],
        States: [],
    });

    const handleChangePricing = (val: boolean) => {
        setIsAnnual(val);
    };

    const chooseSubscription = (id: number): void => {
        setSubscriptionId(id);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const fetchActiveSubscription = async () => {
            try {
                setLoaded(false);
                const response = await axiosClient.get<SubscriptionPlan>("api/subscription/active");

                const signUpInfoResponse = await axiosClient.get<SignUpInfoResponse>("api/members/SignUpInfo");

                setSignUpInfo(signUpInfoResponse.data);
                setPlans(response?.data?.subscriptions ?? []);
            } catch (error) {
                console.error("Error fetching subscription:", error);
            } finally {
                setLoaded(true);
            }
        };

        fetchActiveSubscription();
    }, []);

    return (
        <BasePage>
            {!loaded && <LoadingSpinner />}
            <div className="py-16 md:py-24 bg-gradient-to-b from-primary-50 to-white">
                <Container size="xl">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <DollarSign className="w-10 h-10 text-primary" />
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Pricing</h1>
                    </div>

                    <SectionHeader title="Choose Your Plan" description="Choose the plan that best fits your needs and start revolutionizing your video commerce today." centered />

                    {/* Shopify Notice Banner */}
                    {isFromShopify && (
                        <div className="max-w-3xl mx-auto mb-8">
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-purple-900 mb-2">Shopify App Billing</h3>
                                        <p className="text-sm text-purple-800 leading-relaxed">
                                            You're setting up ShopSee through Shopify. Your subscription will be billed through your Shopify account. Monthly plans only. After selecting a plan, you'll approve the subscription in your Shopify admin.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isFromShopify && (
                        <div className="flex justify-center mb-12">
                            <div className="inline-flex items-center bg-white rounded-full p-1 shadow-md border border-gray-200">
                                <button onClick={() => handleChangePricing(false)} className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${!isAnnual ? "bg-primary text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
                                    Monthly
                                </button>
                                <button onClick={() => handleChangePricing(true)} className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${isAnnual ? "bg-primary text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
                                    Annual
                                    {plans.length > 0 && (plans[0].AnnualDiscountPercentage || (plans[0] as unknown as {annualDiscount?: number; annualDiscountPercentage?: number}).annualDiscount || (plans[0] as unknown as {annualDiscount?: number; annualDiscountPercentage?: number}).annualDiscountPercentage) && (
                                        <span className="ml-2 text-xs bg-success text-white px-2 py-0.5 rounded-full">
                                            Save {plans[0].AnnualDiscountPercentage || (plans[0] as unknown as {annualDiscount?: number; annualDiscountPercentage?: number}).annualDiscount || (plans[0] as unknown as {annualDiscount?: number; annualDiscountPercentage?: number}).annualDiscountPercentage}%
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Pricing Plans Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
                        {plans.map((plan, i) => (
                            <PricingCard
                                key={i}
                                title={plan.subscriptionName}
                                planId={plan.id}
                                features={plan.subscriptionDescription}
                                price={isAnnual ? plan.priceAnnually.toFixed(2) : plan.price.toFixed(2)}
                                chooseSubscription={chooseSubscription}
                                isMostPopular={plan.isMostPopular}
                            />
                        ))}
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-24 text-center">
                        <p className="text-gray-500 text-sm mb-6">Trusted by leading brands worldwide</p>
                        <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
                            <div className="text-2xl font-bold text-gray-400">150+ Brands</div>
                            <div className="text-2xl font-bold text-gray-400">10M+ Views</div>
                            <div className="text-2xl font-bold text-gray-400">2.5x ROI</div>
                        </div>
                    </div>
                </Container>
            </div>
            <SubscriptionModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} subscriptionId={subscriptionId} setSubscriptionId={setSubscriptionId} plans={plans} data={signUpInfo} isAnnual={isAnnual} isFromShopify={isFromShopify} />
        </BasePage>
    );
}

export default function Page() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        }>
            <PricingContent />
        </Suspense>
    );
}
