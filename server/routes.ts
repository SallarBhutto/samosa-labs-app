import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupSimpleAuth, isSimpleAuthenticated } from "./auth-simple";
import { z } from "zod";
import { randomBytes } from "crypto";

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
  planId: z.number(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupSimpleAuth(app);

  // Initialize subscription plans if they don't exist
  const existingPlans = await storage.getSubscriptionPlans();
  if (existingPlans.length === 0) {
    await storage.createSubscriptionPlan({
      name: "Solo",
      description: "Perfect for individual developers",
      price: "9.00",
      maxLicenses: 1,
      features: ["1 License Key", "Basic Support", "API Access"],
    });

    await storage.createSubscriptionPlan({
      name: "Team",
      description: "Great for small teams",
      price: "29.00",
      maxLicenses: 5,
      features: ["Up to 5 License Keys", "Team Management", "Priority Support", "Advanced Analytics"],
    });

    await storage.createSubscriptionPlan({
      name: "Enterprise",
      description: "For large organizations",
      price: "99.00",
      maxLicenses: -1, // unlimited
      features: ["Unlimited License Keys", "Advanced Team Management", "24/7 Dedicated Support", "Custom Integrations", "SLA Guarantee"],
    });
  }

  // Auth routes are now handled in auth.ts

  // Public API routes
  app.get('/api/subscription-plans', async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
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
          plan: subscription.plan.name,
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
  app.get('/api/user/subscription', isSimpleAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const subscription = await storage.getUserSubscription(userId);
      res.json(subscription);
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.get('/api/user/license-keys', isSimpleAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const licenseKeys = await storage.getUserLicenseKeys(userId);
      res.json(licenseKeys);
    } catch (error) {
      console.error("Error fetching license keys:", error);
      res.status(500).json({ message: "Failed to fetch license keys" });
    }
  });

  app.post('/api/user/license-keys', isSimpleAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscription = await storage.getUserSubscription(userId);
      
      if (!subscription) {
        return res.status(400).json({ message: "No active subscription found" });
      }

      const currentKeys = await storage.getUserLicenseKeys(userId);
      if (subscription.plan.maxLicenses !== -1 && currentKeys.length >= subscription.plan.maxLicenses) {
        return res.status(400).json({ message: "License key limit reached for your plan" });
      }

      // Generate unique license key
      const keyPrefix = subscription.plan.name.toUpperCase().substring(0, 4);
      const keyParts = Array.from({ length: 3 }, () => 
        randomBytes(2).toString('hex').toUpperCase()
      );
      const licenseKey = `QB-${keyPrefix}-${keyParts.join('-')}`;

      const newKey = await storage.createLicenseKey({
        key: licenseKey,
        userId,
        subscriptionId: subscription.id,
        status: "active",
      });

      res.json(newKey);
    } catch (error) {
      console.error("Error creating license key:", error);
      res.status(500).json({ message: "Failed to create license key" });
    }
  });

  app.delete('/api/user/license-keys/:id', isSimpleAuthenticated, async (req: any, res) => {
    try {
      const keyId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify the key belongs to the user
      const userKeys = await storage.getUserLicenseKeys(userId);
      const keyToRevoke = userKeys.find(key => key.id === keyId);
      
      if (!keyToRevoke) {
        return res.status(404).json({ message: "License key not found" });
      }

      await storage.revokeLicenseKey(keyId);
      res.json({ message: "License key revoked successfully" });
    } catch (error) {
      console.error("Error revoking license key:", error);
      res.status(500).json({ message: "Failed to revoke license key" });
    }
  });

  // Stripe subscription route
  app.post('/api/create-subscription', isSimpleAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { planId } = createSubscriptionSchema.parse(req.body);

      if (!user?.email) {
        return res.status(400).json({ message: 'User email is required' });
      }

      // Get the subscription plan
      const plans = await storage.getSubscriptionPlans();
      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        return res.status(400).json({ message: 'Invalid plan selected' });
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
        await storage.upsertUser({
          ...user,
          stripeCustomerId: customerId,
        });
      }

      // Create Stripe subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: plan.description || undefined,
            },
            unit_amount: Math.round(parseFloat(plan.price) * 100),
            recurring: {
              interval: 'month',
            },
          },
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      // Save subscription to database
      await storage.createSubscription({
        userId,
        planId: plan.id,
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
  app.get('/api/admin/users', isSimpleAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
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

  app.get('/api/admin/license-keys', isSimpleAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
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

  app.get('/api/admin/stats', isSimpleAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
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

  app.delete('/api/admin/license-keys/:id', isSimpleAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
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
