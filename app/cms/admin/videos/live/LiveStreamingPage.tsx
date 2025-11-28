"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/app/components/shared/LoadingSpinner";
import {
    ArrowLeft,
    Copy,
    Video,
    Check,
    Clock,
    Calendar,
    Play,
    Fingerprint,
} from "lucide-react";
import { toast } from "react-toastify";
import Script from "next/script";
import { rootUrl } from "@/app/utils/host";
import * as mediasoupClient from "mediasoup-client";
import { io } from "socket.io-client";

const LiveStreamingPage: React.FC = () => {
    const router = useRouter();
    const socket = io("http://40.67.177.151", { transports: ["websocket"], rejectUnauthorized: false });

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const startButtonRef = useRef<HTMLButtonElement>(null);
    const stopButtonRef = useRef<HTMLButtonElement>(null);
    const statusDivRef = useRef<HTMLDivElement>(null);

    let device: mediasoupClient.types.Device;
    let sendTransport: mediasoupClient.types.Transport;
    let localStream: MediaStream;

    const handleBack = () => {
        router.push("/cms/admin/videos");
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const startBroadcast = async () => {
        const localVideo = localVideoRef.current;

        console.log("--- Starting Broadcast ---");
        updateUI("starting");

        try {
            device = new mediasoupClient.Device();
            console.log("1. Mediasoup device created");

            const routerRtpCapabilities = await request("getRouterRtpCapabilities") as mediasoupClient.types.RtpCapabilities;
            console.log("2. Got Router RTP Capabilities");

            await device.load({ routerRtpCapabilities });
            console.log("3. Device loaded successfully");

            const transportData = await request("createWebRtcTransport", {
                isProducer: true,
            }) as mediasoupClient.types.TransportOptions;
            console.log("4. Server-side transport created");

            const turnCredentials = await request('getTurnCredentials') as RTCIceServer;
            sendTransport = device.createSendTransport({
                ...transportData,
                iceServers: [turnCredentials],
            });
            console.log("5. Client-side send transport created");

            // --- Transport Event Listeners ---
            sendTransport.on(
                "connect",
                async ({ dtlsParameters }, callback, errback) => {
                    console.log('Transport "connect" event');
                    try {
                        await request("connectWebRtcTransport", {
                            transportId: sendTransport.id,
                            dtlsParameters,
                        });
                        callback();
                    } catch (err) {
                        errback(err as Error);
                    }
                }
            );

            sendTransport.on(
                "produce",
                async ({ kind, rtpParameters }, callback, errback) => {
                    console.log('Transport "produce" event for kind:', kind);
                    try {
                        const { producerId } = await request("produce", {
                            transportId: sendTransport.id,
                            kind,
                            rtpParameters,
                        }) as { producerId: string };
                        callback({ producerId });
                    } catch (err) {
                        errback(err as Error);
                    }
                }
            );

            sendTransport.on("connectionstatechange", (state) => {
                console.log(`Transport connection state changed to: ${state}`);
                switch (state) {
                    case "connecting":
                        updateUI("connecting");
                        break;
                    case "connected":
                        updateUI("broadcasting");
                        break;
                    case "failed":
                    case "disconnected":
                    case "closed":
                        stopBroadcast();
                        break;
                }
            });

            localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            if (!localVideo) throw new Error("Local video element not found");
            localVideo.srcObject = localStream;
            console.log("6. Got local media stream");

            const videoTrack = localStream.getVideoTracks()[0];
            const audioTrack = localStream.getAudioTracks()[0];

            if (videoTrack) {
                console.log("Producing video...");
                await sendTransport.produce({ track: videoTrack });
            }
            if (audioTrack) {
                console.log("Producing audio...");
                await sendTransport.produce({ track: audioTrack });
            }

            console.log("--- Broadcast Started Successfully on Client ---");
        } catch (err) {
            console.error("Broadcast failed to start:", err);
            updateUI("error", (err as Error).message);
            stopBroadcast();
        }
    };

    const stopBroadcast = () => {
        console.log("--- Stopping Broadcast ---");

        // Stop local media tracks (turns off camera light)
        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
        }

        // Close the mediasoup transport
        if (sendTransport && !sendTransport.closed) {
            sendTransport.close(); // This will trigger 'transportclose' on server producers
        }

        // Disconnect the socket
        if (socket.connected) {
            socket.disconnect();
            socket.connect(); // Reconnect for future sessions
        }

        updateUI("idle");
    }

    const updateUI = (state: string, message: string = "") => {
        const statusDiv = statusDivRef.current;
        const startButton = startButtonRef.current;
        const stopButton = stopButtonRef.current;
        const localVideo = localVideoRef.current;
        if (!statusDiv || !startButton || !stopButton || !localVideo) return;
        switch (state) {
            case "idle":
                statusDiv.textContent = "Status: Idle";
                startButton.disabled = false;
                stopButton.style.display = "none";
                startButton.style.display = "inline-block";
                localVideo.srcObject = null;
                break;
            case "starting":
            case "connecting":
                statusDiv.textContent = "Status: Connecting...";
                startButton.disabled = true;
                stopButton.style.display = "inline-block";
                startButton.style.display = "none";
                break;
            case "broadcasting":
                statusDiv.textContent = "Status: Broadcasting Live";
                startButton.disabled = true;
                stopButton.disabled = false;
                stopButton.style.display = "inline-block";
                startButton.style.display = "none";
                break;
            case "error":
                statusDiv.textContent = `Status: Error - ${message}`;
                startButton.disabled = false;
                stopButton.style.display = "none";
                startButton.style.display = "inline-block";
                break;
        }
    }

    const request = (type: string, data = {}) => {
        return new Promise((resolve, reject) => {
            socket.emit(type, data, (response: unknown) => {
                if (response && response.error) {
                    reject(new Error(response.error));
                } else {
                    resolve(response);
                }
            });
        });
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Videos
                        </button>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <Video className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Live Streaming
                                    </h1>
                                    <p className="text-sm text-gray-600 mt-1">Video Preview</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Video Player */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Video Player */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Play className="w-5 h-5 text-blue-600" />
                                    Video Preview
                                </h2>
                                <div className="bg-gray-900 rounded-lg overflow-hidden">
                                    <video
                                        id="localVideo"
                                        ref={localVideoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="w-full"
                                    >
                                    </video>
                                    <div className="shopsee_video_card">
                                        <div
                                            id="shopsee_container_video"
                                            className="shopsee_player_container"
                                        ></div>
                                    </div>
                                </div>
                                <div id="controls">
                                    <button
                                        id="startButton"
                                        ref={startButtonRef}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                                        onClick={startBroadcast}
                                    >
                                        Start Broadcast
                                    </button>
                                    <button
                                        id="stopButton"
                                        ref={stopButtonRef}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                                        onClick={stopBroadcast}
                                        style={{ display: "none" }}
                                    >
                                        Stop Broadcast
                                    </button>
                                </div>
                                <div id="status" ref={statusDivRef}>Status: Idle</div>
                            </div>
                        </div>

                        {/* Right Column - Video Details */}
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Stream Details
                                </h2>
                                <div className="space-y-4">
                                    {/* Status Badges */}
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            Live
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                            Public
                                        </span>
                                    </div>

                                    {/* Created Date */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">Created:</span>
                                        <span className="font-medium text-gray-900">
                                            {formatDate(Date.now().toString())}
                                        </span>
                                    </div>

                                    {/* Source Type */}
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Source Type</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            WebRTC
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Streaming Metrics */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Metrics
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">
                                            Viewers
                                        </span>
                                        <span className="text-sm font-medium text-gray-500">
                                            0
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">
                                            Followers
                                        </span>
                                        <span className="text-sm font-medium text-gray-500">
                                            0
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                        <span className="text-sm text-gray-600">
                                            Display Branding
                                        </span>
                                        <span className="text-sm font-medium text-blue-600">
                                            Yes
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                                    Description
                                </h2>
                                <div
                                    className="text-sm text-gray-700 prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: "Test Live Streaming" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LiveStreamingPage;