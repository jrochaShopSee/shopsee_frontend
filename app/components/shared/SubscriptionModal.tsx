import React, { FC, useEffect, useRef, useState } from "react";
import { X, User, CreditCard as CreditCardIcon, Building2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import Label from "./Label";
import { z } from "zod";
import { FormProvider, SubmitHandler, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Stepper from "./Stepper";
import { InputMask } from "@react-input/mask";
import { isValid } from "creditcard.js";
import Link from "next/link";
import { LoginResponse } from "./SignInForm";
import { LoadingSpinner } from "./LoadingSpinner";
import { CountrySignUp, HintQuestionSignUp, StateSignUp, SubscriptionModalProps, SubscriptionModel } from "@/app/types";
import { useMainStore } from "@/app/store";
import { axiosClient, isAtLeast14YearsOld, setCookie } from "@/app/utils";
import PricingCard from "@/app/pricing/PricingCard";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";

export type SubscriptionModalStatus = "AccountInformation" | "AccountDetails" | "AccountPayout";

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, closeModal, plans, subscriptionId, setSubscriptionId, data, isAnnual, isFromShopify: isFromShopifyProp }) => {
    const [loaded, setLoaded] = useState(true);
    const [subscriptionError, setSubscriptionError] = useState("");
    const [subscriptionModalStatus, setSubscriptionModalStatus] = useState<SubscriptionModalStatus>("AccountInformation");
    const { shopifyShopId } = useMainStore();
    const [isFromShopify, setIsFromShopify] = useState(false);

    // Get shopId from URL/store or use prop if provided
    useEffect(() => {
        setIsFromShopify(isFromShopifyProp ?? !!shopifyShopId);
    }, [shopifyShopId, isFromShopifyProp]);

    const modalRef = useRef<HTMLDivElement>(null);

    const getCurrentSchema = () => {
        if (subscriptionModalStatus === "AccountInformation") return zodResolver(accountInfoSchema);
        if (subscriptionModalStatus === "AccountDetails" && !isFromShopify) return zodResolver(accountDetailsSchema);
        if (subscriptionModalStatus === "AccountPayout") return zodResolver(accountPayoutSchema);
        return undefined; // Adjust for additional steps if needed
    };

    // Initialize useForm with a dynamic resolver
    const methods = useForm<AccountInfoType & AccountDetailsType & AccountPayoutType>({
        resolver: getCurrentSchema(),
    });

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                closeModal();
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleOutsideClick);
        }
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [isOpen, closeModal]);

    const originalSteps = [
        {
            id: "AccountInformation",
            label: "Account Information",
            icon: <User className="w-6 h-6" />,
        },
        {
            id: "AccountPayout",
            label: "Account Payout",
            icon: <CreditCardIcon className="w-6 h-6" />,
        },
        {
            id: "AccountDetails",
            label: "Account Details",
            icon: <Building2 className="w-6 h-6" />,
        },
    ];

    const steps = originalSteps.filter((step) => !(isFromShopify && step.id === "AccountPayout"));

    const currentStep = steps.findIndex((step) => step.id === subscriptionModalStatus);

    const goToNextStep = async (step: SubscriptionModalStatus) => {
        const valid = await methods.trigger();
        if (valid) {
            setSubscriptionModalStatus(step);
        }
    };

    const goToPreviousStep = (step: SubscriptionModalStatus) => {
        setSubscriptionModalStatus(step);
    };

    const onSubmit: SubmitHandler<AccountInfoType & AccountDetailsType & AccountPayoutType> = async () => {
        setLoaded(false);

        const formValues = methods.getValues();

        const formatPhoneNumber = (phone: string | undefined) => (phone ? `1${phone.replace(/[\D\s]/g, "")}` : null);
        const createAddress = (prefix: "business" | "billing") => ({
            FirstName: formValues.firstName,
            LastName: formValues.lastName,
            StreetAddress: formValues[`${prefix}Address`],
            StreetAddress2: formValues[`${prefix}Address2`],
            City: formValues[`${prefix}City`],
            Zip: formValues[`${prefix}Zip`],
            Country: formValues[`${prefix}Country`],
            State: formValues[`${prefix}State`],
            Phone: formatPhoneNumber(formValues[`${prefix}PhoneNumber`]),
        });

        const postData = {
            FirstName: formValues.firstName,
            LastName: formValues.lastName,
            Username: formValues.username,
            Email: formValues.email,
            Password: formValues.password,
            ConfirmPassword: formValues.confirmPassword,
            DateOfBirth: formValues.birthday,
            Subscription: {
                Annual: isAnnual,
                Id: subscriptionId,
            },
            CreditCard: {
                CardNumber: formValues.creditCardNumber,
                CardHolderName: formValues.creditCardHolder,
                ExpiryMonth: formValues.creditCardMonth,
                ExpiryYear: formValues.creditCardYear,
                CVV: formValues.creditCardCVV,
                BillingAddress: createAddress("billing"),
            },
            BankAccount: {
                AccountHolderName: "",
                BankName: "",
                AccountNumber: "",
                ConfirmAccountNumber: "",
                RoutingNumber: "",
                AccountHolderType: "",
            },
            CompanyAddress: {
                ...createAddress("business"),
                Name: formValues.company,
            },
            Website: formValues.businessWebsite,
            AgreeToTerms: formValues.agreeToTerms,
            Response: formValues.securityAnswer,
            Question: formValues.securityQuestionId,
            Shop: isFromShopify ? shopifyShopId : null,
            Code: isFromShopify ? "" : null, // Empty string - token already exchanged in ShopifyFinishInstallation
        };

        // Handle API call
        try {
            const result = await axiosClient.post<LoginResponse>(isFromShopify ? "/Account/RegisterShopify" : "/Account/Register", postData);
            const data = result.data;

            setSubscriptionError("");

            if (data.status === "error" && data.errorMessage) {
                setSubscriptionError(data.errorMessage);
                setLoaded(true);
                return;
            }

            // Set JWT cookie for authentication before redirecting
            if (data.access_token) {
                setCookie("access_token", data.access_token, 7);
            }

            if (data.redirect) {
                // Keep loading spinner visible during redirect
                window.location.href = data.redirect;
            } else {
                setLoaded(true);
            }
        } catch (error) {
            console.error("Error during submission:", error);
            setSubscriptionError("An unexpected error occurred. Please try again.");
            setLoaded(true);
        }
    };

    const titles = {
        AccountInformation: "Account Information",
        AccountDetails: "Account Details",
        AccountPayout: "Account Payout",
    };

    const stepComponents = {
        AccountInformation: <AccountInformationStep nextStep={() => goToNextStep(isFromShopify ? "AccountDetails" : "AccountPayout")} hintQuestions={data.HintQuestionsList} plans={plans} subscriptionId={subscriptionId} setSubscriptionId={setSubscriptionId} isAnnual={isAnnual} />,
        AccountPayout: <AccountPayoutStep nextStep={() => goToNextStep("AccountDetails")} prevStep={() => goToPreviousStep("AccountInformation")} countries={data.CountryList} states={data.States} />,
        AccountDetails: <AccountDetailsStep prevStep={() => goToPreviousStep(isFromShopify ? "AccountInformation" : "AccountPayout")} countries={data.CountryList} states={data.States} />,
    };

    if (!isOpen) return null;
    return (
        <FormProvider {...methods}>
            {loaded ? "" : <LoadingSpinner />}
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50" role="dialog" aria-modal="true">
                <Card ref={modalRef} variant="elevated" className="w-[90%] max-w-6xl max-h-[92vh] overflow-y-auto">
                    <CardHeader className="sticky top-0 bg-white z-10 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex-1" />
                            <Button onClick={closeModal} variant="ghost" size="sm" className="hover:bg-gray-100" aria-label="Close">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <Stepper steps={steps} currentStep={currentStep} />
                    </CardHeader>

                    <CardContent className="p-6 md:p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{titles[subscriptionModalStatus]}</h2>
                        </div>
                        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                            {stepComponents[subscriptionModalStatus]}
                        </form>
                        {subscriptionError && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-center font-semibold">{subscriptionError}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </FormProvider>
    );
};

const accountInfoSchema = z.object({
    username: z.string().min(4, "Minimum 4 characters").max(40, "Maximum 40 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Minimum 6 characters"),
    confirmPassword: z.string().min(6, "Minimum 6 characters"),
    birthday: z
        .string()
        .min(1, "Birthday is required")
        .refine((dateString) => !isNaN(Date.parse(dateString)), "Invalid date")
        .transform((dateString) => new Date(dateString))
        .refine(isAtLeast14YearsOld, {
            message: "You must be at least 14 years old.",
        }),
    securityQuestionId: z.string().min(1, "Security question is required"),
    securityAnswer: z.string().min(3, "Minimum 3 characters"),
    subscriptionId: z.string().min(1, "Please select a subscription plan"),
});

type AccountInfoType = z.infer<typeof accountInfoSchema>;

type AccountInfoStepProps = {
    nextStep: () => void;
    hintQuestions: HintQuestionSignUp[];
    plans: SubscriptionModel[];
    subscriptionId: number;
    setSubscriptionId: (id: number) => void;
    isAnnual: boolean;
};

const AccountInformationStep: FC<AccountInfoStepProps> = ({ nextStep, hintQuestions, plans, subscriptionId, setSubscriptionId, isAnnual }) => {
    const {
        register,
        formState: { errors },
    } = useFormContext<AccountInfoType>();

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                    <Label htmlFor="username" label="Username" />
                    <input {...register("username")} type="text" id="username" autoComplete="off" className={`w-full px-4 py-2 border ${errors.username?.message ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`} />
                    <p className="text-red-500 text-sm mt-1">{errors.username?.message as string}</p>
                </div>

                <div className="mb-5">
                    <Label htmlFor="email" label="Email" />
                    <input {...register("email")} type="text" id="email" autoComplete="off" className={`w-full px-4 py-2 border ${errors.email?.message ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`} />
                    <p className="text-red-500 text-sm mt-1">{errors.email?.message as string}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                    <Label htmlFor="password" label="Password" />
                    <input {...register("password")} type="password" id="Password" autoComplete="off" className={`w-full px-4 py-2 border ${errors.password?.message ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`} />
                    <p className="text-red-500 text-sm mt-1">{errors.password?.message as string}</p>
                </div>
                <div>
                    <Label htmlFor="confirmPassword" label="Confirm Password" />
                    <input {...register("confirmPassword")} type="password" id="confirmPassword" autoComplete="off" className={`w-full px-4 py-2 border ${errors.confirmPassword?.message ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`} />
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword?.message as string}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                    <Label htmlFor="birthday" label="Birthday" />
                    <input {...register("birthday")} type="date" id="birthday" className={`w-full px-4 py-2 border ${errors.birthday?.message ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`} />
                    <p className="text-red-500 text-sm mt-1">{errors.birthday?.message as string}</p>
                </div>
            </div>
            <h3 className="text-lg font-semibold mt-6 mb-4 text-center text-gray-900">Account Security</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                    <Label htmlFor="securityQuestion" label="Security Question" />
                    <select {...register("securityQuestionId")} id="securityQuestion" className={`w-full px-4 py-2 border ${errors.securityQuestionId?.message ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`}>
                        <option value="">Select Security Question</option>
                        {hintQuestions.map((question) => (
                            <option key={question.Id} value={question.Id}>
                                {question.Question}
                            </option>
                        ))}
                    </select>
                    <p className="text-red-500 text-sm mt-1">{errors.securityQuestionId?.message as string}</p>
                </div>
                <div className="mb-6">
                    <Label htmlFor="answer" label="Answer" />
                    <input {...register("securityAnswer")} className={`w-full px-4 py-2 border ${errors.securityAnswer?.message ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`} id="answer" />
                    <p className="text-red-500 text-sm mt-1">{errors.securityAnswer?.message as string}</p>
                </div>
            </div>

            <section className="flex flex-col sm:flex-row justify-center gap-8 mb-5">
                {plans.map((plan, i) => (
                    <PricingCard key={i} title={plan.subscriptionName} planId={plan.id} features={plan.subscriptionDescription} selected={plan.id == subscriptionId} buttonText={plan.id == subscriptionId ? "Selected" : "Select"} price={isAnnual ? plan.priceAnnually.toFixed(2) : plan.price.toFixed(2)} chooseSubscription={() => setSubscriptionId(plan.id)} />
                ))}
            </section>
            {errors.subscriptionId?.message && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm text-center">{errors.subscriptionId.message as string}</p>
                </div>
            )}
            <input {...register("subscriptionId")} type="number" className="invisible" value={subscriptionId} />

            <div className="flex justify-end mt-6">
                <Button type="button" onClick={nextStep} variant="default" size="lg">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
};
const accountPayoutSchema = z.object({
    creditCardNumber: z
        .string()
        .regex(/^\d{13,19}$/, "Invalid credit card number.")
        .refine((s) => isValid(s), "Invalid credit card number."),
    creditCardHolder: z
        .string()
        .min(2, "Cardholder name must be at least 2 characters.")
        .max(50, "Cardholder name must be less than 50 characters.")
        .regex(/^[a-zA-Z\s]+$/, "Cardholder name must only contain letters and spaces."),
    creditCardMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Invalid month."),
    creditCardYear: z
        .string()
        .regex(/^\d{4}$/, "Invalid year.")
        .refine((year) => parseInt(year) >= new Date().getFullYear(), "Year must not be in the past."),
    creditCardCVV: z.string().regex(/^\d{3,4}$/, "Invalid CVV."),
    billingAddress: z.string().min(5, "Address must be at least 5 characters").max(60, "Address cannot exceed 60 characters"),
    billingAddress2: z.string().max(60, "suite/apt/unit cannot exceed 60 characters"),
    billingCity: z.string().min(2, "City must be at least 2 characters").max(60, "City cannot exceed 60 characters"),
    billingZip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid zip code format"),
    billingCountry: z.string().min(1, "Country is required"),
    billingState: z.string().min(1, "State is required"),
    billingPhoneNumber: z.string().min(1, "Phone number is required"),
});
type AccountPayoutType = z.infer<typeof accountPayoutSchema>;

interface AccountPayoutStepProps {
    nextStep: () => void;
    prevStep: () => void;
    states: StateSignUp[];
    countries: CountrySignUp[];
}

const AccountPayoutStep: React.FC<AccountPayoutStepProps> = ({ nextStep, prevStep, states, countries }) => {
    const {
        register,
        getValues,
        formState: { errors },
    } = useFormContext<AccountPayoutType>();
    const [phoneMask, setPhoneMask] = useState("");

    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
    const currentYear = new Date().getFullYear();

    const years = Array.from({ length: 20 }, (_, i) => (currentYear + i).toString());

    const getCountry = (selectedCountry: string): CountrySignUp | undefined => {
        return countries.find((s) => s.Id.toString() === selectedCountry);
    };

    const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCountry = event.target.value;
        const country = getCountry(selectedCountry);
        if (country) {
            setPhoneMask(country.PhoneMask);
            return;
        }
        setPhoneMask("");
    };

    useEffect(() => {
        const country = getValues("billingCountry");
        const selectedCountry = getCountry(country);

        if (selectedCountry) {
            setPhoneMask(selectedCountry.PhoneMask);
        }
    }, []);

    return (
        <div>
            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" id="default-styled-tab" role="tablist">
                    <li className="me-2" role="presentation">
                        <button className="inline-block p-4 border-b-2 rounded-t-lg text-lg text-primary border-primary font-semibold" id="profile-styled-tab" type="button" role="tab" aria-controls="styled-profile" aria-selected="true">
                            <CreditCardIcon className="w-5 h-5 inline-block mr-2" />
                            Credit Card
                        </button>
                    </li>
                </ul>
            </div>

            <div id="default-styled-tab-content">
                <div className="p-4 rounded-lg " /* Remove `hidden` to make it visible */ id="styled-profile" role="tabpanel" aria-labelledby="profile-styled-tab">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                        <div>
                            <Label htmlFor="creditCardNumber" label="Credit Card Number" />
                            <input {...register("creditCardNumber")} type="text" id="creditCardNumber" autoComplete="off" placeholder="**** **** **** ****" className={`w-full px-4 py-2 border ${errors.creditCardNumber?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`} />
                            <p className="text-red-500">{errors.creditCardNumber?.message as string}</p>
                        </div>
                        <div>
                            <Label htmlFor="creditCardHolder" label="Credit Holder's Name" />
                            <input {...register("creditCardHolder")} type="text" id="creditCardHolder" autoComplete="off" placeholder="John Doe" className={`w-full px-4 py-2 border ${errors.creditCardHolder?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`} />
                            <p className="text-red-500">{errors.creditCardHolder?.message as string}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                        <div>
                            <Label htmlFor="creditCardMonth" label="Expiration Month" />
                            <select {...register("creditCardMonth")} id="creditCardMonth" className={`w-full px-4 py-2 border ${errors.creditCardMonth?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`}>
                                <option value="">Select Month</option>
                                {months.map((month, i) => (
                                    <option key={i} value={month}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                            <p className="text-red-500">{errors.creditCardMonth?.message as string}</p>
                        </div>
                        <div>
                            <Label htmlFor="creditCardYear" label="Expiration Year" />
                            <select {...register("creditCardYear")} id="creditCardYear" className={`w-full px-4 py-2 border ${errors.creditCardYear?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`}>
                                <option value="">Select Year</option>
                                {years.map((year, i) => (
                                    <option key={i} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                            <p className="text-red-500">{errors.creditCardYear?.message as string}</p>
                        </div>
                        <div>
                            <Label htmlFor="creditCardCVV" label="CVV" />
                            <input {...register("creditCardCVV")} type="text" id="creditCardCVV" autoComplete="off" placeholder="John Doe" className={`w-full px-4 py-2 border ${errors.creditCardCVV?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`} />
                            <p className="text-red-500">{errors.creditCardCVV?.message as string}</p>
                        </div>
                    </div>
                </div>
            </div>
            <h3 className="text-lg font-semibold mt-6 mb-4 text-center text-gray-900">Billing/Shipping Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                    <Label htmlFor="billingAddress" label="Address" />
                    <input {...register("billingAddress")} type="text" id="billingAddress" autoComplete="off" className={`w-full px-4 py-2 border ${errors.billingAddress?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`} />
                    <p className="text-red-500">{errors.billingAddress?.message as string}</p>
                </div>
                <div>
                    <Label htmlFor="billingAddress2" label="Suite/Apt/Unit" />
                    <input {...register("billingAddress2")} type="text" id="billingAddress2" autoComplete="off" className={`w-full px-4 py-2 border ${errors.billingAddress2?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`} />
                    <p className="text-red-500">{errors.billingAddress2?.message as string}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                    <Label htmlFor="billingCity" label="City" />
                    <input {...register("billingCity")} type="text" id="billingCity" autoComplete="off" className={`w-full px-4 py-2 border ${errors.billingCity?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`} />
                    <p className="text-red-500">{errors.billingCity?.message as string}</p>
                </div>
                <div>
                    <Label htmlFor="billingZip" label="Zip/Postal Code" />
                    <input {...register("billingZip")} type="text" id="billingZip" autoComplete="off" className={`w-full px-4 py-2 border ${errors.billingZip?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`} />
                    <p className="text-red-500">{errors.billingZip?.message as string}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                    <Label htmlFor="billingCountry" label="Country" />
                    <select {...register("billingCountry")} className={`w-full px-4 py-2 border ${errors.billingCountry?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`} id="billingCountry" onChange={handleCountryChange}>
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                            <option key={country.Id} value={country.Id}>
                                {country.Name}
                            </option>
                        ))}
                    </select>
                    <p className="text-red-500">{errors.billingCountry?.message as string}</p>
                </div>
                <div>
                    <Label htmlFor="billingState" label="State" />
                    <select {...register("billingState")} className={`w-full px-4 py-2 border ${errors.billingState?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`} id="billingState">
                        <option value="">Select State</option>
                        {states.map((state) => (
                            <option key={state.Abbreviation} value={state.Abbreviation}>
                                {state.State}
                            </option>
                        ))}
                    </select>
                    <p className="text-red-500">{errors.billingState?.message as string}</p>
                </div>
                <div>
                    {phoneMask ? (
                        <div>
                            <Label htmlFor="billingPhoneNumber" label="Phone Number" />
                            <InputMask
                                {...register("billingPhoneNumber")}
                                id="billingPhoneNumber"
                                mask={phoneMask}
                                replacement={{ X: /\d/ }} // Default mask
                                className={`w-full px-4 py-2 border ${errors.billingPhoneNumber?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`}
                                placeholder={phoneMask || "(XXX) XXX-XXXX"}
                            />
                            <p className="text-red-500">{errors.billingPhoneNumber?.message as string}</p>
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            </div>
            <div className="flex justify-between mt-8">
                <Button type="button" onClick={prevStep} variant="destructive" size="lg">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button type="button" onClick={nextStep} variant="default" size="lg">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
};

const accountDetailsSchema = z.object({
    firstName: z.string().min(2, "Minimum 2 characters").max(50, "Maximum 50 characters"),
    lastName: z.string().min(2, "Minimum 2 characters").max(50, "Maximum 50 characters"),
    company: z.string().max(50, "Maximum 50 characters"),
    businessAddress: z.string().min(5, "Address must be at least 5 characters").max(60, "Address cannot exceed 60 characters"),
    businessAddress2: z.string().max(60, "suite/apt/unit cannot exceed 60 characters"),
    businessCity: z.string().min(2, "City must be at least 2 characters").max(60, "City cannot exceed 60 characters"),
    businessZip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid zip code format"),
    businessCountry: z.string().min(1, "Country is required"),
    businessState: z.string().min(1, "State is required"),
    businessPhoneNumber: z.string().min(1, "Phone number is required"),
    businessWebsite: z.string().max(100, "Maximum 100 characters"),
    agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
});

type AccountDetailsType = z.infer<typeof accountDetailsSchema>;

type AccountDetailsStepProps = {
    prevStep: () => void;
    states: StateSignUp[];
    countries: CountrySignUp[];
};

const AccountDetailsStep: FC<AccountDetailsStepProps> = ({ prevStep, states, countries }) => {
    const [phoneMask, setPhoneMask] = useState("");

    const {
        register,
        getValues,
        formState: { errors },
    } = useFormContext<AccountDetailsType>();

    const getCountry = (selectedCountry: string): CountrySignUp | undefined => {
        return countries.find((s) => s.Id.toString() === selectedCountry);
    };

    const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCountry = event.target.value;
        const country = getCountry(selectedCountry);
        if (country) {
            setPhoneMask(country.PhoneMask);
            return;
        }
        setPhoneMask("");
    };

    useEffect(() => {
        const country = getValues("businessCountry");
        const selectedCountry = getCountry(country);

        if (selectedCountry) {
            setPhoneMask(selectedCountry.PhoneMask);
        }
    }, []);

    return (
        <div>
            <h3 className="text-lg font-semibold mt-6 mb-4 text-center text-gray-900">Business Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                    <Label htmlFor="firstName" label="First Name" />
                    <input {...register("firstName")} id="firstName" className={`w-full px-4 py-2 border ${errors.firstName?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`} />
                    <p className="text-red-500">{errors.firstName?.message as string}</p>
                </div>
                <div>
                    <Label htmlFor="lastName" label="Last Name" />
                    <input {...register("lastName")} id="lastName" className={`w-full px-4 py-2 border ${errors.lastName?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`} />
                    <p className="text-red-500">{errors.lastName?.message as string}</p>
                </div>
            </div>
            <div>
                <Label htmlFor="company" label="Company (Optional)" />
                <input {...register("company")} id="company" className={`w-full px-4 py-2 border ${errors.company?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`} />
                <p className="text-red-500">{errors.company?.message as string}</p>
            </div>
            <h3 className="text-lg font-semibold mt-6 mb-4 text-center text-gray-900">Business Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                    <Label htmlFor="businessAddress" label="Address" />
                    <input {...register("businessAddress")} type="text" id="businessAddress" autoComplete="off" className={`w-full px-4 py-2 border ${errors.businessAddress?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`} />
                    <p className="text-red-500">{errors.businessAddress?.message as string}</p>
                </div>
                <div>
                    <Label htmlFor="businessAddress2" label="Suite/Apt/Unit" />
                    <input {...register("businessAddress2")} type="text" id="businessAddress2" autoComplete="off" className={`w-full px-4 py-2 border ${errors.businessAddress2?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`} />
                    <p className="text-red-500">{errors.businessAddress2?.message as string}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                    <Label htmlFor="businessCity" label="City" />
                    <input {...register("businessCity")} type="text" id="businessCity" autoComplete="off" className={`w-full px-4 py-2 border ${errors.businessCity?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`} />
                    <p className="text-red-500">{errors.businessCity?.message as string}</p>
                </div>
                <div>
                    <Label htmlFor="businessZip" label="Zip/Postal Code" />
                    <input {...register("businessZip")} type="text" id="businessZip" autoComplete="off" className={`w-full px-4 py-2 border ${errors.businessZip?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`} />
                    <p className="text-red-500">{errors.businessZip?.message as string}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                <div>
                    <Label htmlFor="businessCountry" label="Country" />
                    <select {...register("businessCountry")} className={`w-full px-4 py-2 border ${errors.businessCountry?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`} id="businessCountry" onChange={handleCountryChange}>
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                            <option key={country.Id} value={country.Id}>
                                {country.Name}
                            </option>
                        ))}
                    </select>
                    <p className="text-red-500">{errors.businessCountry?.message as string}</p>
                </div>
                <div>
                    <Label htmlFor="businessState" label="State" />
                    <select {...register("businessState")} className={`w-full px-4 py-2 border ${errors.businessState?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`} id="businessState">
                        <option value="">Select State</option>
                        {states.map((state) => (
                            <option key={state.Abbreviation} value={state.Abbreviation}>
                                {state.State}
                            </option>
                        ))}
                    </select>
                    <p className="text-red-500">{errors.businessState?.message as string}</p>
                </div>
                <div>
                    {phoneMask ? (
                        <div>
                            <Label htmlFor="businessPhoneNumber" label="Phone Number" />
                            <InputMask
                                {...register("businessPhoneNumber")}
                                id="businessPhoneNumber"
                                mask={phoneMask}
                                replacement={{ X: /\d/ }} // Default mask
                                className={`w-full px-4 py-2 border ${errors.businessPhoneNumber?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`}
                                placeholder={phoneMask || "(XXX) XXX-XXXX"}
                            />
                            <p className="text-red-500">{errors.businessPhoneNumber?.message as string}</p>
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                    <Label htmlFor="businessWebsite" label="Website (Optional)" />
                    <input {...register("businessWebsite")} type="text" id="businessWebsite" autoComplete="off" className={`w-full px-4 py-2 border ${errors.businessWebsite?.message ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`} />
                    <p className="text-red-500">{errors.businessWebsite?.message as string}</p>
                </div>
            </div>
            <div className="mb-5">
                <input
                    {...register("agreeToTerms", {
                        required: "You must agree to the terms",
                    })}
                    type="checkbox"
                    id="agreeToTerms"
                    className={`mr-2 ${errors.agreeToTerms ? "border-red-500" : "border-gray-300"}`}
                />
                <label htmlFor="agreeToTerms" className="text-gray-700">
                    I agree to the{" "}
                    <Link className="text-primary hover:text-primary-700 underline font-medium transition-colors" href="/terms">
                        terms
                    </Link>{" "}
                    and{" "}
                    <Link className="text-primary hover:text-primary-700 underline font-medium transition-colors" href="/privacy">
                        policy
                    </Link>
                </label>
                <p className="text-red-500">{errors.agreeToTerms?.message}</p>
            </div>
            <div className="flex justify-between mt-8">
                <Button type="button" onClick={prevStep} variant="destructive" size="lg">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button type="submit" variant="success" size="lg">
                    Submit <Check className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
};

export default SubscriptionModal;
