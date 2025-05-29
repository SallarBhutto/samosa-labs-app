import type { Express, RequestHandler } from "express";
import { createToken, validateToken, removeToken } from "./auth-tokens";

// Simple authentication middleware
export const isSimpleAuthenticated: RequestHandler = async (req: any, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const tokenData = await validateToken(token);
    if (!tokenData) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Store user ID for route handlers
    req.userId = tokenData.userId;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
};

export async function setupSimpleAuth(app: Express) {
  // No setup needed for simple auth
}