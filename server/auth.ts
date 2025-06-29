import bcrypt from "bcryptjs";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import type { User } from "@shared/schema";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  return session({
    secret: "samosa-secret-key-2024-super-secure",
    resave: false,
    saveUninitialized: true, // Change to true for debugging
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: sessionTtl,
      sameSite: 'lax',
    },
    name: 'samosa.sid',
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        isVerified: true, // Auto-verify for now
      });

      // Set session and save it
      (req.session as any).userId = user.id;
      
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Session error" });
        }
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session and save it
      (req.session as any).userId = user.id;
      console.log("Login - Setting userId in session:", user.id);
      console.log("Login - Session object:", req.session);
      console.log("Login - Session ID:", req.sessionID);
      
      // Simplified - just set session and respond
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user endpoint
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const userId = (req.session as any)?.userId;
  
  console.log("Auth check - Session ID:", req.sessionID);
  console.log("Auth check - User ID from session:", userId);
  
  if (!userId) {
    console.log("No userId in session");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await storage.getUser(userId);
    if (!user) {
      console.log("User not found for ID:", userId);
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    console.log("User authenticated:", user.email);
    // Attach user to request for convenience
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}