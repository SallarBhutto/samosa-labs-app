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
    email VARCHAR UNIQUE NOT NULL,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    stripe_customer_id VARCHAR,
    stripe_subscription_id VARCHAR,
    password VARCHAR NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create pricing_config table
CREATE TABLE IF NOT EXISTS pricing_config (
    id SERIAL PRIMARY KEY,
    price_per_user DECIMAL(10,2) NOT NULL DEFAULT 5.00,
    stripe_product_id VARCHAR,
    stripe_price_id VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_count INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    stripe_subscription_id VARCHAR UNIQUE,
    status VARCHAR NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create license_keys table
CREATE TABLE IF NOT EXISTS license_keys (
    id SERIAL PRIMARY KEY,
    key VARCHAR NOT NULL UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    user_count INTEGER NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'active',
    last_used TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create auth_tokens table for persistent authentication
CREATE TABLE IF NOT EXISTS auth_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR NOT NULL UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR NOT NULL DEFAULT 'member',
    invited_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default pricing configuration
INSERT INTO pricing_config (price_per_user) VALUES (5.00) ON CONFLICT DO NOTHING;

-- Insert admin user (password: samosa123$$)
-- Using the actual bcrypt hash from Replit database
INSERT INTO users (email, first_name, last_name, password, is_admin) 
VALUES (
    'admin@samosalabs.com', 
    'Admin', 
    'User', 
    '$2b$12$VoA6eOyhE395T9jnuV4pmOYGoALlc0xZ9pWSesPtaTehiWOeDxp3y', 
    true
) ON CONFLICT (email) DO NOTHING;