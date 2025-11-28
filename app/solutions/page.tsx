import React from "react";
import BainBridgeImg from "../images/content/BainBridge.png";
import GolfImg from "../images/content/Golf.png";
import KardashiansImg from "../images/content/Kardashians.png";
import BasePage from "../components/shared/BasePage";
import { Container } from "../components/ui/Container";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { ShoppingBag, Tv, Users } from "lucide-react";

const solutions = [
    {
        title: "Retail",
        description: "Shoppable videos that turn browsing into purchasing with a single click.",
        image: BainBridgeImg,
        icon: <ShoppingBag className="w-8 h-8 text-primary" />,
        color: "primary",
    },
    {
        title: "Entertainment",
        description: "Embed purchasable products in live streams or pre-recorded content to engage audiences in real time.",
        image: GolfImg,
        icon: <Tv className="w-8 h-8 text-secondary" />,
        color: "secondary",
    },
    {
        title: "Influencers & Content Creators",
        description: "Empower creators with tools to monetize their content without relying on external platforms.",
        image: KardashiansImg,
        icon: <Users className="w-8 h-8 text-accent" />,
        color: "accent",
    },
];

export default function SolutionsPage() {
    return (
        <BasePage>
            <div className="py-16 md:py-24 bg-gradient-to-b from-accent-50 to-white">
                <Container size="xl">
                    <SectionHeader title="Tailored Solutions for Every Industry" description="ShopSee serves retail and entertainment industries, providing tailored solutions that maximize engagement and drive sales through video content." />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
                        {solutions.map((solution, index) => (
                            <Card key={index} variant="elevated" hoverable className="group">
                                <div className="relative overflow-hidden rounded-t-lg h-56">
                                    <img src={solution.image.src} alt={`${solution.title} solution`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="flex items-center gap-2">{solution.icon}</div>
                                    </div>
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-2xl">{solution.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 leading-relaxed">{solution.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Additional Info Section */}
                    <div className="mt-24">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center p-6">
                                <div className="text-4xl font-bold text-primary mb-2">150+</div>
                                <div className="text-gray-600">Active Brands</div>
                            </div>
                            <div className="text-center p-6">
                                <div className="text-4xl font-bold text-secondary mb-2">10M+</div>
                                <div className="text-gray-600">Video Views</div>
                            </div>
                            <div className="text-center p-6">
                                <div className="text-4xl font-bold text-accent mb-2">2.5x</div>
                                <div className="text-gray-600">Average Conversion Increase</div>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        </BasePage>
    );
}
