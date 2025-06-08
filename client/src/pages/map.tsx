import { Sidebar } from '@/components/sidebar';
import { MapContainer } from '@/components/map-container';
import { usePlaces } from '@/hooks/use-places';

export default function MapPage() {
  const {
    places,
    isLoading,
    error,
    filters,
    toggleFilter,
    loadPlaces,
    getPlaceCountByType,
    getTotalVisiblePlaces
  } = usePlaces();

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
      />
      <MapContainer places={places} isLoading={isLoading} />
    </div>
  );
}
