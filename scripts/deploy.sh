#!/bin/bash

# Build the Next.js application
echo "Building Next.js application..."
npm run build

# Create the ecosystem file for PM2
echo "Creating PM2 ecosystem file..."
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: 'anime-gpt',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    env: {
      PORT: 3000,
      NODE_ENV: 'production'
    }
  }]
}
EOL

# Create nginx configuration
echo "Creating nginx configuration..."
cat > nginx.conf << EOL
server {
    listen 80;
    server_name \$hostname;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

echo "Deploy script created successfully!"
