"use client";
import React, { useState } from "react";
import BasePage from "../components/shared/BasePage";
import { Container } from "../components/ui/Container";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosClient from "../utils/axiosClient";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { Mail, Phone, Linkedin, CheckCircle2 } from "lucide-react";

const contactFormSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(100, "First name cannot exceed 100 characters"),
    lastName: z.string().min(1, "Last name is required").max(100, "Last name cannot exceed 100 characters"),
    email: z.string().email("Invalid email address").max(150, "Email cannot exceed 150 characters"),
    message: z.string().min(1, "Message is required").max(2000, "Message cannot exceed 2000 characters"),
});

type ContactFormInputs = z.infer<typeof contactFormSchema>;

export default function ContactUsPage() {
    const [loaded, setLoaded] = useState(true);

    const [isSubmitted, setIsSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ContactFormInputs>({
        resolver: zodResolver(contactFormSchema),
    });

    const onSubmit = async (data: ContactFormInputs) => {
        try {
            setLoaded(false);
            await axiosClient.post("api/feedback/contactus/", data);
            setIsSubmitted(true);
            setLoaded(true);
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };
    return (
        <BasePage>
            {!loaded && <LoadingSpinner />}
            <div className="py-16 md:py-24 bg-gradient-to-b from-secondary-50 to-white">
                <Container size="lg">
                    <SectionHeader title="Contact Us" description="Get in touch with our team for any inquiries or support." />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
                        {/* Contact Information */}
                        <Card variant="elevated" className="bg-white/95 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-2xl mb-4">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                            <Mail className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                                            <a href="mailto:contact@myshopsee.com" className="text-primary hover:text-primary-700 transition-colors">
                                                contact@myshopsee.com
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
                                            <Phone className="w-6 h-6 text-secondary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                                            <a href="tel:+18773417467" className="text-secondary hover:text-secondary-700 transition-colors">
                                                (877) 341-7467
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center">
                                            <Linkedin className="w-6 h-6 text-accent" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">LinkedIn</h3>
                                            <a href="https://www.linkedin.com/company/myshopsee/" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-700 transition-colors">
                                                Connect with us on LinkedIn
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Form */}
                        <Card variant="elevated" className="bg-white/95 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-2xl">{!isSubmitted ? "Send us a message" : "Thank You!"}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!isSubmitted ? (
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <input type="text" placeholder="First Name" {...register("firstName")} className={`w-full px-4 py-3 border ${errors.firstName ? "border-destructive" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`} />
                                                {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName.message}</p>}
                                            </div>
                                            <div>
                                                <input type="text" placeholder="Last Name" {...register("lastName")} className={`w-full px-4 py-3 border ${errors.lastName ? "border-destructive" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`} />
                                                {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName.message}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <input type="email" placeholder="Your Email" {...register("email")} className={`w-full px-4 py-3 border ${errors.email ? "border-destructive" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`} />
                                            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
                                        </div>

                                        <div>
                                            <textarea placeholder="Your Message" rows={5} {...register("message")} className={`w-full px-4 py-3 border ${errors.message ? "border-destructive" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none`}></textarea>
                                            {errors.message && <p className="text-destructive text-sm mt-1">{errors.message.message}</p>}
                                        </div>

                                        <Button type="submit" variant="default" size="lg" className="w-full">
                                            Send Message
                                        </Button>
                                    </form>
                                ) : (
                                    <div className="flex flex-col justify-center items-center py-12">
                                        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mb-4">
                                            <CheckCircle2 className="w-10 h-10 text-success" />
                                        </div>
                                        <h3 className="text-2xl font-semibold text-success mb-3">Message Sent!</h3>
                                        <p className="text-gray-600 text-center max-w-sm">Thank you for contacting us. We'll get back to you as soon as possible.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </Container>
            </div>
        </BasePage>
    );
}
