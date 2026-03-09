#!/bin/bash

# Deployment Script for S3/CloudFront
# Deploy Next.js static export to AWS S3 and invalidate CloudFront cache
# Usage: ./deploy-to-s3.sh <env>
# Example: ./deploy-to-s3.sh dev  OR  ./deploy-to-s3.sh prod

set -e

# Check if environment argument is provided
if [ -z "$1" ]; then
    echo "Error: Environment argument is required"
    echo "Usage: ./deploy-to-s3.sh <env>"
    echo "Example: ./deploy-to-s3.sh dev  OR  ./deploy-to-s3.sh prod"
    exit 1
fi

ENV="$1"

# Validate environment
if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
    echo "Error: Invalid environment '$ENV'. Must be 'dev' or 'prod'"
    exit 1
fi

echo "Starting deployment to S3 ($ENV environment)..."

# Configuration based on environment
if [ "$ENV" = "dev" ]; then
    S3_BUCKET="arjunasarrow-static-website-dev"
    CLOUDFRONT_DISTRIBUTION_ID="E278WYD6PIAIJI"
elif [ "$ENV" = "prod" ]; then
    S3_BUCKET="arjunasarrow-static-website-prod"
    CLOUDFRONT_DISTRIBUTION_ID="E26XPW7C33OUMG"
fi

OUT_DIR="out"

echo "Environment: $ENV"
echo "S3 Bucket: $S3_BUCKET"
echo "CloudFront Distribution: $CLOUDFRONT_DISTRIBUTION_ID"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if out directory exists
if [ ! -d "$OUT_DIR" ]; then
    echo "Error: $OUT_DIR directory not found. Please run 'npm run build:dev' first."
    exit 1
fi

echo "Uploading files to S3 bucket: $S3_BUCKET"

# Upload HTML files with cache-control (no cache for HTML)
echo "Uploading HTML files..."
aws s3 sync $OUT_DIR s3://$S3_BUCKET \
    --exclude "*" \
    --include "*.html" \
    --cache-control "public, max-age=0, must-revalidate" \
    --content-type "text/html" \
    --delete

# Upload static assets (_next folder) with long cache
echo "Uploading static assets (_next folder)..."
aws s3 sync "$OUT_DIR/_next" "s3://$S3_BUCKET/_next" \
    --cache-control "public, max-age=31536000, immutable" \
    --delete

# Upload other static files (images, fonts, etc.)
echo "Uploading other static files..."
aws s3 sync $OUT_DIR s3://$S3_BUCKET \
    --exclude "*.html" \
    --exclude "_next/*" \
    --cache-control "public, max-age=86400" \
    --delete

# Set correct content types for JavaScript files
echo "Setting content types for JavaScript files..."
aws s3 cp "s3://$S3_BUCKET/_next" "s3://$S3_BUCKET/_next" \
    --recursive \
    --exclude "*" \
    --include "*.js" \
    --content-type "application/javascript" \
    --metadata-directive REPLACE \
    --cache-control "public, max-age=31536000, immutable"

# Set correct content types for CSS files
echo "Setting content types for CSS files..."
aws s3 cp "s3://$S3_BUCKET/_next" "s3://$S3_BUCKET/_next" \
    --recursive \
    --exclude "*" \
    --include "*.css" \
    --content-type "text/css" \
    --metadata-directive REPLACE \
    --cache-control "public, max-age=31536000, immutable"

# Create CloudFront invalidation
echo "Creating CloudFront invalidation..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

echo "Deployment completed successfully!"
echo "CloudFront invalidation created: $INVALIDATION_ID"
echo "Note: CloudFront invalidation may take 5-15 minutes to complete."
echo ""
echo "You can check the status with:"
echo "aws cloudfront get-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --id $INVALIDATION_ID"
