import React, { useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosClient from "../../utils/axiosClient";
import { z } from "zod";
import { SignInModalStatus } from "./SignInModal";
import { Button } from "../ui/Button";

interface SignInFormModal {
    closeModal: () => void;
    setModalStatus: React.Dispatch<React.SetStateAction<SignInModalStatus>>;
    openSignUpModal: () => void;
}

export interface LoginResponse {
    status: "error" | "success";
    errorMessage?: string;
    redirect?: string;
    access_token?: string;
}

const userLoginSchema = z.object({
    Email: z.string().email("Invalid email address"),
    Password: z.string().min(1, "Password is required"),
});

type UserLoginInputs = z.infer<typeof userLoginSchema>;

const setCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const SignInForm: React.FC<SignInFormModal> = ({ closeModal, setModalStatus, openSignUpModal }) => {
    const [loaded, setLoaded] = useState(true);
    const [loginError, setLoginError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<UserLoginInputs>({
        resolver: zodResolver(userLoginSchema),
    });

    const onSubmit = async (data: UserLoginInputs) => {
        setLoaded(false);
        setLoginError("");

        try {
            const payload = {
                username: data.Email,
                password: data.Password,
            };

            const result = await axiosClient.post<LoginResponse>("/api/auth/v2", payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const responseData = result.data;

            if (result.status === 200) {
                if (responseData.access_token) {
                    setCookie("access_token", responseData.access_token, 7);
                    // Keep loading spinner visible during redirect
                    // Redirect based on role (returned from v2 endpoint)
                    window.location.href = responseData.redirect || "/shop/account";
                    return;
                }

                // Handle production success or localhost without token
                if (responseData.status === "error" && responseData.errorMessage) {
                    setLoginError(responseData.errorMessage);
                    setLoaded(true);
                } else if (responseData.redirect) {
                    // Keep loading spinner visible during redirect
                    window.location.href = responseData.redirect;
                } else {
                    // Keep loading spinner visible during redirect
                    window.location.href = "/shop/account";
                }
            } else {
                setLoginError("Login failed. Please try again.");
                setLoaded(true);
            }
        } catch (error) {
            // Handle axios error responses
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as { response?: { data?: { error?: string; errorMessage?: string; message?: string } } };
                const errorData = axiosError.response?.data;
                const errorMessage = errorData?.error || errorData?.errorMessage || errorData?.message || "Login failed. Please try again.";
                setLoginError(errorMessage);
            } else {
                setLoginError("An unexpected error occurred. Please try again.");
            }
            setLoaded(true);
        }
    };

    const handleRedirectToSignUp = (): void => {
        openSignUpModal();
    };

    function handleRedirectToForgotPassword(): void {
        setModalStatus("ForgotPassword");
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {loaded ? "" : <LoadingSpinner />}
            <main className="space-y-4">
                <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                        Your email
                    </label>
                    <input type="email" id="shopsee-email" {...register("Email")} placeholder="name@company.com" className={`w-full px-4 py-2 border ${errors.Email ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`} />
                    {errors.Email && <p className="text-red-500 text-sm mt-1">{errors.Email.message}</p>}
                </div>
                <div>
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                        Your password
                    </label>
                    <input type="password" {...register("Password")} id="password" placeholder="••••••••" className={`w-full px-4 py-2 border ${errors.Password ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors`} />
                    {errors.Password && <p className="text-red-500 text-sm mt-1">{errors.Password.message}</p>}
                    {loginError && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{loginError}</p>
                        </div>
                    )}
                </div>
                <div className="flex justify-end items-center">
                    <button type="button" onClick={handleRedirectToForgotPassword} className="text-sm text-primary hover:text-primary-700 hover:underline transition-colors">
                        Forgot password?
                    </button>
                </div>
                <p className="text-sm text-gray-600">
                    Not registered?{" "}
                    <button type="button" onClick={handleRedirectToSignUp} className="text-primary hover:text-primary-700 hover:underline font-medium transition-colors">
                        Create account
                    </button>
                </p>
            </main>
            <footer className="mt-6 flex justify-end gap-3">
                <Button type="submit" variant="default" size="lg" className="w-full">
                    Sign in
                </Button>
            </footer>
        </form>
    );
};

export default SignInForm;
