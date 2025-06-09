import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Favorites routes
  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { placeId, placeName, placeType, placeLat, placeLon, placeAddress } = req.body;
      
      const favorite = await storage.addFavorite({
        userId,
        placeId,
        placeName,
        placeType,
        placeLat,
        placeLon,
        placeAddress,
      });
      
      res.json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete('/api/favorites/:placeId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { placeId } = req.params;
      
      await storage.removeFavorite(userId, placeId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  app.get('/api/favorites/:placeId/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { placeId } = req.params;
      
      const isFavorite = await storage.isFavorite(userId, placeId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite:", error);
      res.status(500).json({ message: "Failed to check favorite" });
    }
  });

  // Toggle visited status
  app.patch('/api/favorites/:placeId/visited', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { placeId } = req.params;
      
      const updatedFavorite = await storage.toggleVisited(userId, placeId);
      res.json(updatedFavorite);
    } catch (error) {
      console.error("Error toggling visited status:", error);
      res.status(500).json({ message: "Failed to update visited status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
