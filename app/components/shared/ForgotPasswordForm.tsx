import React, { useEffect, useState } from "react";
import { SignInModalStatus } from "./SignInModal";
import { ArrowLeft, Check } from "lucide-react";
import Label from "./Label";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoadingSpinner } from "./LoadingSpinner";
import { axiosClient } from "@/app/utils";
import { Button } from "../ui/Button";

const ForgotPasswordSchema = z.object({
    email: z.string().email("Invalid email"),
});

interface ForgotPasswordResponse {
    status: "error" | "success";
    errorMessage?: string;
    redirect?: string;
}

type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>;

interface ForgotPasswordForm {
    setModalStatus: React.Dispatch<React.SetStateAction<SignInModalStatus>>;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordForm> = ({ setModalStatus }) => {
    const [loaded, setLoaded] = useState(true);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setLoaded(true);
        setSuccess(false);
        setErrorMessage("");
    }, []);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(ForgotPasswordSchema),
    });

    function goToSignInForm(): void {
        setModalStatus("SignIn");
    }

    const onSubmit = async (data: ForgotPasswordValues) => {
        setLoaded(false);
        try {
            const result = await axiosClient.post<ForgotPasswordResponse>("/api/Members/ForgotPassword", { Email: data.email });
            setErrorMessage("");
            if (result.data.status == "success") {
                setSuccess(true);
            } else {
                setSuccess(false);
                setErrorMessage(result.data.errorMessage || "");
            }

            setLoaded(true);
        } catch (error) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { error?: string; errorMessage?: string; message?: string } | string } };
                const errorData = axiosError.response?.data;

                let errorMessage = "An error occurred. Please try again.";
                if (typeof errorData === 'string') {
                    errorMessage = errorData;
                } else if (errorData && typeof errorData === 'object') {
                    errorMessage = errorData.error || errorData.errorMessage || errorData.message || errorMessage;
                }

                setErrorMessage(errorMessage);
            } else {
                setErrorMessage("An unexpected error occurred. Please try again.");
            }
            setLoaded(true);
        }
    };
    if (success) {
        return (
            <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                <p className="text-success-700 font-medium">Email has been sent to reset your password!</p>
            </div>
        );
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {loaded ? "" : <LoadingSpinner />}
            <div className="mb-6">
                <Label htmlFor="email" label="Email" />
                <input
                    {...register("email")}
                    id="email"
                    placeholder="name@company.com"
                    className={`w-full px-4 py-2 border ${errors.email ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message as string}</p>}
            </div>
            {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
            )}
            <div className="flex justify-between gap-3">
                <Button type="button" onClick={goToSignInForm} variant="destructive" size="lg">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button type="submit" variant="success" size="lg">
                    Submit <Check className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </form>
    );
};
