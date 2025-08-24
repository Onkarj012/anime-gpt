# AWS Deployment Guide

## Prerequisites

- AWS Account with Free Tier access
- AWS CLI installed and configured
- Domain name (optional)

## Step 1: Set Up S3 for Static Assets

1. Create an S3 bucket:

```bash
aws s3 mb s3://anime-gpt-assets --region us-east-1
```

2. Configure bucket for static website hosting:

```bash
aws s3 website s3://anime-gpt-assets --index-document index.html
```

3. Create bucket policy (replace BUCKET_NAME):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::BUCKET_NAME/*"
    }
  ]
}
```

## Step 2: Launch EC2 Instance

1. Launch a t2.micro instance (Free Tier eligible):

   - AMI: Amazon Linux 2023
   - Instance Type: t2.micro
   - Storage: 8GB GP3 (Free Tier eligible)
   - Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)

2. SSH into your instance:

```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

## Step 3: Set Up EC2 Environment

1. Update system and install dependencies:

```bash
sudo yum update -y
sudo yum install -y nodejs npm git nginx
```

2. Install PM2 globally:

```bash
sudo npm install -g pm2
```

3. Configure nginx:

```bash
sudo cp nginx.conf /etc/nginx/conf.d/anime-gpt.conf
sudo systemctl enable nginx
sudo systemctl start nginx
```

## Step 4: Deploy Application

1. Clone repository and install dependencies:

```bash
git clone https://github.com/your-username/anime-gpt.git
cd anime-gpt
npm install
```

2. Set up environment variables:

```bash
cat > .env << EOL
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX=animegpt
PINECONE_CLOUD=aws
PINECONE_REGION=us-east-1
GROQ_API_KEY=your-groq-api-key
EOL
```

3. Run deployment script:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

4. Start application with PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
```

## Step 5: Configure Domain (Optional)

1. Create an Elastic IP and associate it with your EC2 instance
2. Update your domain's DNS settings to point to your EC2 instance
3. Configure SSL with Let's Encrypt:

```bash
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Monitoring and Maintenance

1. Monitor logs:

```bash
pm2 logs
```

2. Monitor instance metrics through AWS CloudWatch

3. Update application:

```bash
git pull
npm install
npm run build
pm2 reload all
```

## Cost Management (Free Tier)

AWS Free Tier includes:

- 750 hours/month of t2.micro EC2 instance
- 5GB of S3 storage
- 100GB/month of bandwidth

Monitor usage in AWS Cost Explorer to stay within Free Tier limits.

## Security Best Practices

1. Keep security groups restricted
2. Regularly update system packages
3. Use AWS WAF for additional security (not free tier)
4. Enable AWS CloudWatch basic monitoring
5. Regularly backup your data

## Troubleshooting

1. Check application logs:

```bash
pm2 logs
```

2. Check nginx logs:

```bash
sudo tail -f /var/log/nginx/error.log
```

3. Check system resources:

```bash
top
df -h
free -m
```
