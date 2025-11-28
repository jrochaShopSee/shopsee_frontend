"use client";
import React, { useEffect, useState } from "react";
import { useForm, FormProvider, useFormContext, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faArrowLeft, faCheck } from "@fortawesome/free-solid-svg-icons";
import ReactStepWizard from "react-step-wizard";
import { CategorySignUp, HintQuestionSignUp, SignUpFormType, SignUpInfoResponse } from "../types/getSignUpInfoProps";
import Label from "../components/shared/Label";
import AccountInfoStep from "./AccountInfoStep";
import axiosClient from "../utils/axiosClient";
import isAtLeast14YearsOld from "../utils/validationCustom";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import Link from "next/link";

interface SignUpResponse {
    status: "error" | "success";
    message?: string;
    redirect?: string;
}

// Validation schemas
export const accountInfoSchema = z.object({
    firstName: z.string().min(2, "Minimum 2 characters").max(50, "Maximum 50 characters"),
    lastName: z.string().min(2, "Minimum 2 characters").max(50, "Maximum 50 characters"),
    email: z.string().email("Invalid email"),
    country: z.string().min(1, "Country is required"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    birthday: z
        .string()
        .min(1, "Birthday is required")
        .refine((dateString) => !isNaN(Date.parse(dateString)), "Invalid date")
        .transform((dateString) => new Date(dateString))
        .refine(isAtLeast14YearsOld, {
            message: "You must be at least 14 years old.",
        }),
});

const accountDetailsSchema = z
    .object({
        username: z.string().min(4, "Minimum 4 characters").max(40, "Maximum 40 characters"),
        password: z.string().min(6, "Minimum 6 characters"),
        confirmPassword: z.string().min(6, "Minimum 6 characters"),
        securityQuestionId: z.string().min(1, "Security question is required"),
        securityAnswer: z.string().min(3, "Minimum 3 characters"),
        agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
    })
    .superRefine(({ confirmPassword, password }, ctx) => {
        if (confirmPassword !== password) {
            ctx.addIssue({
                code: "custom",
                message: "The passwords did not match",
                path: ["confirmPassword"],
            });
        }
    });

// Define types for the form values
export type AccountInfoValues = z.infer<typeof accountInfoSchema>;
type AccountDetailsValues = z.infer<typeof accountDetailsSchema>;
type AccountInterestsValues = {
    selectedSubcategories: number[]; // Store selected category IDs
};

const AccountDetailsStep = ({ hintQuestions }: { hintQuestions: HintQuestionSignUp[] }) => {
    const {
        register,
        formState: { errors },
        clearErrors,
    } = useFormContext<AccountDetailsValues>();

    useEffect(() => {
        setTimeout(() => {
            clearErrors();
        }, 10);
    }, []);

    return (
        <div>
            <h2 className="text-xl font-bold mb-4 text-center">Account Details</h2>
            <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="username" label="Username" />
                        <input {...register("username")} id="username" className={`w-full px-4 py-2 border ${errors.username?.message ? "border-red-500" : "border-gray-300"} rounded focus:outline-none focus:border-blue-500`} />
                        <p className="text-red-500">{errors.username?.message as string}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="password" label="Password" />
                        <input {...register("password")} type="password" id="Password" autoComplete="off" className={`w-full px-4 py-2 border ${errors.password?.message ? "border-red-500" : "border-gray-300"} rounded focus:outline-none focus:border-blue-500`} />
                        <p className="text-red-500">{errors.password?.message as string}</p>
                    </div>
                    <div>
                        <Label htmlFor="confirmPassword" label="Confirm Password" />
                        <input {...register("confirmPassword")} type="password" id="confirmPassword" autoComplete="off" className={`w-full px-4 py-2 border ${errors.confirmPassword?.message ? "border-red-500" : "border-gray-300"} rounded focus:outline-none focus:border-blue-500`} />
                        <p className="text-red-500">{errors.confirmPassword?.message as string}</p>
                    </div>
                </div>

                <h3 className="text-lg font-semibold mt-4 text-center">Account Security</h3>
                <div>
                    <Label htmlFor="securityQuestion" label="Security Question" />
                    <select {...register("securityQuestionId")} id="securityQuestion" className={`w-full px-4 py-2 border ${errors.securityQuestionId?.message ? "border-red-500" : "border-gray-300"} rounded focus:outline-none focus:border-blue-500`}>
                        <option value="">Select Security Question</option>
                        {hintQuestions.map((question) => (
                            <option key={question.Id} value={question.Id}>
                                {question.Question}
                            </option>
                        ))}
                    </select>
                    <p className="text-red-500">{errors.securityQuestionId?.message as string}</p>
                </div>
                <div>
                    <Label htmlFor="answer" label="Answer" />
                    <input {...register("securityAnswer")} className={`w-full px-4 py-2 border ${errors.securityQuestionId?.message ? "border-red-500" : "border-gray-300"} rounded focus:outline-none focus:border-blue-500`} id="answer" />
                    <p className="text-red-500">{errors.securityAnswer?.message as string}</p>
                </div>
                <div className="mt-4">
                    <input
                        {...register("agreeToTerms", {
                            required: "You must agree to the terms",
                        })}
                        type="checkbox"
                        id="agreeToTerms"
                        className={`mr-2 ${errors.agreeToTerms ? "border-red-500" : "border-gray-300"}`}
                    />
                    <label htmlFor="agreeToTerms">
                        I agree to the{" "}
                        <Link className="text-blue-400 hover:text-blue-500 underline" href="/terms">
                            terms
                        </Link>{" "}
                        and{" "}
                        <Link className="text-blue-400 hover:text-blue-500 underline" href="/privacy">
                            policy
                        </Link>
                    </label>{" "}
                    <p className="text-red-500">{errors.agreeToTerms?.message}</p>
                </div>
            </div>
        </div>
    );
};

const AccountInterestsStep = ({ categories }: { categories: CategorySignUp[] }) => {
    const {
        register,
        setValue,
        getValues,
        clearErrors,
        formState: { errors },
    } = useFormContext<AccountInterestsValues>();

    useEffect(() => {
        setTimeout(() => {
            clearErrors();
        }, 10);
    }, []);

    const [selectedSubcategories, setSelectedSubcategories] = useState<number[]>(
        getValues("selectedSubcategories") || [] // Initialize with form values if available
    );

    const toggleSubcategory = (subcategoryId: number) => {
        const updatedSelection = selectedSubcategories.includes(subcategoryId)
            ? selectedSubcategories.filter((id) => id !== subcategoryId) // Deselect if already selected
            : [...selectedSubcategories, subcategoryId]; // Select if not already selected

        setSelectedSubcategories(updatedSelection); // Update local state
        setValue("selectedSubcategories", updatedSelection); // Update form state
    };

    return (
        <div className="h-96 overflow-y-scroll">
            <h2 className="text-xl font-bold mb-5 text-center">Interests</h2>
            <div className="space-y-6">
                {categories.map((category, index) => (
                    <div key={index}>
                        <h4 className="font-bold text-lg mb-3">{category.name}</h4>
                        <div className="flex flex-wrap gap-2">
                            {category.children.map((subcategory) => {
                                const isSelected = selectedSubcategories.includes(subcategory.id);
                                return (
                                    <button key={subcategory.id} type="button" onClick={() => toggleSubcategory(subcategory.id)} className={`px-4 py-2 rounded-full border border-gray-300 text-sm font-medium ${isSelected ? "bg-purple-600 text-white" : "bg-white text-gray-700"} hover:bg-purple-700 hover:text-white transition`}>
                                        {subcategory.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Register the selected subcategories to the form */}
            <input
                {...register("selectedSubcategories")}
                type="hidden"
                value={selectedSubcategories.join(",")} // Join the array to pass it as a string, but this will still work on form submission
            />

            {/* Optional error message */}
            {errors.selectedSubcategories && <p className="text-red-500">{errors.selectedSubcategories.message as string}</p>}
        </div>
    );
};

const SignUpForm = ({ data }: { data: SignUpInfoResponse }) => {
    const [step, setStep] = useState(1);
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);

    const getCurrentSchema = () => {
        if (step === 1) return zodResolver(accountInfoSchema);
        if (step === 3) return zodResolver(accountDetailsSchema);
        return undefined; // Adjust for additional steps if needed
    };

    // Initialize useForm with a dynamic resolver
    const methods = useForm<AccountInfoValues & AccountDetailsValues>({
        resolver: getCurrentSchema(),
    });

    // Handle step transitions and validation
    const nextStep = async () => {
        const valid = await methods.trigger();
        if (valid) {
            setStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        setStep((prev) => prev - 1);
    };

    const onSubmit: SubmitHandler<AccountInfoValues | AccountDetailsValues> = async () => {
        setLoading(true);
        const values = methods.getValues() as SignUpFormType;
        const categories = values.selectedSubcategories ? values.selectedSubcategories : [];
        const data = {
            Email: values.email,
            Username: values.username,
            FirstName: values.firstName,
            LastName: values.lastName,
            Password: values.password,
            ConfirmPassword: values.confirmPassword,
            Question: values.securityQuestionId,
            Response: values.securityAnswer,
            AgreeToTerms: values.agreeToTerms,
            BirthDate: values.birthday,
            Country: Number(values.country),
            PhoneNumber: `1${values.phoneNumber.replace(/[\D\s]/g, "")}`,
            InterestList: categories.filter((item) => typeof item === "number"),
        };

        const result = await axiosClient.post<SignUpResponse>("/Account/SignUp", data);
        if (result.data.status == "error" && result.data.message) {
            setFormError(result.data.message);
            setLoading(false);
        } else {
            window.location.href = "/";
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    };

    return (
        <FormProvider {...methods}>
            {loading ? <LoadingSpinner /> : <></>}
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-9">
                <ReactStepWizard>
                    {(() => {
                        switch (step) {
                            case 1:
                                return <AccountInfoStep countries={data.CountryList} />;
                            case 2:
                                return <AccountInterestsStep categories={data.Categories} />;
                            case 3:
                                return <AccountDetailsStep hintQuestions={data.HintQuestionsList} />;

                            default:
                                return <div>Not Found</div>;
                        }
                    })()}
                </ReactStepWizard>
                {formError ? (
                    <div>
                        <p className="text-red-500">{formError}</p>
                    </div>
                ) : (
                    <></>
                )}

                <div className="flex space-x-4 ">
                    {step > 1 && (
                        <button type="button" onClick={prevStep} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg ml-auto">
                            <FontAwesomeIcon icon={faArrowLeft} /> Back
                        </button>
                    )}
                    {step < 3 ? (
                        <button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg ml-auto">
                            Next <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                    ) : (
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg ml-auto">
                            Submit <FontAwesomeIcon icon={faCheck} />
                        </button>
                    )}
                </div>
            </form>
        </FormProvider>
    );
};

export default SignUpForm;
