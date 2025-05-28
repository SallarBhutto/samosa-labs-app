import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { z } from "zod";
import { randomBytes } from "crypto";
import { createToken, validateToken, removeToken } from "./auth-tokens";
import { isSimpleAuthenticated } from "./auth-simple";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

// Validation schemas
const validateLicenseSchema = z.object({
  licenseKey: z.string().min(1),
});

const createSubscriptionSchema = z.object({
  userCount: z.number().min(1),
});

// Authentication middleware
const authenticateUser = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("New auth check - Authorization header:", authHeader ? "Present" : "Missing");
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("New auth check - No valid authorization header");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    console.log("New auth check - Validating token:", token.substring(0, 8) + "...");
    
    const tokenData = validateToken(token);
    if (!tokenData) {
      console.log("New auth check - Token validation failed");
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("New auth check - Token valid, getting user...");
    const user = await storage.getUser(tokenData.userId);
    if (!user) {
      console.log("New auth check - User not found for token");
      removeToken(token);
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("New auth check - Success for user:", user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error("New auth middleware error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  
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
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const bcrypt = await import('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token
      const crypto = await import('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      createToken(token, user.id);
      
      console.log("Login successful for:", email);

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

  // Get current user endpoint
  app.get("/api/auth/user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      const tokenData = validateToken(token);
      if (!tokenData) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(tokenData.userId);
      if (!user) {
        removeToken(token);
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      removeToken(token);
    }
    res.json({ message: "Logged out successfully" });
  });

  // Also handle GET logout for compatibility
  app.get("/api/logout", (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      removeToken(token);
    }
    res.redirect('/');
  });

  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Hash password
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        isAdmin: false,
      });

      // Generate token
      const crypto = await import('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      createToken(token, user.id);

      // Return user without password and include token
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ 
        ...userWithoutPassword, 
        token 
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });



  // Simple $5 per user pricing - no complex plans needed

  // Auth routes are now handled in auth.ts

  // Get pricing info
  app.get('/api/pricing', async (req, res) => {
    try {
      const pricePerUser = await storage.getPricePerUser();
      res.json({ pricePerUser });
    } catch (error) {
      console.error("Error fetching pricing:", error);
      res.status(500).json({ message: "Failed to fetch pricing" });
    }
  });

  // License validation endpoint (public)
  app.post('/api/validate-license', async (req, res) => {
    try {
      const { licenseKey } = validateLicenseSchema.parse(req.body);
      
      const license = await storage.validateLicenseKey(licenseKey);
      if (!license) {
        return res.status(404).json({ 
          valid: false, 
          message: "License key not found or inactive" 
        });
      }

      // Update usage statistics
      await storage.updateLicenseKeyUsage(licenseKey);

      // Get user and subscription details
      const user = await storage.getUser(license.userId);
      const subscription = await storage.getUserSubscription(license.userId);

      res.json({
        valid: true,
        license: {
          key: license.key,
          status: license.status,
          lastUsed: license.lastUsed,
          usageCount: license.usageCount,
        },
        user: {
          id: user?.id,
          email: user?.email,
        },
        subscription: subscription ? {
          userCount: subscription.userCount,
          totalPrice: subscription.totalPrice,
          status: subscription.status,
          expiresAt: subscription.currentPeriodEnd,
        } : null,
      });
    } catch (error) {
      console.error("Error validating license:", error);
      res.status(500).json({ message: "Failed to validate license" });
    }
  });

  // Protected routes
  app.get('/api/user/subscription', isSimpleAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const subscription = await storage.getUserSubscription(userId);
      res.json(subscription);
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.get('/api/user/license-keys', isSimpleAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const licenseKeys = await storage.getUserLicenseKeys(userId);
      res.json(licenseKeys);
    } catch (error) {
      console.error("Error fetching license keys:", error);
      res.status(500).json({ message: "Failed to fetch license keys" });
    }
  });

  app.post('/api/user/license-keys', isSimpleAuthenticated, async (req: any, res) => {
    try {
      const userId = req.userId;
      const subscription = await storage.getUserSubscription(userId);
      
      if (!subscription) {
        return res.status(400).json({ message: "No active subscription found" });
      }

      const currentKeys = await storage.getUserLicenseKeys(userId);
      if (currentKeys.length >= 1) {
        return res.status(400).json({ message: "Only one license key per subscription allowed" });
      }

      // Generate unique license key
      const keyPrefix = "QBYT"; // QualityBytes prefix
      const keyParts = Array.from({ length: 3 }, () => 
        randomBytes(2).toString('hex').toUpperCase()
      );
      const licenseKey = `QB-${keyPrefix}-${keyParts.join('-')}`;

      const newKey = await storage.createLicenseKey({
        key: licenseKey,
        userId,
        userCount: subscription.userCount,
        subscriptionId: subscription.id,
        status: "active",
      });

      res.json(newKey);
    } catch (error) {
      console.error("Error creating license key:", error);
      res.status(500).json({ message: "Failed to create license key" });
    }
  });



  // Stripe subscription route
  app.post('/api/create-subscription', async (req: any, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      const tokenData = validateToken(token);
      if (!tokenData) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(tokenData.userId);
      if (!user) {
        removeToken(token);
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = user.id;
      const { userCount } = createSubscriptionSchema.parse(req.body);

      if (!user?.email) {
        return res.status(400).json({ message: 'User email is required' });
      }

      if (!userCount || userCount < 1) {
        return res.status(400).json({ message: 'Valid user count is required' });
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        });
        customerId = customer.id;
        
        // Update user with stripe customer ID
        await storage.updateUser(user.id, {
          stripeCustomerId: customerId,
        });
      }

      // Create Stripe product for this user count
      const product = await stripe.products.create({
        name: `SamosaLabs License (${userCount} users)`,
        description: `Monthly license for ${userCount} users at $5 per user`,
      });

      // Create Stripe price for $5 per user
      const price = await stripe.prices.create({
        currency: 'usd',
        unit_amount: userCount * 5 * 100, // $5 per user in cents
        recurring: {
          interval: 'month',
        },
        product: product.id,
      });

      // Create Stripe subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: price.id,
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      // Calculate total price (user count * $5)
      const totalPrice = (userCount * 5).toString();

      // Save subscription to database
      await storage.createSubscription({
        userId,
        userCount,
        totalPrice,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });

      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

      res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // Stripe webhook handler
  app.post('/api/stripe-webhook', async (req, res) => {
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'] as string,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err) {
      console.log('Webhook signature verification failed.');
      return res.status(400).send('Webhook signature verification failed.');
    }

    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.subscription) {
            // Update subscription status
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
            // Here you would update your database subscription status
            console.log('Payment succeeded for subscription:', subscription.id);
          }
          break;

        case 'customer.subscription.updated':
          const updatedSubscription = event.data.object as Stripe.Subscription;
          // Update subscription in database
          console.log('Subscription updated:', updatedSubscription.id);
          break;

        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object as Stripe.Subscription;
          // Cancel subscription in database
          console.log('Subscription canceled:', deletedSubscription.id);
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ message: 'Webhook processing failed' });
    }
  });

  // Admin routes
  app.get('/api/admin/users', async (req: any, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      const tokenData = validateToken(token);
      if (!tokenData) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(tokenData.userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/license-keys', async (req: any, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      const tokenData = validateToken(token);
      if (!tokenData) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(tokenData.userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const licenseKeys = await storage.getAllLicenseKeys();
      res.json(licenseKeys);
    } catch (error) {
      console.error("Error fetching license keys:", error);
      res.status(500).json({ message: "Failed to fetch license keys" });
    }
  });

  app.get('/api/admin/stats', async (req: any, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      const tokenData = validateToken(token);
      if (!tokenData) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(tokenData.userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.delete('/api/admin/license-keys/:id', async (req: any, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      const tokenData = validateToken(token);
      if (!tokenData) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(tokenData.userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const keyId = parseInt(req.params.id);
      await storage.revokeLicenseKey(keyId);
      res.json({ message: "License key revoked successfully" });
    } catch (error) {
      console.error("Error revoking license key:", error);
      res.status(500).json({ message: "Failed to revoke license key" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
