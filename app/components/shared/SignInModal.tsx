import React, { useRef, useEffect, useState } from "react";
import { X } from "lucide-react";
import SignInForm from "./SignInForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";

export type SignInModalStatus = "SignIn" | "ForgotPassword";

interface SignInModalProps {
    isOpen: boolean;
    closeModal: () => void;
    openSignUpModal: () => void;
}

const titles = {
    SignIn: "Sign In",
    ForgotPassword: "Forgot Password",
};

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, closeModal, openSignUpModal }) => {
    const [signInModalStatus, setSignInModalStatus] = useState<SignInModalStatus>("SignIn");
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSignInModalStatus("SignIn");
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50" role="dialog" aria-modal="true">
            <Card ref={modalRef} variant="elevated" className="w-full max-w-md">
                <CardHeader className="border-b border-gray-200 mb-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{titles[signInModalStatus]}</h2>
                        <Button onClick={closeModal} variant="ghost" size="sm" className="hover:bg-gray-100" aria-label="Close">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    {signInModalStatus == "SignIn" ? <SignInForm closeModal={closeModal} setModalStatus={setSignInModalStatus} openSignUpModal={openSignUpModal} /> : <></>}
                    {signInModalStatus == "ForgotPassword" ? <ForgotPasswordForm setModalStatus={setSignInModalStatus} /> : <></>}
                </CardContent>
            </Card>
        </div>
    );
};

export default SignInModal;
