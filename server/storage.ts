import {
  users,
  subscriptionPlans,
  subscriptions,
  licenseKeys,
  teamMembers,
  type User,
  type UpsertUser,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type Subscription,
  type InsertSubscription,
  type LicenseKey,
  type InsertLicenseKey,
  type TeamMember,
  type InsertTeamMember,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  
  // Subscription plan operations
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  
  // Subscription operations
  getUserSubscription(userId: number): Promise<(Subscription & { plan: SubscriptionPlan }) | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription>;
  
  // License key operations
  createLicenseKey(licenseKey: InsertLicenseKey): Promise<LicenseKey>;
  getUserLicenseKeys(userId: number): Promise<LicenseKey[]>;
  validateLicenseKey(key: string): Promise<LicenseKey | undefined>;
  revokeLicenseKey(id: number): Promise<void>;
  updateLicenseKeyUsage(key: string): Promise<void>;
  
  // Team member operations
  getTeamMembers(subscriptionId: number): Promise<(TeamMember & { user: User })[]>;
  addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  removeTeamMember(subscriptionId: number, userId: number): Promise<void>;
  
  // Admin operations
  getAllUsers(): Promise<(User & { subscription?: Subscription & { plan: SubscriptionPlan } })[]>;
  getAllLicenseKeys(): Promise<(LicenseKey & { user: User; subscription: Subscription & { plan: SubscriptionPlan } })[]>;
  getStats(): Promise<{
    totalUsers: number;
    activeSubscriptions: number;
    totalLicenseKeys: number;
    monthlyRevenue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Subscription plan operations
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.price);
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [newPlan] = await db.insert(subscriptionPlans).values(plan).returning();
    return newPlan;
  }

  // Subscription operations
  async getUserSubscription(userId: number): Promise<(Subscription & { plan: SubscriptionPlan }) | undefined> {
    const result = await db
      .select()
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    if (result.length === 0) return undefined;

    return {
      ...result[0].subscriptions,
      plan: result[0].subscription_plans,
    };
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }

  async updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription> {
    const [updated] = await db
      .update(subscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return updated;
  }

  // License key operations
  async createLicenseKey(licenseKey: InsertLicenseKey): Promise<LicenseKey> {
    const [newKey] = await db.insert(licenseKeys).values(licenseKey).returning();
    return newKey;
  }

  async getUserLicenseKeys(userId: number): Promise<LicenseKey[]> {
    return await db
      .select()
      .from(licenseKeys)
      .where(eq(licenseKeys.userId, userId))
      .orderBy(desc(licenseKeys.createdAt));
  }

  async validateLicenseKey(key: string): Promise<LicenseKey | undefined> {
    const [licenseKey] = await db
      .select()
      .from(licenseKeys)
      .where(and(eq(licenseKeys.key, key), eq(licenseKeys.status, "active")));
    return licenseKey;
  }

  async revokeLicenseKey(id: number): Promise<void> {
    await db
      .update(licenseKeys)
      .set({ status: "revoked", updatedAt: new Date() })
      .where(eq(licenseKeys.id, id));
  }

  async updateLicenseKeyUsage(key: string): Promise<void> {
    await db
      .update(licenseKeys)
      .set({
        lastUsed: new Date(),
        usageCount: sql`${licenseKeys.usageCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(licenseKeys.key, key));
  }

  // Team member operations
  async getTeamMembers(subscriptionId: number): Promise<(TeamMember & { user: User })[]> {
    const result = await db
      .select()
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.subscriptionId, subscriptionId));

    return result.map(row => ({
      ...row.team_members,
      user: row.users,
    }));
  }

  async addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db.insert(teamMembers).values(teamMember).returning();
    return newMember;
  }

  async removeTeamMember(subscriptionId: number, userId: string): Promise<void> {
    await db
      .delete(teamMembers)
      .where(and(eq(teamMembers.subscriptionId, subscriptionId), eq(teamMembers.userId, userId)));
  }

  // Admin operations
  async getAllUsers(): Promise<(User & { subscription?: Subscription & { plan: SubscriptionPlan } })[]> {
    const result = await db
      .select()
      .from(users)
      .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
      .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .orderBy(desc(users.createdAt));

    const userMap = new Map<string, User & { subscription?: Subscription & { plan: SubscriptionPlan } }>();

    for (const row of result) {
      const userId = row.users.id;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          ...row.users,
          subscription: row.subscriptions && row.subscription_plans ? {
            ...row.subscriptions,
            plan: row.subscription_plans,
          } : undefined,
        });
      }
    }

    return Array.from(userMap.values());
  }

  async getAllLicenseKeys(): Promise<(LicenseKey & { user: User; subscription: Subscription & { plan: SubscriptionPlan } })[]> {
    const result = await db
      .select()
      .from(licenseKeys)
      .innerJoin(users, eq(licenseKeys.userId, users.id))
      .innerJoin(subscriptions, eq(licenseKeys.subscriptionId, subscriptions.id))
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .orderBy(desc(licenseKeys.createdAt));

    return result.map(row => ({
      ...row.license_keys,
      user: row.users,
      subscription: {
        ...row.subscriptions,
        plan: row.subscription_plans,
      },
    }));
  }

  async getStats(): Promise<{
    totalUsers: number;
    activeSubscriptions: number;
    totalLicenseKeys: number;
    monthlyRevenue: number;
  }> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [subCount] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));
    const [keyCount] = await db.select({ count: count() }).from(licenseKeys);
    
    // Calculate monthly revenue from active subscriptions
    const revenueResult = await db
      .select({
        revenue: sql<number>`sum(${subscriptionPlans.price}::numeric)`,
      })
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(subscriptions.status, "active"));

    return {
      totalUsers: userCount.count,
      activeSubscriptions: subCount.count,
      totalLicenseKeys: keyCount.count,
      monthlyRevenue: Number(revenueResult[0]?.revenue || 0),
    };
  }
}

export const storage = new DatabaseStorage();
