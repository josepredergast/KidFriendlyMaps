import { Sidebar } from '@/components/sidebar';
import { MapContainer } from '@/components/map-container';
import { usePlaces } from '@/hooks/use-places';
import type { Place } from '@shared/types';

export default function MapPage() {
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
    // This will be implemented to focus the map on the selected place
    console.log('Selected place:', place);
  };

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
      />
      <MapContainer places={places} isLoading={isLoading} />
    </div>
  );
}
