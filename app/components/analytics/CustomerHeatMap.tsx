"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

interface CustomerHeatMapProps {
    locations: Array<{ latitude: number; longitude: number }>;
    height?: string;
}

export function CustomerHeatMap({ locations, height = "500px" }: CustomerHeatMapProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const heatLayerRef = useRef<any>(null);

    useEffect(() => {
        // Only initialize map once
        if (!mapContainerRef.current || mapRef.current) return;

        // Initialize map
        // @ts-expect-error - leaflet types not properly configured
        const map = L.map(mapContainerRef.current).setView([37.8, -96], 4);

        // Add OpenStreetMap tiles
        // @ts-expect-error - leaflet types not properly configured
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        mapRef.current = map;

        // Cleanup on unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!mapRef.current) return;

        // Remove existing heat layer
        if (heatLayerRef.current) {
            heatLayerRef.current.remove();
        }

        // Add new heat layer with locations
        if (locations && locations.length > 0) {
            const heatData = locations.map(loc => [loc.latitude, loc.longitude, 1] as [number, number, number]);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            heatLayerRef.current = (L as any).heatLayer(heatData, {
                radius: 25,
                blur: 15,
                maxZoom: 17,
                max: 1.0,
                minOpacity: locations.length > 10 ? 0.4 : 0.5,
                gradient: {
                    0.0: 'blue',
                    0.5: 'lime',
                    0.7: 'yellow',
                    1.0: 'red'
                }
            }).addTo(mapRef.current);
        }
    }, [locations]);

    return (
        <div
            ref={mapContainerRef}
            style={{ height, width: '100%', borderRadius: '0.5rem' }}
            className="z-0"
        />
    );
}
