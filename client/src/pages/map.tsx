import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { MapContainer } from '@/components/map-container';
import { usePlaces } from '@/hooks/use-places';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import type { Place } from '@shared/types';

export default function MapPage() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const { user } = useAuth();
  const { toggleFavorite, toggleVisited, isVisited, isFavorite } = useFavorites();
  
  const {
    places,
    allPlaces,
    isLoading,
    error,
    filters,
    toggleFilter,
    loadPlaces,
    getPlaceCountByType,
    getTotalVisiblePlaces
  } = usePlaces();

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
  };

  // Expose functions to window for popup access
  useEffect(() => {
    (window as any).toggleFavorite = toggleFavorite;
    (window as any).toggleVisited = toggleVisited;
    (window as any).isVisited = isVisited;
    (window as any).isFavorite = isFavorite;
    return () => {
      delete (window as any).toggleFavorite;
      delete (window as any).toggleVisited;
      delete (window as any).isVisited;
      delete (window as any).isFavorite;
    };
  }, [toggleFavorite, toggleVisited, isVisited, isFavorite]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        filters={filters}
        onToggleFilter={toggleFilter}
        onRefresh={loadPlaces}
        isLoading={isLoading}
        getPlaceCount={getPlaceCountByType}
        totalPlaces={getTotalVisiblePlaces()}
        error={error}
        places={allPlaces}
        onPlaceSelect={handlePlaceSelect}
        user={user}
      />
      <MapContainer 
        places={places} 
        isLoading={isLoading} 
        selectedPlace={selectedPlace}
      />
    </div>
  );
}
