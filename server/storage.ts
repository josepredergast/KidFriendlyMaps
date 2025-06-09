import {
  users,
  favorites,
  type User,
  type UpsertUser,
  type InsertFavorite,
  type Favorite,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Favorite operations
  getUserFavorites(userId: string): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, placeId: string): Promise<void>;
  isFavorite(userId: string, placeId: string): Promise<boolean>;
  toggleVisited(userId: string, placeId: string): Promise<Favorite>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Favorite operations
  async getUserFavorites(userId: string): Promise<Favorite[]> {
    return await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId));
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db
      .insert(favorites)
      .values(favorite)
      .onConflictDoNothing()
      .returning();
    return newFavorite;
  }

  async removeFavorite(userId: string, placeId: string): Promise<void> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.placeId, placeId)));
  }

  async isFavorite(userId: string, placeId: string): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.placeId, placeId)));
    return !!favorite;
  }

  async toggleVisited(userId: string, placeId: string): Promise<Favorite> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.placeId, placeId)));
    
    if (!favorite) {
      throw new Error("Favorite not found");
    }

    const newVisitedStatus = !favorite.visited;
    const [updatedFavorite] = await db
      .update(favorites)
      .set({
        visited: newVisitedStatus,
        visitedAt: newVisitedStatus ? new Date() : null,
      })
      .where(and(eq(favorites.userId, userId), eq(favorites.placeId, placeId)))
      .returning();

    return updatedFavorite;
  }
}

export const storage = new DatabaseStorage();
