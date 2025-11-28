"use client";

import { useEffect, useRef } from 'react';

declare function loadInternalVideo(
    id: string | undefined,
    elementId: string,
    hideVideoInfo: boolean,
    forceLoadJquery: boolean
): void;

interface ProfileVideoCardProps {
    videoId: string;
    scriptsLoaded: boolean;
}

export function ProfileVideoCard({ videoId, scriptsLoaded }: ProfileVideoCardProps) {
    const videoLoadedRef = useRef(false);

    useEffect(() => {
        if (scriptsLoaded && !videoLoadedRef.current) {
            const timer = setTimeout(() => {
                const container = document.getElementById(`shopsee_container_${videoId}`);
                if (container && typeof loadInternalVideo !== 'undefined') {
                    try {
                        loadInternalVideo(videoId, `shopsee_container_${videoId}`, false, false);
                        videoLoadedRef.current = true;
                    } catch (error) {
                        console.error('Error loading video:', error);
                    }
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [videoId, scriptsLoaded]);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="shopsee_video_card">
                <div
                    id={`shopsee_container_${videoId}`}
                    className="shopsee_player_container"
                />
            </div>
        </div>
    );
}
