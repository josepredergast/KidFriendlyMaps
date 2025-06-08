import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HUDSON_COUNTY_BOUNDS, ACTIVITY_CONFIGS } from '@/lib/overpass';
import type { Place } from '@shared/types';

// Fix for default markers in Leaflet with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapContainerProps {
  places: Place[];
  isLoading: boolean;
}

export function MapContainer({ places, isLoading }: MapContainerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map
    const map = L.map(mapContainerRef.current).setView([40.7388, -74.0459], 12);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    // Fit map to Hudson County bounds
    const bounds = L.latLngBounds(
      [HUDSON_COUNTY_BOUNDS.south, HUDSON_COUNTY_BOUNDS.west],
      [HUDSON_COUNTY_BOUNDS.north, HUDSON_COUNTY_BOUNDS.east]
    );
    map.fitBounds(bounds, { padding: [20, 20] });

    // Create markers layer group
    const markersLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    markersRef.current = markersLayer;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  // Update markers when places change
  useEffect(() => {
    if (!markersRef.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add new markers
    places.forEach(place => {
      if (!place.lat || !place.lon) return;

      const config = ACTIVITY_CONFIGS[place.type];
      if (!config) return;

      // Create custom icon
      const icon = L.divIcon({
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background-color: ${config.color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
          ">${config.icon}</div>
        `,
        className: 'custom-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      // Create marker
      const marker = L.marker([place.lat, place.lon], { icon });

      // Create popup content
      const popupContent = createPopupContent(place, config);
      marker.bindPopup(popupContent);

      // Add to layer group
      markersRef.current?.addLayer(marker);
    });
  }, [places]);

  const createPopupContent = (place: Place, config: typeof ACTIVITY_CONFIGS[keyof typeof ACTIVITY_CONFIGS]) => {
    let content = `
      <div class="font-sans">
        <div class="flex items-center space-x-2 mb-2">
          <div class="w-3 h-3 rounded-full" style="background-color: ${config.color}"></div>
          <span class="text-xs font-medium text-gray-600 uppercase">${config.label.slice(0, -1)}</span>
        </div>
        <h3 class="font-semibold text-gray-900 mb-1">${place.name}</h3>
    `;

    if (place.address) {
      content += `<p class="text-sm text-gray-600 mb-2">${place.address}</p>`;
    }

    if (place.phone) {
      content += `<p class="text-sm text-blue-600 mb-1"><a href="tel:${place.phone}">${place.phone}</a></p>`;
    }

    if (place.website) {
      content += `<p class="text-sm text-blue-600 mb-1"><a href="${place.website}" target="_blank" rel="noopener">Visit Website</a></p>`;
    }

    if (place.description) {
      content += `<p class="text-sm text-gray-700 mt-2">${place.description}</p>`;
    }

    content += `</div>`;
    return content;
  };

  return (
    <div className="flex-1 relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading kid-friendly places...</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
