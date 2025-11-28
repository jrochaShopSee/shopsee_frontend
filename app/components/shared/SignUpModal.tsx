"use client";
import React, { useRef, useEffect, useState } from "react";
import { X, User, Lock, Shield, Calendar, MapPin, Phone, Mail, Check, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import Label from "./Label";
import axiosClient from "../../utils/axiosClient";
import { isAtLeast18YearsOld } from "../../utils/validationCustom";
import { SignUpInfoResponse } from "../../types/getSignUpInfoProps";
import { LoadingSpinner } from "./LoadingSpinner";
import { setCookie } from "../../utils";
import Link from "next/link";

interface SignUpModalProps {
    isOpen: boolean;
    closeModal: () => void;
    data: SignUpInfoResponse;
}

type SignUpStep = "AccountInfo" | "AccountDetails" | "Interests";

const stepTitles = {
    AccountInfo: "Personal Information",
    AccountDetails: "Account Security",
    Interests: "Your Interests",
};

const stepIcons = {
    AccountInfo: User,
    AccountDetails: Lock,
    Interests: Shield,
};

// Validation schemas - define base objects first
const accountInfoBaseSchema = z.object({
    firstName: z.string().min(2, "Minimum 2 characters").max(50, "Maximum 50 characters"),
    lastName: z.string().min(2, "Minimum 2 characters").max(50, "Maximum 50 characters"),
    email: z.string().email("Invalid email"),
    country: z.string().min(1, "Country is required"),
    state: z.string().optional(),
    phoneNumber: z.string().min(1, "Phone number is required"),
    birthday: z.string().min(1, "Birthday is required"),
});

const accountDetailsBaseSchema = z.object({
    username: z.string().min(4, "Minimum 4 characters").max(40, "Maximum 40 characters"),
    password: z.string().min(6, "Minimum 6 characters"),
    confirmPassword: z.string().min(6, "Minimum 6 characters"),
    securityQuestionId: z.string().min(1, "Security question is required"),
    securityAnswer: z.string().min(3, "Minimum 3 characters"),
    agreeToTerms: z.boolean(),
});

const interestsSchema = z.object({
    selectedSubcategories: z.array(z.number()).min(1, "Please select at least one interest"),
});

// Merge base schemas then apply refinements
const completeSchema = accountInfoBaseSchema
    .merge(accountDetailsBaseSchema)
    .merge(interestsSchema)
    .superRefine((data, ctx) => {
        // Password match validation
        if (data.confirmPassword !== data.password) {
            ctx.addIssue({
                code: "custom",
                message: "The passwords did not match",
                path: ["confirmPassword"],
            });
        }
        // Terms agreement validation
        if (data.agreeToTerms !== true) {
            ctx.addIssue({
                code: "custom",
                message: "You must agree to the terms",
                path: ["agreeToTerms"],
            });
        }
        // Birthday validation
        if (isNaN(Date.parse(data.birthday))) {
            ctx.addIssue({
                code: "custom",
                message: "Invalid date",
                path: ["birthday"],
            });
        } else {
            const birthdayDate = new Date(data.birthday);
            if (!isAtLeast18YearsOld(birthdayDate)) {
                ctx.addIssue({
                    code: "custom",
                    message: "You must be at least 18 years old",
                    path: ["birthday"],
                });
            }
        }
    });

type SignUpFormValues = z.infer<typeof completeSchema>;

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, closeModal, data }) => {
    const [currentStep, setCurrentStep] = useState<SignUpStep>("AccountInfo");
    const [loaded, setLoaded] = useState(true);
    const [signUpError, setSignUpError] = useState("");
    const [selectedState, setSelectedState] = useState<string>("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    const methods = useForm<SignUpFormValues>({
        resolver: zodResolver(completeSchema),
        mode: "onBlur",
    });

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        clearErrors,
        trigger,
    } = methods;

    const selectedSubcategories = watch("selectedSubcategories") || [];

    useEffect(() => {
        setCurrentStep("AccountInfo");
        setSignUpError("");
    }, [isOpen]);

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

    const nextStep = async () => {
        // Validate current step before proceeding
        if (currentStep === "AccountInfo") {
            // Trigger validation for account info fields
            const result = await trigger(["firstName", "lastName", "email", "country", "phoneNumber", "birthday"]);
            if (result) {
                clearErrors();
                setCurrentStep("AccountDetails");
            }
        } else if (currentStep === "AccountDetails") {
            // Trigger validation for account details fields
            const result = await trigger(["username", "password", "confirmPassword", "securityQuestionId", "securityAnswer", "agreeToTerms"]);
            if (result) {
                clearErrors();
                setCurrentStep("Interests");
            }
        }
    };

    const prevStep = () => {
        clearErrors();
        if (currentStep === "AccountDetails") setCurrentStep("AccountInfo");
        else if (currentStep === "Interests") setCurrentStep("AccountDetails");
    };

    const onSubmit = async (formData: SignUpFormValues) => {
        setLoaded(false);
        setSignUpError("");

        try {
            const payload = {
                ...formData,
                birthday: new Date(formData.birthday).toISOString(),
                state: selectedState || "",
            };

            // Call the v2 endpoint that returns JWT token
            const response = await axiosClient.post("/api/members/signup/v2", payload);

            if (response.data.status === "success" && response.data.access_token) {
                // Set JWT cookie like login does
                setCookie("access_token", response.data.access_token, 7);

                // Keep loading spinner visible and redirect
                window.location.href = response.data.redirect || "/shop/account";
            } else {
                setSignUpError(response.data.message || "Signup failed. Please try again.");
                setLoaded(true);
            }
        } catch (error) {
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as { response?: { data?: { error?: string; errorMessage?: string; message?: string } } };
                const errorData = axiosError.response?.data;
                const errorMessage = errorData?.error || errorData?.errorMessage || errorData?.message || "An error occurred during signup. Please try again.";
                setSignUpError(errorMessage);
            } else {
                setSignUpError("An unexpected error occurred. Please try again.");
            }
            setLoaded(true);
        }
    };

    const toggleCategory = (categoryId: number) => {
        const current = selectedSubcategories;
        if (current.includes(categoryId)) {
            setValue(
                "selectedSubcategories",
                current.filter((id) => id !== categoryId)
            );
        } else {
            setValue("selectedSubcategories", [...current, categoryId]);
        }
    };

    if (!isOpen) return null;

    const steps: SignUpStep[] = ["AccountInfo", "AccountDetails", "Interests"];
    const currentStepIndex = steps.indexOf(currentStep);

    return (
        <FormProvider {...methods}>
            {!loaded && <LoadingSpinner />}
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50" role="dialog" aria-modal="true">
                <Card ref={modalRef} variant="elevated" className="w-[90%] max-w-3xl max-h-[92vh] overflow-y-auto">
                    <CardHeader className="sticky top-0 bg-white z-10 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{stepTitles[currentStep]}</h2>
                            <Button onClick={closeModal} variant="ghost" size="sm" className="hover:bg-gray-100" aria-label="Close">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center justify-between">
                            {steps.map((step, index) => {
                                const StepIcon = stepIcons[step];
                                const isCompleted = index < currentStepIndex;
                                const isCurrent = index === currentStepIndex;
                                return (
                                    <div key={step} className="flex items-center flex-1">
                                        <div className={`flex items-center gap-2 ${isCurrent ? "text-primary" : isCompleted ? "text-success" : "text-gray-400"}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCurrent ? "bg-primary text-white" : isCompleted ? "bg-success text-white" : "bg-gray-200"}`}>{isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}</div>
                                            <span className="hidden sm:inline text-sm font-medium">{stepTitles[step]}</span>
                                        </div>
                                        {index < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? "bg-success" : "bg-gray-200"}`} />}
                                    </div>
                                );
                            })}
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 md:p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Step 1: Account Info */}
                            {currentStep === "AccountInfo" && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="firstName" label="First Name" />
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input {...register("firstName")} id="firstName" className={`w-full pl-10 pr-4 py-2 border ${errors.firstName ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`} />
                                            </div>
                                            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="lastName" label="Last Name" />
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input {...register("lastName")} id="lastName" className={`w-full pl-10 pr-4 py-2 border ${errors.lastName ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`} />
                                            </div>
                                            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="email" label="Email" />
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input {...register("email")} type="email" id="email" className={`w-full pl-10 pr-4 py-2 border ${errors.email ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`} />
                                        </div>
                                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="country" label="Country" />
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <select {...register("country")} id="country" className={`w-full pl-10 pr-4 py-2 border ${errors.country ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`}>
                                                    <option value="">Select Country</option>
                                                    {data.CountryList.map((country) => (
                                                        <option key={country.Id} value={country.Id}>
                                                            {country.Name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
                                        </div>
                                        {data.States.length > 0 && (
                                            <div>
                                                <Label htmlFor="state" label="State/Province" />
                                                <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} id="state" className="w-full px-4 py-2 border border-gray-300 focus:border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors">
                                                    <option value="">Select State</option>
                                                    {data.States.map((state) => (
                                                        <option key={state.Abbreviation} value={state.Abbreviation}>
                                                            {state.State}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="phoneNumber" label="Phone Number" />
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input {...register("phoneNumber")} type="tel" id="phoneNumber" className={`w-full pl-10 pr-4 py-2 border ${errors.phoneNumber ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`} />
                                            </div>
                                            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="birthday" label="Birthday" />
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input {...register("birthday")} type="date" id="birthday" className={`w-full pl-10 pr-4 py-2 border ${errors.birthday ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`} />
                                            </div>
                                            {errors.birthday && <p className="text-red-500 text-sm mt-1">{errors.birthday.message?.toString()}</p>}
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-6">
                                        <Button type="button" onClick={nextStep} variant="default" size="lg">
                                            Next <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Account Details */}
                            {currentStep === "AccountDetails" && (
                                <div className="space-y-4 animate-fade-in">
                                    <div>
                                        <Label htmlFor="username" label="Username" />
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input {...register("username")} id="username" className={`w-full pl-10 pr-4 py-2 border ${errors.username ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`} />
                                        </div>
                                        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="password" label="Password" />
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input {...register("password")} type={showPassword ? "text" : "password"} id="password" className={`w-full pl-10 pr-12 py-2 border ${errors.password ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`} />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" aria-label={showPassword ? "Hide password" : "Show password"}>
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="confirmPassword" label="Confirm Password" />
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input {...register("confirmPassword")} type={showConfirmPassword ? "text" : "password"} id="confirmPassword" className={`w-full pl-10 pr-12 py-2 border ${errors.confirmPassword ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`} />
                                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="securityQuestionId" label="Security Question" />
                                            <div className="relative">
                                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <select {...register("securityQuestionId")} id="securityQuestionId" className={`w-full pl-10 pr-4 py-2 border ${errors.securityQuestionId ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`}>
                                                    <option value="">Select Security Question</option>
                                                    {data.HintQuestionsList.map((question) => (
                                                        <option key={question.Id} value={question.Id}>
                                                            {question.Question}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors.securityQuestionId && <p className="text-red-500 text-sm mt-1">{errors.securityQuestionId.message}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="securityAnswer" label="Answer" />
                                            <input {...register("securityAnswer")} id="securityAnswer" className={`w-full px-4 py-2 border ${errors.securityAnswer ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`} />
                                            {errors.securityAnswer && <p className="text-red-500 text-sm mt-1">{errors.securityAnswer.message}</p>}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <input {...register("agreeToTerms")} type="checkbox" id="agreeToTerms" className="mt-1" />
                                        <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                                            I agree to the{" "}
                                            <Link href="/terms" className="text-primary hover:text-primary-700 underline font-medium transition-colors">
                                                terms
                                            </Link>{" "}
                                            and{" "}
                                            <Link href="/privacy" className="text-primary hover:text-primary-700 underline font-medium transition-colors">
                                                privacy policy
                                            </Link>
                                        </label>
                                    </div>
                                    {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms.message}</p>}

                                    <div className="flex justify-between mt-6">
                                        <Button type="button" onClick={prevStep} variant="outline" size="lg">
                                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                        </Button>
                                        <Button type="button" onClick={nextStep} variant="default" size="lg">
                                            Next <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Interests */}
                            {currentStep === "Interests" && (
                                <div className="space-y-4 animate-fade-in">
                                    <p className="text-gray-600 text-center mb-4">Select your interests to personalize your experience</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {data.Categories.flatMap((category) =>
                                            category.children.map((subcategory) => {
                                                const isSelected = selectedSubcategories.includes(subcategory.id);
                                                return (
                                                    <button key={subcategory.id} type="button" onClick={() => toggleCategory(subcategory.id)} className={`p-4 rounded-lg border-2 transition-all ${isSelected ? "border-primary bg-primary-50 text-primary" : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"}`}>
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium">{subcategory.name}</span>
                                                            {isSelected && <Check className="w-5 h-5" />}
                                                        </div>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                    {errors.selectedSubcategories && <p className="text-red-500 text-sm text-center">{errors.selectedSubcategories.message}</p>}

                                    <div className="flex justify-between mt-6">
                                        <Button type="button" onClick={prevStep} variant="outline" size="lg">
                                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                        </Button>
                                        <Button type="submit" variant="success" size="lg">
                                            Create Account <Check className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {signUpError && (
                                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-center font-semibold">{signUpError}</p>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </FormProvider>
    );
};

export default SignUpModal;
