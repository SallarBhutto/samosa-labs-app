#!/bin/bash

# SamosaLabs License Server - AWS EC2 Deployment Script
# Run this script on your EC2 instance (16.170.223.216)

set -e

echo "🚀 Starting SamosaLabs License Server Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo yum update -y

# Install Docker
echo -e "${YELLOW}🐳 Installing Docker...${NC}"
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
echo -e "${YELLOW}🔧 Installing Docker Compose...${NC}"
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
echo -e "${YELLOW}📁 Setting up application directory...${NC}"
mkdir -p /home/ec2-user/samosalabs-app
cd /home/ec2-user/samosalabs-app

# Create docker-compose.yml with your Stripe keys
echo -e "${YELLOW}⚙️ Creating Docker Compose configuration...${NC}"
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: samosalabs-db
    environment:
      POSTGRES_DB: samosalabs
      POSTGRES_USER: samosalabs_user
      POSTGRES_PASSWORD: samosa_secure_password_2024
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - samosalabs-network

  app:
    image: node:20-alpine
    container_name: samosalabs-app
    working_dir: /app
    environment:
      NODE_ENV: production
      PORT: 5000
      DATABASE_URL: postgresql://samosalabs_user:samosa_secure_password_2024@postgres:5432/samosalabs
      PGHOST: postgres
      PGPORT: 5432
      PGUSER: samosalabs_user
      PGPASSWORD: samosa_secure_password_2024
      PGDATABASE: samosalabs
      SESSION_SECRET: samosa_super_secret_session_key_2024_production
      STRIPE_SECRET_KEY: sk_test_51I1EurFdciK24uWbAeYvVcHpjXbKOd9vscyJj5Os49COpqaPYnWcpasS8BoKT3jObXHIGSomT1aXA18VM9dVO8aj00uRYKwDiP
      VITE_STRIPE_PUBLIC_KEY: pk_test_51I1EurFdciK24uWbyhVuNH3KliQdkEiPY0xW2pDYww0a77IHm5GR0UXYUEo4qet0THYLfdqqLYeF5d4VcEK45DIO00RkdCbm4x
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - samosalabs-network
    volumes:
      - ./app-source:/app
    command: sh -c "cd /app && npm ci && npm run build && npm start"

networks:
  samosalabs-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
EOF

# Create database initialization script
echo -e "${YELLOW}🗄️ Creating database schema...${NC}"
cat > init.sql << 'EOF'
-- Initialize SamosaLabs database schema

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
-- You'll need to hash this password properly in your application
INSERT INTO users (email, "firstName", "lastName", password, "isAdmin") 
VALUES (
    'admin@samosalabs.com', 
    'Admin', 
    'User', 
    '$2b$10$YourHashedPasswordHere', 
    true
) ON CONFLICT (email) DO NOTHING;
EOF

# Create app source directory
mkdir -p app-source

# Configure firewall
echo -e "${YELLOW}🔒 Configuring firewall...${NC}"
sudo yum install -y firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload

echo -e "${GREEN}✅ Basic setup complete!${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Upload your application source code to: /home/ec2-user/samosalabs-app/app-source/"
echo "2. Run: docker-compose up -d"
echo "3. Access your app at: http://16.170.223.216:5000"
echo ""
echo -e "${GREEN}🎉 Your SamosaLabs License Server will be ready!${NC}"
echo "Admin login: admin@samosalabs.com / samosa123$$"
EOF