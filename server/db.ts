import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import ws from "ws";
import * as schema from "@shared/schema";
import { DATABASE_URL } from "@shared/config";

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Detect if we're using Neon (contains neon.tech) or regular PostgreSQL
const isNeonDatabase = DATABASE_URL.includes('neon.tech') || DATABASE_URL.includes('neon.database');
const isProduction = process.env.NODE_ENV === 'production';

let db: any;
let pool: any;

if (isNeonDatabase) {
  // Use Neon serverless driver for Replit/Neon
  neonConfig.webSocketConstructor = ws;
  pool = new NeonPool({ connectionString: DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // Use regular PostgreSQL driver for local Docker/traditional PostgreSQL
  pool = new PgPool({ 
    connectionString: DATABASE_URL,
    // Additional config for local development
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  db = pgDrizzle(pool, { schema });
}

export { db, pool };