import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  password: varchar("password").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  isAdmin: boolean("is_admin").default(false),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Simple pricing model - $5 per user
export const pricingConfig = pgTable("pricing_config", {
  id: serial("id").primaryKey(),
  pricePerUser: decimal("price_per_user", { precision: 10, scale: 2 }).notNull().default("5.00"),
  stripeProductId: varchar("stripe_product_id"),
  stripePriceId: varchar("stripe_price_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  userCount: integer("user_count").notNull(), // Number of users purchased
  billingInterval: varchar("billing_interval").notNull().default("month"), // "month" or "year"
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(), // Price after discount
  stripeSubscriptionId: varchar("stripe_subscription_id").unique(),
  status: varchar("status").notNull().default("active"), // active, canceled, past_due
  hasEmailSupport: boolean("has_email_support").default(false),
  hasOnCallSupport: boolean("has_on_call_support").default(false),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// License keys - One per subscription
export const licenseKeys = pgTable("license_keys", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subscriptionId: integer("subscription_id").notNull().references(() => subscriptions.id, { onDelete: "cascade" }),
  userCount: integer("user_count").notNull(), // Number of users allowed for this license
  status: varchar("status").notNull().default("active"), // active, revoked, expired
  lastUsed: timestamp("last_used"),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team members (for team plans)
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id").notNull().references(() => subscriptions.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role").notNull().default("member"), // owner, member
  invitedBy: integer("invited_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Auth tokens for persistent authentication
export const authTokens = pgTable("auth_tokens", {
  id: serial("id").primaryKey(),
  token: varchar("token").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
  licenseKeys: many(licenseKeys),
  teamMemberships: many(teamMembers),
}));

export const pricingConfigRelations = relations(pricingConfig, ({ many }) => ({
  // No direct relations needed for pricing config
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  licenseKeys: many(licenseKeys),
}));

export const licenseKeysRelations = relations(licenseKeys, ({ one }) => ({
  user: one(users, { fields: [licenseKeys.userId], references: [users.id] }),
  subscription: one(subscriptions, { fields: [licenseKeys.subscriptionId], references: [subscriptions.id] }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  subscription: one(subscriptions, { fields: [teamMembers.subscriptionId], references: [subscriptions.id] }),
  user: one(users, { fields: [teamMembers.userId], references: [users.id] }),
  inviter: one(users, { fields: [teamMembers.invitedBy], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLicenseKeySchema = createInsertSchema(licenseKeys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type LicenseKey = typeof licenseKeys.$inferSelect;
export type InsertLicenseKey = z.infer<typeof insertLicenseKeySchema>;
export type PricingConfig = typeof pricingConfig.$inferSelect;
