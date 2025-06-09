import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "./useAuth";
import type { Place } from "@shared/types";
import type { Favorite } from "@shared/schema";

export function useFavorites() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data: favorites = [], isLoading } = useQuery<Favorite[]>({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated,
  });

  const addFavoriteMutation = useMutation({
    mutationFn: async (place: Place) => {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          placeId: place.id.toString(),
          placeName: place.name,
          placeType: place.type,
          placeLat: place.lat.toString(),
          placeLon: place.lon.toString(),
          placeAddress: place.address || "",
        }),
      });
      if (!response.ok) throw new Error("Failed to add favorite");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (placeId: string | number) => {
      const response = await fetch(`/api/favorites/${placeId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to remove favorite");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  const isFavorite = (placeId: string | number): boolean => {
    return favorites.some((fav: Favorite) => fav.placeId === placeId.toString());
  };

  const toggleFavorite = async (place: Place) => {
    if (isFavorite(place.id)) {
      await removeFavoriteMutation.mutateAsync(place.id);
    } else {
      await addFavoriteMutation.mutateAsync(place);
    }
  };

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    addFavorite: addFavoriteMutation.mutateAsync,
    removeFavorite: removeFavoriteMutation.mutateAsync,
    isAddingFavorite: addFavoriteMutation.isPending,
    isRemovingFavorite: removeFavoriteMutation.isPending,
  };
}