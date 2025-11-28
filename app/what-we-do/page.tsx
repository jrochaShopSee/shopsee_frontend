"use client";

import Hls from "hls.js";
import React, { useEffect, useRef, useState } from "react";
import BasePage from "../components/shared/BasePage";
import GraySection from "../components/shared/GraySection";
import { Container } from "../components/ui/Container";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Card } from "../components/ui/Card";
import uploadProductsImg from "../images/content/UploadProducts.png";
import uploadVideosImg from "../images/content/UploadVideos.png";
import mapVideosImg from "../images/content/MapVideos.png";
import embedCodeImg from "../images/content/EmbedCode.png";
import ZoomableImage from "../components/shared/Inputs/ZoomableImage";
import { Video, ArrowRight } from "lucide-react";

declare function loadInternalVideo(id: string | undefined, elementId: string, hideVideoInfo: boolean | undefined, forceLoadJquery: boolean): void;
export default function WhatWeDoPage() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const processSteps = [
        {
            title: "Upload Product",
            description: "In the Platform, click on 'Add Product'.",
            img: uploadProductsImg.src,
        },
        {
            title: "Upload Video",
            description: "In the Platform, click on 'Add Video'.",
            img: uploadVideosImg.src,
        },
        {
            title: "Map Your Product",
            description: "In the Videos Page, Click on 'Map Video' and start mapping your products.",
            img: mapVideosImg.src,
        },
        {
            title: "Embed Our Player",
            description: "In the Videos Page, click on 'Preview Video', get your embed code and add our player into your platform.",
            img: embedCodeImg.src,
        },
    ];
    const [videoId, setVideoId] = useState("2183");
    const [videoIdsLoaded, setVideoIdsLoaded] = useState(false);
    useEffect(() => {
        const videoUrl = "https://eastus.av.mk.io/default-shopsee-media/f82b6341-45a9-4122-8d50-d712f68675bf/883e3110-a4e4-415b-9550-706b3c53.ism/manifest(format=m3u8-cmaf).m3u8";
        const video = videoRef.current;
        const origin = window.location.origin;
        const hls = new Hls();
        if (video) {
            if (Hls.isSupported()) {
                hls.loadSource(videoUrl);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                // For Safari native HLS support
                video.src = videoUrl;
                video.addEventListener("loadedmetadata", () => {
                    video.play();
                });
            }
        }

        if (origin === "https://dev.myshopsee.com") {
            setVideoId("2187");
        } else if (origin === "https://myshopsee.com") {
            setVideoId("2201");
        }

        setVideoIdsLoaded(true);
        return () => {
            hls.destroy();
        };
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
        <BasePage>
            {/* Hero Section */}
            <div className="py-16 md:py-24 bg-gradient-to-b from-accent-50 to-white">
                <Container size="lg">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Video className="w-10 h-10 text-accent" />
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">What We Do</h1>
                    </div>

                    <SectionHeader title="Simplifying Video Commerce for Creators and Brands" description="ShopSee provides an all-in-one platform where creators and brands can turn videos into a direct sales channel. Whether you're a content creator or a brand looking to expand your reach, ShopSee's SaaS platform offers real-time analytics, AI-powered recommendations, and a seamless shopping experience." centered />
                </Container>
            </div>

            {/* Comparison Section */}
            <GraySection>
                <Container size="xl">
                    <SectionHeader title="Enhance Video Experience" description="See the transformation from static content to dynamic, shoppable videos" centered />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                        <Card variant="elevated" className="flex flex-col bg-white/95 backdrop-blur-sm border-2 border-success/20">
                            <div className="p-6 flex flex-col h-full">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-3 py-1 bg-success text-white text-sm font-semibold rounded-full">With ShopSee</span>
                                </div>
                                <h5 className="text-xl font-bold mb-4 text-gray-900">Dynamic, shoppable videos that increase conversion and engagement</h5>
                                {videoIdsLoaded && (
                                    <div className="shopsee_video_card flex-grow">
                                        <div id={`shopsee_container_${videoId}`} className="shopsee_player_container"></div>
                                    </div>
                                )}
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

            {/* Process Section */}
            <div className="py-16 md:py-24 bg-white">
                <Container size="xl">
                    <SectionHeader title="Our Process" description="Four simple steps to transform your videos into a powerful sales channel" centered />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
                        {processSteps.map((step, index) => (
                            <Card key={index} variant="elevated" hoverable className="group">
                                <div className="p-6 space-y-4">
                                    <div className="relative">
                                        <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                            {index + 1}
                                        </div>
                                        <ZoomableImage src={step.img} alt={`${step.title} process image`} />
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900">{step.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                                    {index < processSteps.length - 1 && (
                                        <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                                            <ArrowRight className="w-6 h-6 text-gray-300" />
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-16 text-center">
                        <p className="text-xl text-gray-700 mb-6">Ready to get started?</p>
                        <a href="/contact-us" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            Ask for a Free Trial
                            <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>
                </Container>
            </div>
        </BasePage>
    );
}
