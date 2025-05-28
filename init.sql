-- Initialize SamosaLabs database schema
-- This will be executed when the PostgreSQL container starts

-- Create sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE,
    "firstName" VARCHAR,
    "lastName" VARCHAR,
    "profileImageUrl" VARCHAR,
    password VARCHAR NOT NULL,
    "isAdmin" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create pricing_config table
CREATE TABLE IF NOT EXISTS pricing_config (
    id SERIAL PRIMARY KEY,
    "pricePerUser" DECIMAL(10,2) DEFAULT 5.00,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "userCount" INTEGER NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    status VARCHAR DEFAULT 'active',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create license_keys table
CREATE TABLE IF NOT EXISTS license_keys (
    id SERIAL PRIMARY KEY,
    key VARCHAR UNIQUE NOT NULL,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "subscriptionId" INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
    "userCount" INTEGER NOT NULL,
    status VARCHAR DEFAULT 'active',
    "lastUsed" TIMESTAMP,
    "usageCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Insert default pricing configuration
INSERT INTO pricing_config ("pricePerUser") VALUES (5.00) ON CONFLICT DO NOTHING;

-- Insert admin user (password: samosa123$$)
INSERT INTO users (email, "firstName", "lastName", password, "isAdmin") 
VALUES (
    'admin@samosalabs.com', 
    'Admin', 
    'User', 
    '$2b$10$YourHashedPasswordHere', 
    true
) ON CONFLICT (email) DO NOTHING;