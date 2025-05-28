# SamosaLabs License Server - AWS EC2 Deployment Guide

## Prerequisites

1. **AWS EC2 Instance** (Ubuntu 20.04+ recommended)
2. **Docker & Docker Compose** installed on the EC2 instance
3. **Stripe API Keys** (for payment processing)
4. **Domain name** (optional, but recommended for production)

## Quick Deployment Steps

### 1. Prepare Your EC2 Instance

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose -y

# Reboot to apply Docker group changes
sudo reboot
```

### 2. Clone Your Application

```bash
# Upload your application files to EC2 or clone from repository
scp -r /path/to/samosalabs-app ubuntu@your-ec2-ip:/home/ubuntu/
# OR if using git:
# git clone https://github.com/yourusername/samosalabs-license-server.git
```

### 3. Configure Environment Variables

Edit the `docker-compose.yml` file and add your Stripe keys:

```yaml
environment:
  # ... other variables ...
  STRIPE_SECRET_KEY: sk_live_your_stripe_secret_key_here
  VITE_STRIPE_PUBLIC_KEY: pk_live_your_stripe_public_key_here
```

### 4. Deploy the Application

```bash
# Navigate to your app directory
cd /home/ubuntu/samosalabs-app

# Build and start the containers
docker-compose up -d

# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f app
```

### 5. Setup Firewall & Security

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 5000/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### 6. Access Your Application

Your SamosaLabs license server will be available at:
- `http://your-ec2-public-ip:5000`

### 7. Initial Setup

1. **Login as Admin:**
   - Email: `admin@samosalabs.com`
   - Password: `samosa123$$`

2. **Add Your Stripe Keys** in the environment variables

3. **Test the License System:**
   - Create a test user account
   - Purchase a subscription
   - Generate license keys
   - Test license validation

## Production Considerations

### SSL/HTTPS Setup (Recommended)

1. **Install Nginx:**
```bash
sudo apt install nginx -y
```

2. **Configure Nginx as Reverse Proxy:**
```nginx
# /etc/nginx/sites-available/samosalabs
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Enable SSL with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### Database Backup Strategy

```bash
# Create backup script
cat > backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec samosalabs-db pg_dump -U samosalabs_user samosalabs > /home/ubuntu/backups/samosalabs_backup_$DATE.sql
find /home/ubuntu/backups -name "*.sql" -mtime +7 -delete
EOF

chmod +x backup-db.sh

# Add to crontab for daily backups
crontab -e
# Add line: 0 2 * * * /home/ubuntu/backup-db.sh
```

### Monitoring & Logs

```bash
# Monitor application logs
docker-compose logs -f app

# Monitor database logs
docker-compose logs -f postgres

# System monitoring
htop
df -h
free -m
```

## Scaling & Performance

### For High Traffic:

1. **Use AWS RDS** instead of containerized PostgreSQL
2. **Setup Load Balancer** with multiple EC2 instances
3. **Use Redis** for session storage
4. **Implement CDN** for static assets
5. **Setup Auto Scaling Groups**

### Environment Variables Reference

Required environment variables for production:

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/database
SESSION_SECRET=your-super-secure-session-secret
STRIPE_SECRET_KEY=sk_live_your_stripe_secret
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public
```

## Troubleshooting

### Common Issues:

1. **Container won't start:**
```bash
docker-compose logs app
docker-compose down && docker-compose up -d
```

2. **Database connection issues:**
```bash
docker-compose exec postgres psql -U samosalabs_user -d samosalabs
```

3. **Port conflicts:**
```bash
sudo netstat -tlnp | grep :5000
sudo lsof -i :5000
```

4. **Permission issues:**
```bash
sudo chown -R $USER:$USER /path/to/app
```

## Security Checklist

- [ ] Firewall configured properly
- [ ] SSL certificate installed
- [ ] Strong passwords for database
- [ ] Regular security updates
- [ ] Database backups automated
- [ ] Environment variables secured
- [ ] Admin password changed from default
- [ ] Stripe webhook endpoints secured

## Support

Your SamosaLabs License Server is now successfully deployed on AWS EC2! 

For production use, ensure you:
1. Configure proper domain and SSL
2. Set up monitoring and backups
3. Update all default passwords
4. Configure Stripe webhooks for subscription management