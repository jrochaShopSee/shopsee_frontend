declare module 'leaflet' {
    interface HeatLayerOptions {
        minOpacity?: number;
        maxZoom?: number;
        max?: number;
        radius?: number;
        blur?: number;
        gradient?: { [key: number]: string };
    }

    interface Layer {
        addTo(map: Map): this;
        remove(): this;
    }

    function heatLayer(
        latlngs: Array<[number, number, number]>,
        options?: HeatLayerOptions
    ): Layer;
}

declare module 'leaflet.heat' {
    // This module extends leaflet
}
