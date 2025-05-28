import type { Express, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import type { User } from "@shared/schema";
import crypto from "crypto";

// Simple in-memory token store
const activeTokens = new Map<string, { userId: number; createdAt: Date }>();

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function cleanupExpiredTokens() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const tokensToDelete: string[] = [];
  
  activeTokens.forEach((data, token) => {
    if (data.createdAt < oneDayAgo) {
      tokensToDelete.push(token);
    }
  });
  
  tokensToDelete.forEach(token => activeTokens.delete(token));
}

// Clean up expired tokens every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

export async function setupSimpleAuth(app: Express) {
  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Login attempt for:", email);

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log("User not found:", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log("Invalid password for:", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token and store it
      const token = generateToken();
      activeTokens.set(token, { userId: user.id, createdAt: new Date() });
      
      console.log("Login successful for:", email, "Token:", token.substring(0, 8) + "...");

      // Return user without password and include token
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        ...userWithoutPassword, 
        token 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      activeTokens.delete(token);
      console.log("Token removed on logout:", token.substring(0, 8) + "...");
    }
    res.json({ message: "Logged out successfully" });
  });

  // Get current user endpoint
  app.get("/api/auth/user", isSimpleAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

export const isSimpleAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Auth check - Authorization header:", authHeader ? "Present" : "Missing");
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("Auth check - No valid auth header");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log("Auth check - Token:", token.substring(0, 8) + "...");
    
    const tokenData = activeTokens.get(token);
    if (!tokenData) {
      console.log("Auth check - Token not found in active tokens");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if token is expired (24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (tokenData.createdAt < oneDayAgo) {
      activeTokens.delete(token);
      console.log("Auth check - Token expired");
      return res.status(401).json({ message: "Token expired" });
    }

    const user = await storage.getUser(tokenData.userId);
    if (!user) {
      console.log("Auth check - User not found for token");
      activeTokens.delete(token);
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("Auth check - Success for user:", user.email);
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
};