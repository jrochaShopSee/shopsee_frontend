"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMainStore } from "./store";
import GraySection from "./components/shared/GraySection";
import { Container } from "./components/ui/Container";
import { SectionHeader } from "./components/ui/SectionHeader";
import { FeatureCard } from "./components/ui/FeatureCard";
import { Card } from "./components/ui/Card";
import { Button } from "./components/ui/Button";
import { Sparkles, Zap, BarChart3, MousePointerClick, Target, Bot } from "lucide-react";

declare function loadInternalVideo(id: string | undefined, elementId: string, hideVideoInfo: boolean, forceLoadJquery: boolean): void;

const features = [
    {
        icon: <Sparkles className="w-8 h-8 mx-auto text-primary" />,
        title: "AI-Driven Product Recognition",
        description: "Automatically recognizes and tags products in videos, allowing consumers to shop effortlessly.",
    },
    {
        icon: <Zap className="w-8 h-8 mx-auto text-secondary" />,
        title: "Cross-Platform Compatibility",
        description: "ShopSee supports shoppable content across multiple platforms, including streaming services.",
    },
    {
        icon: <BarChart3 className="w-8 h-8 mx-auto text-accent" />,
        title: "Real-Time Data & Analytics",
        description: "Track influencer ROI, video performance, and consumer behavior to optimize future campaigns.",
    },
    {
        icon: <MousePointerClick className="w-8 h-8 mx-auto text-success" />,
        title: "One-Click Purchases",
        description: "ShopSee simplifies the buying process with a single click, reducing friction and increasing conversion rates.",
    },
    {
        icon: <Target className="w-8 h-8 mx-auto text-primary" />,
        title: "Custom Video Matching",
        description: "Our AI pairs brands with the right creators and audiences to generate high engagement rates.",
    },
    {
        icon: <Bot className="w-8 h-8 mx-auto text-secondary" />,
        title: "AI Agent",
        description: "Assist you in navigating our product suite from end to end.",
    },
];

export default function Home() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const searchParams = useSearchParams();
    const { setShopifyShopId } = useMainStore();
    const [videoIds, setVideoIds] = useState({
        pgaTour: "2180",
        kard: "2185",
        houseWives: "2183",
    });
    const [videoIdsLoaded, setVideoIdsLoaded] = useState(false);

    // Get shopId from URL and store it in Zustand
    useEffect(() => {
        const shopId = searchParams.get("shopId");
        if (shopId) {
            setShopifyShopId(shopId);
        }
        const origin = window.location.origin;
        if (origin === "http://localhost:3000") {
            setVideoIds({
                pgaTour: "2180",
                kard: "2185",
                houseWives: "2183",
            });
        } else if (origin === "https://dev.myshopsee.com") {
            setVideoIds({
                pgaTour: "2186",
                kard: "2185",
                houseWives: "2187",
            });
        } else if (origin === "https://staging.myshopsee.com") {
            setVideoIds({
                pgaTour: "2180",
                kard: "2184",
                houseWives: "2183",
            });
        } else if (origin === "https://myshopsee.com") {
            setVideoIds({
                pgaTour: "2200",
                kard: "2145",
                houseWives: "2201",
            });
        }

        setVideoIdsLoaded(true);
    }, [searchParams, setShopifyShopId]);

    useEffect(() => {
        const videoUrl = "https://eastus.av.mk.io/default-shopsee-media/f82b6341-45a9-4122-8d50-d712f68675bf/883e3110-a4e4-415b-9550-706b3c53.ism/manifest(format=m3u8-cmaf).m3u8";
        const video = videoRef.current;

        if (video) {
            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(videoUrl);
                hls.attachMedia(video);

                return () => {
                    hls.destroy();
                };
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
                video.addEventListener("loadedmetadata", () => {
                    video.play();
                });
            }
        }
    }, []);

    useEffect(() => {
        if (videoIdsLoaded) {
            const videoContainers = document.querySelectorAll(".shopsee_player_container");
            const videoPromises = Array.from(videoContainers).map((e) => loadInternalVideo(e.id.split("_").at(-1), e.id, true, true));

            Promise.all(videoPromises)
                .then(() => {})
                .catch((error) => {
                    console.error("Error loading internal videos:", error);
                });
        }
    }, [videoIdsLoaded]);

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-50 via-secondary-50 to-white py-16 md:py-24">
                <Container size="xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Hero Content */}
                        <div className="space-y-6 animate-fade-in">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                Revolutionizing Social Commerce with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Shoppable Video</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-700 font-medium">Transform Any Video Into A Seamless Shopping Experience</p>
                            <p className="text-lg text-gray-600 leading-relaxed">ShopSee is transforming how brands and creators connect with consumers by turning any video into a seamless shopping experience. From discovery to checkout, ShopSee empowers shoppable content directly within videos, revolutionizing how users engage with products.</p>

                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold mt-0.5">✓</span>
                                    <span>ShopSee integrates shoppable products into videos, streamlining the purchasing process.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold mt-0.5">✓</span>
                                    <span>Our proprietary technology provides real-time sales metrics and detailed analytics for brands and creators.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold mt-0.5">✓</span>
                                    <span>ShopSee allows creators and brands to maximize exposure, engagement, and sales through video commerce across any platform.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold mt-0.5">✓</span>
                                    <span>Boost conversions and create new revenue streams with real-time shopping</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold mt-0.5">✓</span>
                                    <span>In-depth analytics for Brands and Creators</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold mt-0.5">✓</span>
                                    <span>Empowering Social Commerce Across Platforms</span>
                                </li>
                            </ul>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <Link href="/try-now">
                                    <Button variant="default" size="lg" className="shadow-lg hover:shadow-xl">
                                        Get Started Free
                                    </Button>
                                </Link>
                                <Link href="/contact-us">
                                    <Button variant="outline" size="lg">
                                        Learn More
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Hero Videos */}
                        <div className="space-y-4 animate-slide-up">
                            <Card variant="elevated" hoverable className="bg-white/90 backdrop-blur-sm border-2 border-primary/10">
                                <div className="p-6">
                                    <h3 className="font-semibold text-gray-900 mb-3">PGA Tour</h3>
                                    <div className="shopsee_video_card">
                                        <div id={`shopsee_container_${videoIds.pgaTour}`} className="shopsee_player_container"></div>
                                    </div>
                                </div>
                            </Card>
                            <Card variant="elevated" hoverable className="bg-white/90 backdrop-blur-sm border-2 border-secondary/10">
                                <div className="p-6">
                                    <h3 className="font-semibold text-gray-900 mb-3">Kardashian Universe</h3>
                                    <div className="shopsee_video_card">
                                        <div id={`shopsee_container_${videoIds.kard}`} className="shopsee_player_container"></div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Features Section */}
            <section className="py-16 md:py-24 bg-white">
                <Container size="xl">
                    <SectionHeader title="A Seamless User Experience" description="Discover the powerful features that make ShopSee the leading platform for video commerce" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                        {features.map((feature, index) => (
                            <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                                <FeatureCard icon={feature.icon} title={feature.title} description={feature.description} />
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-secondary text-white">
                <Container size="md">
                    <div className="text-center space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold">ShopSee Turns Every Video into a Sales Opportunity</h2>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto">Our patented technology allows you to embed purchasable products directly into videos, making the shopping process simple and effective for creators and consumers.</p>
                        <Link href="/contact-us">
                            <Button variant="outline" size="lg" className="bg-white text-primary hover:bg-gray-100 border-white mt-3">
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </Container>
            </section>

            {/* Comparison Section */}
            <GraySection>
                <Container size="xl">
                    <SectionHeader title="Enhance Video Experience" description="See the difference between dynamic shoppable videos and traditional static content" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                        <Card variant="elevated" className="flex flex-col bg-white/95 backdrop-blur-sm border-2 border-success/20">
                            <div className="p-6 flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-3 py-1 bg-success text-white text-sm font-semibold rounded-full">With ShopSee</span>
                                </div>
                                <h5 className="text-xl font-bold mb-4 text-gray-900">Dynamic, shoppable videos that increase conversion and engagement</h5>
                                <div className="shopsee_video_card flex-grow">
                                    <div id={`shopsee_container_${videoIds.houseWives}`} className="shopsee_player_container"></div>
                                </div>
                            </div>
                        </Card>

                        <Card variant="elevated" className="flex flex-col bg-white/95 backdrop-blur-sm border-2 border-gray-200">
                            <div className="p-6 flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-3 py-1 bg-gray-400 text-white text-sm font-semibold rounded-full">Without ShopSee</span>
                                </div>
                                <h5 className="text-xl font-bold mb-4 text-gray-900">Static, hard-to-monetize content</h5>
                                <div id="videoContainer" className="flex-grow">
                                    <video ref={videoRef} controls className="w-full h-full rounded-lg" />
                                </div>
                            </div>
                        </Card>
                    </div>
                </Container>
            </GraySection>
        </div>
    );
}
