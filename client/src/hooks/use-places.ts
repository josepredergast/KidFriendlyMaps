import { useState, useEffect } from 'react';
import type { Place, FilterState } from '@shared/types';
import { fetchPlacesFromOverpass, ACTIVITY_CONFIGS } from '@/lib/overpass';

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(() => {
    // Initialize all filters as active
    const initialFilters: FilterState = {};
    Object.keys(ACTIVITY_CONFIGS).forEach(key => {
      initialFilters[key] = true;
    });
    return initialFilters;
  });

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedPlaces = await fetchPlacesFromOverpass();
      setPlaces(fetchedPlaces);
    } catch (err) {
      console.error('Error loading places:', err);
      setError(err instanceof Error ? err.message : 'Failed to load places');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFilter = (type: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const filteredPlaces = places.filter(place => filters[place.type]);

  const getPlaceCountByType = (type: string): number => {
    return places.filter(place => place.type === type).length;
  };

  const getTotalVisiblePlaces = (): number => {
    return filteredPlaces.length;
  };

  return {
    places: filteredPlaces,
    allPlaces: places,
    isLoading,
    error,
    filters,
    toggleFilter,
    loadPlaces,
    getPlaceCountByType,
    getTotalVisiblePlaces
  };
}
