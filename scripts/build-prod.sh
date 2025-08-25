#!/bin/bash

# Build the Next.js application
echo "Building Next.js application..."
npm run build

# Sync the static assets to S3
echo "Syncing static assets to S3..."
aws s3 sync .next/static s3://anime-gpt-assets/_next/static/ --acl public-read

# Print completion message
echo "Build complete! Static assets have been uploaded to S3."
