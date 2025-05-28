#!/bin/bash

# Quick Deploy Script for SamosaLabs License Server
# Run this on your EC2 instance: 16.170.223.216

echo "🚀 SamosaLabs License Server - Quick Deploy"
echo "=========================================="

# Create deployment directory
cd /home/ec2-user
mkdir -p samosalabs-deployment
cd samosalabs-deployment

# Download and extract application files
echo "📦 Setting up application..."

# Create docker-compose.yml with your Stripe keys
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: samosalabs-db
    environment:
      POSTGRES_DB: samosalabs
      POSTGRES_USER: samosalabs_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-samosalabs_password}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - samosalabs-network

  app:
    build: .
    container_name: samosalabs-app
    environment:
      NODE_ENV: production
      PORT: 5000
      DATABASE_URL: postgresql://samosalabs_user:${POSTGRES_PASSWORD:-samosalabs_password}@postgres:5432/samosalabs
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

networks:
  samosalabs-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
EOF

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["npm", "start"]
EOF

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    sudo yum update -y
    sudo yum install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -a -G docker ec2-user
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    echo "🔧 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Configure firewall
echo "🔒 Configuring firewall..."
if command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --permanent --add-port=5000/tcp 2>/dev/null || true
    sudo firewall-cmd --permanent --add-port=80/tcp 2>/dev/null || true
    sudo firewall-cmd --permanent --add-port=443/tcp 2>/dev/null || true
    sudo firewall-cmd --reload 2>/dev/null || true
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Upload your application source code to this directory"
echo "2. Run: docker-compose up -d"
echo "3. Access your app at: http://16.170.223.216:5000"
echo ""
echo "🎉 Your SamosaLabs License Server will be ready!"
echo "Admin login: admin@samosalabs.com / samosa123$$"
EOF