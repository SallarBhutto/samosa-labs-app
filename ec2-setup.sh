#!/bin/bash

# EC2 Initial Setup Script for SamosaLabs License Server
# Run this ONCE on your EC2 instance to install Docker and prepare environment

set -e

echo "Setting up EC2 instance for SamosaLabs License Server..."

# Update system
echo "Updating system packages..."
sudo yum update -y

# Install Docker
echo "Installing Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
echo "Creating application directory..."
mkdir -p /home/ec2-user/samosalabs-app

# Configure firewall
echo "Configuring firewall..."
sudo yum install -y firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload

echo "EC2 setup complete! You can now run the deployment script."
echo "Note: You may need to log out and back in for Docker permissions to take effect."