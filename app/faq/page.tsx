import React from "react";
import BasePage from "../components/shared/BasePage";
import { Container } from "../components/ui/Container";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Accordion } from "../components/ui/Accordion";
import { HelpCircle } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        question: "What platforms does ShopSee support?",
        answer: "ShopSee integrates with all major social and video platforms.",
    },
    {
        question: "How does ShopSee's analytics work?",
        answer: "Our analytics track viewer engagement, purchases, and conversions in real time.",
    },
    {
        question: "How do I set up a ShopSee account?",
        answer: "Simply sign up and follow the guided onboarding process to start uploading videos.",
    },
    {
        question: "Who do I contact for support?",
        answer: "Contact our support team at support@myshopsee.com.",
    },
];

const FAQPage: React.FC = () => {
    return (
        <BasePage>
            <div className="py-16 md:py-24 bg-gradient-to-b from-secondary-50 to-white">
                <Container size="md">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <HelpCircle className="w-10 h-10 text-secondary" />
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">FAQ</h1>
                    </div>

                    <SectionHeader title="Frequently Asked Questions" description="Find answers to common questions about ShopSee and our services." centered />

                    <div className="mt-12">
                        <Accordion items={faqData} />
                    </div>

                    {/* Contact Support CTA */}
                    <div className="mt-16 text-center p-8 bg-primary-50 rounded-lg border border-primary-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Still have questions?</h3>
                        <p className="text-gray-600 mb-4">Our support team is here to help you succeed.</p>
                        <a href="mailto:support@myshopsee.com" className="inline-flex items-center gap-2 text-primary hover:text-primary-700 font-semibold text-lg">
                            Contact Support
                            <span>→</span>
                        </a>
                    </div>
                </Container>
            </div>
        </BasePage>
    );
};

export default FAQPage;
