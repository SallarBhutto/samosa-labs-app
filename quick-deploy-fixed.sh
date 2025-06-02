#!/bin/bash

# SamosaLabs License Server - Quick EC2 Deployment Script
# This script packages and uploads your app to EC2

set -e

# Configuration
EC2_IP="16.170.223.216"
EC2_USER="ec2-user"
KEY_FILE="samosa-admin-app-pair.pem"
APP_DIR="/home/ec2-user/samosa-labs-app"

echo "🚀 Deploying SamosaLabs License Server to EC2..."

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ SSH key file not found: $KEY_FILE"
    echo "Please ensure your EC2 key pair is in the root folder"
    exit 1
fi

# Set correct permissions for SSH key
chmod 600 "$KEY_FILE"

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p deployment-package
cp -r client deployment-package/
cp -r server deployment-package/
cp -r shared deployment-package/
cp package.json deployment-package/
cp package-lock.json deployment-package/
cp tsconfig.json deployment-package/
cp vite.config.ts deployment-package/
cp tailwind.config.ts deployment-package/
cp postcss.config.js deployment-package/
cp components.json deployment-package/
cp drizzle.config.ts deployment-package/
cp init.sql deployment-package/
cp docker-compose.yml deployment-package/
cp Dockerfile deployment-package/
cp .env.example deployment-package/

# Create .env file for production
cat > deployment-package/.env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://samosalabs_user:samosa_secure_password_2024@postgres:5432/samosalabs
PGHOST=postgres
PGPORT=5432
PGUSER=samosalabs_user
PGPASSWORD=samosa_secure_password_2024
PGDATABASE=samosalabs
SESSION_SECRET=samosa_super_secret_session_key_2024_production
STRIPE_SECRET_KEY=sk_test_51I1EurFdciK24uWbAeYvVcHpjXbKOd9vscyJj5Os49COpqaPYnWcpasS8BoKT3jObXHIGSomT1aXA18VM9dVO8aj00uRYKwDiP
VITE_STRIPE_PUBLIC_KEY=pk_test_51I1EurFdciK24uWbyhVuNH3KliQdkEiPY0xW2pDYww0a77IHm5GR0UXYUEo4qet0THYLfdqqLYeF5d4VcEK45DIO00RkdCbm4x
STRIPE_WEBHOOK_SECRET=whsec_YOUR_EC2_WEBHOOK_SECRET_HERE
EOF

# Upload to EC2
echo "📡 Uploading to EC2 instance..."
scp -i "$KEY_FILE" -r deployment-package/* "$EC2_USER@$EC2_IP:$APP_DIR/"

# Deploy on EC2
echo "🔧 Setting up and starting services on EC2..."
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_IP" << 'ENDSSH'
cd /home/ec2-user/samosa-labs-app

# Stop existing containers
docker-compose down 2>/dev/null || true

# Remove specific containers that might conflict
docker rm -f samosalabs-db samosalabs-app 2>/dev/null || true

# Remove old containers only (preserve volumes for data safety)
docker system prune -f --volumes=false

# Build without cache and start with force recreate
docker-compose build --no-cache
docker-compose up -d --force-recreate

# Show status
docker-compose ps
echo "🎉 Deployment complete!"
echo "Access your app at: http://16.170.223.216:5000"
echo "Admin login: admin@samosalabs.com / samosa123$$"
ENDSSH

# Cleanup
rm -rf deployment-package

echo "✅ Deployment finished successfully!"
echo "Your SamosaLabs License Server is running at: http://$EC2_IP:5000"