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
  selectedPlace?: Place | null;
}

export function MapContainer({ places, isLoading, selectedPlace }: MapContainerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map
    const map = L.map(mapContainerRef.current).setView([40.7388, -74.0459], 12);

    // Add Carto Light tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      maxZoom: 18,
      subdomains: 'abcd'
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

  // Handle selected place focusing
  useEffect(() => {
    if (!mapRef.current || !selectedPlace) return;

    const map = mapRef.current;
    map.setView([selectedPlace.lat, selectedPlace.lon], 16);

    // Find and open the popup for the selected place
    markersRef.current?.eachLayer((layer: any) => {
      if (layer.options && layer.getLatLng) {
        const latLng = layer.getLatLng();
        if (Math.abs(latLng.lat - selectedPlace.lat) < 0.0001 && 
            Math.abs(latLng.lng - selectedPlace.lon) < 0.0001) {
          setTimeout(() => layer.openPopup(), 300);
        }
      }
    });
  }, [selectedPlace]);

  const createPopupContent = (place: Place, config: typeof ACTIVITY_CONFIGS[keyof typeof ACTIVITY_CONFIGS]) => {
    const hasDetails = place.address || place.phone || place.website || place.description;
    
    let content = `
      <div class="font-sans min-w-64">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 rounded-full flex-shrink-0" style="background-color: ${config.color}"></div>
            <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">${config.label.slice(0, -1)}</span>
          </div>
        </div>
        <h3 class="font-bold text-lg text-gray-900 mb-2">${place.name}</h3>
    `;

    if (place.address) {
      content += `
        <div class="flex items-start space-x-2 mb-3">
          <svg class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
          </svg>
          <p class="text-sm text-gray-600">${place.address}</p>
        </div>
      `;
    }

    if (place.phone) {
      content += `
        <div class="flex items-center space-x-2 mb-2">
          <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
          </svg>
          <a href="tel:${place.phone}" class="text-sm text-blue-600 hover:text-blue-800">${place.phone}</a>
        </div>
      `;
    }

    if (place.website) {
      content += `
        <div class="flex items-center space-x-2 mb-2">
          <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clip-rule="evenodd"/>
          </svg>
          <a href="${place.website}" target="_blank" rel="noopener" class="text-sm text-blue-600 hover:text-blue-800">Visit Website</a>
        </div>
      `;
    }

    if (place.description) {
      content += `<p class="text-sm text-gray-700 mt-3 pt-3 border-t border-gray-200">${place.description}</p>`;
    }

    // Add action buttons
    if (place.address || (place.lat && place.lon)) {
      content += `
        <div class="flex space-x-2 mt-4 pt-3 border-t border-gray-200">
          <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}', '_blank')" 
                  class="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd"/>
            </svg>
            <span>Directions</span>
          </button>
          <button onclick="navigator.share ? navigator.share({title: '${place.name}', text: '${place.name} - ${config.label.slice(0, -1)}', url: window.location.href}) : null"
                  class="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 transition-colors">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
            </svg>
            <span>Share</span>
          </button>
        </div>
      `;
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
