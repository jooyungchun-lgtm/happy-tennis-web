#!/bin/bash

# AWS 배포 스크립트
# 사용법: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
BUCKET_NAME="happy-tennis-web-$(date +%s)"
REGION="ap-northeast-2"
DISTRIBUTION_ID=""

echo "🚀 Starting deployment to AWS..."

# 1. 빌드
echo "📦 Building application..."
npm run build

# 2. S3 버킷 생성
echo "🪣 Creating S3 bucket: $BUCKET_NAME"
aws s3 mb s3://$BUCKET_NAME --region $REGION

# 3. 정적 파일 업로드
echo "📤 Uploading static files..."
aws s3 sync .next/static s3://$BUCKET_NAME/_next/static --delete
aws s3 sync public s3://$BUCKET_NAME/ --delete
aws s3 cp .next/index.html s3://$BUCKET_NAME/index.html

# 4. 버킷 정책 설정
echo "🔒 Setting bucket policy..."
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json
rm bucket-policy.json

# 5. CloudFront 배포 생성
echo "🌐 Creating CloudFront distribution..."
cat > cloudfront-config.json << EOF
{
    "CallerReference": "$(date +%s)",
    "Comment": "Happy Tennis Web App",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$BUCKET_NAME",
                "DomainName": "$BUCKET_NAME.s3.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$BUCKET_NAME",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
}
EOF

DISTRIBUTION_ID=$(aws cloudfront create-distribution --distribution-config file://cloudfront-config.json --query 'Distribution.Id' --output text)
rm cloudfront-config.json

echo "✅ Deployment completed!"
echo "📊 Distribution ID: $DISTRIBUTION_ID"
echo "🌐 CloudFront URL: https://$(aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DomainName' --output text)"
echo "⏰ Distribution is being deployed. It may take 10-15 minutes to be fully available."

# 6. 환경 변수 저장
echo "💾 Saving deployment info..."
cat > .deployment-info << EOF
BUCKET_NAME=$BUCKET_NAME
DISTRIBUTION_ID=$DISTRIBUTION_ID
REGION=$REGION
ENVIRONMENT=$ENVIRONMENT
DEPLOYED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF

echo "🎉 Deployment script completed!"
