// Database-backed token store for persistent authentication
import { db } from "./db";
import { authTokens } from "@shared/schema";
import { eq, lt } from "drizzle-orm";

export async function createToken(token: string, userId: number): Promise<void> {
  // Token expires after 30 days
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  await db.insert(authTokens).values({
    token,
    userId,
    expiresAt,
  });
  
  console.log("Token created:", token.substring(0, 8) + "...");
  
  // Clean up expired tokens
  await cleanupExpiredTokens();
}

export async function validateToken(token: string): Promise<{ userId: number } | null> {
  console.log("Validating token:", token.substring(0, 8) + "...");
  
  // First, clean up expired tokens
  await cleanupExpiredTokens();
  
  const [tokenData] = await db
    .select()
    .from(authTokens)
    .where(eq(authTokens.token, token))
    .limit(1);
  
  if (!tokenData) {
    console.log("Token not found in database");
    return null;
  }
  
  // Check if token is expired
  if (tokenData.expiresAt < new Date()) {
    await db.delete(authTokens).where(eq(authTokens.token, token));
    console.log("Token expired and removed");
    return null;
  }
  
  console.log("Token validated successfully");
  return { userId: tokenData.userId };
}

export async function removeToken(token: string): Promise<void> {
  await db.delete(authTokens).where(eq(authTokens.token, token));
  console.log("Token removed:", token.substring(0, 8) + "...");
}

export async function getTokenCount(): Promise<number> {
  const tokens = await db.select().from(authTokens);
  return tokens.length;
}

async function cleanupExpiredTokens(): Promise<void> {
  const now = new Date();
  await db.delete(authTokens).where(lt(authTokens.expiresAt, now));
}