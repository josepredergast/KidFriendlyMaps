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

  const toggleVisitedMutation = useMutation({
    mutationFn: async (placeId: string | number) => {
      const response = await fetch(`/api/favorites/${placeId}/visited`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to toggle visited status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  const isFavorite = (placeId: string | number): boolean => {
    return favorites.some((fav: Favorite) => fav.placeId === placeId.toString());
  };

  const isVisited = (placeId: string | number): boolean => {
    const favorite = favorites.find((fav: Favorite) => fav.placeId === placeId.toString());
    return favorite ? !!favorite.visited : false;
  };

  const getFavorite = (placeId: string | number): Favorite | undefined => {
    return favorites.find((fav: Favorite) => fav.placeId === placeId.toString());
  };

  const toggleFavorite = async (place: Place) => {
    if (isFavorite(place.id)) {
      await removeFavoriteMutation.mutateAsync(place.id);
    } else {
      await addFavoriteMutation.mutateAsync(place);
    }
  };

  const toggleVisited = async (placeId: string | number) => {
    await toggleVisitedMutation.mutateAsync(placeId);
  };

  return {
    favorites,
    isLoading,
    isFavorite,
    isVisited,
    getFavorite,
    toggleFavorite,
    toggleVisited,
    addFavorite: addFavoriteMutation.mutateAsync,
    removeFavorite: removeFavoriteMutation.mutateAsync,
    isAddingFavorite: addFavoriteMutation.isPending,
    isRemovingFavorite: removeFavoriteMutation.isPending,
    isTogglingVisited: toggleVisitedMutation.isPending,
  };
}