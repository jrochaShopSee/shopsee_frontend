import React from "react";
import BasePage from "../components/shared/BasePage";
import { Container } from "../components/ui/Container";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Users } from "lucide-react";

interface TeamMember {
    name: string;
    title: string;
    description: string;
}

const team: TeamMember[] = [
    {
        name: "Charley Pavlosky",
        title: "Founder & CEO",
        description: "25+ years of experience in media and tech innovation.",
    },
    {
        name: "Michael Friedman",
        title: "COO & CFO",
        description: "20+ years of business and technology expertise, leading ShopSee's growth.",
    },
];

export default function AboutUsPage() {
    return (
        <BasePage>
            <div className="py-16 md:py-24 bg-gradient-to-b from-primary-50 to-white">
                <Container size="lg">
                    <SectionHeader title="Innovators in Social Commerce" description="At ShopSee, we are revolutionizing how creators and brands connect with consumers. Focusing on empowering the creator economy, our mission is to simplify the process of turning video content into a powerful shopping platform." />

                    {/* Leadership Team */}
                    <div className="mt-16">
                        <div className="flex items-center justify-center gap-3 mb-12">
                            <Users className="w-8 h-8 text-primary" />
                            <h2 className="text-3xl font-bold text-gray-900">Our Leadership</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {team.map((member, index) => (
                                <Card key={index} variant="elevated" hoverable className="text-center">
                                    <CardHeader>
                                        <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full mb-6 mx-auto flex items-center justify-center text-white text-4xl font-bold">{member.name.split(" ").map((n) => n[0]).join("")}</div>
                                        <CardTitle className="text-2xl mb-2">{member.name}</CardTitle>
                                        <p className="text-primary font-semibold text-lg">{member.title}</p>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 leading-relaxed">{member.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Mission Statement */}
                    <div className="mt-16 max-w-3xl mx-auto">
                        <Card variant="ghost" className="p-8 bg-white/50 backdrop-blur">
                            <div className="space-y-4 text-center">
                                <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
                                <p className="text-lg text-gray-700 leading-relaxed">To empower creators and brands by transforming video content into powerful, interactive shopping experiences that drive engagement, sales, and meaningful connections with consumers.</p>
                            </div>
                        </Card>
                    </div>
                </Container>
            </div>
        </BasePage>
    );
}
