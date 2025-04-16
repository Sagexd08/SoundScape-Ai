# Terraform configuration for SoundScape-AI backend infrastructure

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
  
  backend "s3" {
    bucket = "soundscape-ai-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
    encrypt = true
  }
}

provider "aws" {
  region = var.aws_region
}

# EKS Cluster
module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  version         = "18.0.0"
  cluster_name    = var.cluster_name
  cluster_version = "1.23"
  
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets
  
  eks_managed_node_groups = {
    main = {
      desired_capacity = 3
      max_capacity     = 10
      min_capacity     = 2
      
      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"
      
      update_config = {
        max_unavailable_percentage = 50
      }
    }
  }
  
  # Use OIDC provider for IAM roles for service accounts
  enable_irsa = true
}

# VPC for the EKS cluster
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "3.14.0"
  
  name = "${var.cluster_name}-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  
  enable_nat_gateway     = true
  single_nat_gateway     = false
  one_nat_gateway_per_az = true
  enable_vpn_gateway     = false
  
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  public_subnet_tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                    = "1"
  }
  
  private_subnet_tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"           = "1"
  }
}

# RDS PostgreSQL for relational data
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 3.0"
  
  identifier = "${var.cluster_name}-postgres"
  
  engine               = "postgres"
  engine_version       = "14.5"
  family               = "postgres14"
  major_engine_version = "14"
  instance_class       = "db.t3.large"
  
  allocated_storage     = 100
  max_allocated_storage = 500
  storage_encrypted     = true
  
  name     = "soundscape"
  username = "soundscape_admin"
  password = var.db_password
  port     = 5432
  
  multi_az               = true
  subnet_ids             = module.vpc.private_subnets
  vpc_security_group_ids = [aws_security_group.rds.id]
  
  maintenance_window = "Mon:00:00-Mon:03:00"
  backup_window      = "03:00-06:00"
  
  # Enhanced monitoring
  monitoring_interval    = 60
  monitoring_role_name   = "${var.cluster_name}-rds-monitoring-role"
  create_monitoring_role = true
  
  # DB parameter group
  parameters = [
    {
      name  = "max_connections"
      value = "500"
    },
    {
      name  = "shared_buffers"
      value = "{DBInstanceClassMemory/4}"
    }
  ]
  
  backup_retention_period = 7
  skip_final_snapshot     = false
  deletion_protection     = true
  
  tags = {
    Environment = var.environment
    Project     = "SoundScape-AI"
  }
}

# ElastiCache Redis for caching
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "${var.cluster_name}-redis"
  engine               = "redis"
  node_type            = "cache.t3.medium"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis6.x"
  engine_version       = "6.2"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [aws_security_group.redis.id]
}

resource "aws_elasticache_subnet_group" "redis" {
  name       = "${var.cluster_name}-redis-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

# MongoDB Atlas for audio features and unstructured data
# Note: This uses a provider not included in the standard Terraform distribution
provider "mongodbatlas" {
  public_key  = var.mongodb_atlas_public_key
  private_key = var.mongodb_atlas_private_key
}

resource "mongodbatlas_cluster" "soundscape" {
  project_id = var.mongodb_atlas_project_id
  name       = "${var.cluster_name}-mongo"
  
  provider_name               = "AWS"
  provider_region_name        = var.aws_region
  provider_instance_size_name = "M20"
  mongo_db_major_version      = "5.0"
  
  # Replication settings
  replication_specs {
    num_shards = 1
    
    regions_config {
      region_name     = var.aws_region
      electable_nodes = 3
      priority        = 7
      read_only_nodes = 0
    }
  }
  
  # Advanced settings
  advanced_configuration {
    javascript_enabled                   = true
    minimum_enabled_tls_protocol         = "TLS1_2"
    no_table_scan                        = false
    oplog_size_mb                        = 2048
    sample_refresh_interval_bi_connector = 300
    sample_size_bi_connector             = 5000
  }
  
  labels {
    key   = "Environment"
    value = var.environment
  }
}

# S3 Bucket for object storage
resource "aws_s3_bucket" "storage" {
  bucket = "${var.cluster_name}-storage-${var.environment}"
  
  tags = {
    Name        = "SoundScape Storage"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "storage" {
  bucket = aws_s3_bucket.storage.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "storage" {
  bucket = aws_s3_bucket.storage.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "storage" {
  bucket = aws_s3_bucket.storage.id
  
  rule {
    id     = "transition-to-ia"
    status = "Enabled"
    
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    
    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }
  }
}

# MSK (Managed Streaming for Kafka)
resource "aws_msk_cluster" "soundscape" {
  cluster_name           = "${var.cluster_name}-kafka"
  kafka_version          = "2.8.1"
  number_of_broker_nodes = 3
  
  broker_node_group_info {
    instance_type   = "kafka.t3.small"
    client_subnets  = module.vpc.private_subnets
    security_groups = [aws_security_group.kafka.id]
    
    storage_info {
      ebs_storage_info {
        volume_size = 100
      }
    }
  }
  
  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
    encryption_at_rest_kms_key_arn = aws_kms_key.kafka.arn
  }
  
  open_monitoring {
    prometheus {
      jmx_exporter {
        enabled_in_broker = true
      }
      node_exporter {
        enabled_in_broker = true
      }
    }
  }
  
  logging_info {
    broker_logs {
      cloudwatch_logs {
        enabled   = true
        log_group = aws_cloudwatch_log_group.kafka.name
      }
    }
  }
  
  tags = {
    Environment = var.environment
    Project     = "SoundScape-AI"
  }
}

# Cloudfront distribution for audio delivery
resource "aws_cloudfront_distribution" "audio_cdn" {
  origin {
    domain_name = aws_s3_bucket.storage.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.storage.id}"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.audio_cdn.cloudfront_access_identity_path
    }
  }
  
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  
  # Default cache behavior
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "S3-${aws_s3_bucket.storage.id}"
    
    forwarded_values {
      query_string = false
      headers      = ["Origin", "Access-Control-Request-Headers", "Access-Control-Request-Method"]
      
      cookies {
        forward = "none"
      }
    }
    
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }
  
  # Geo restrictions
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  # SSL certificate
  viewer_certificate {
    cloudfront_default_certificate = true
  }
  
  tags = {
    Environment = var.environment
    Project     = "SoundScape-AI"
  }
}

resource "aws_cloudfront_origin_access_identity" "audio_cdn" {
  comment = "access-identity-${aws_s3_bucket.storage.id}"
}

# Security groups
resource "aws_security_group" "rds" {
  name        = "${var.cluster_name}-rds-sg"
  description = "Allow PostgreSQL inbound traffic from EKS cluster"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    description     = "PostgreSQL from EKS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "${var.cluster_name}-rds-sg"
  }
}

resource "aws_security_group" "redis" {
  name        = "${var.cluster_name}-redis-sg"
  description = "Allow Redis inbound traffic from EKS cluster"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    description     = "Redis from EKS"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "${var.cluster_name}-redis-sg"
  }
}

resource "aws_security_group" "kafka" {
  name        = "${var.cluster_name}-kafka-sg"
  description = "Allow Kafka inbound traffic from EKS cluster"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    description     = "Kafka from EKS"
    from_port       = 9092
    to_port         = 9092
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }
  
  ingress {
    description     = "Kafka TLS from EKS"
    from_port       = 9094
    to_port         = 9094
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "${var.cluster_name}-kafka-sg"
  }
}

# KMS key for MSK encryption
resource "aws_kms_key" "kafka" {
  description             = "KMS key for MSK cluster encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  
  tags = {
    Name        = "${var.cluster_name}-kafka-kms"
    Environment = var.environment
  }
}

# CloudWatch log group for MSK
resource "aws_cloudwatch_log_group" "kafka" {
  name              = "/msk/${var.cluster_name}-kafka"
  retention_in_days = 7
  
  tags = {
    Environment = var.environment
    Project     = "SoundScape-AI"
  }
}

# EKS OIDC Identity Provider for IAM roles
data "tls_certificate" "eks" {
  url = module.eks.cluster_oidc_issuer_url
}

resource "aws_iam_openid_connect_provider" "eks" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.eks.certificates[0].sha1_fingerprint]
  url             = module.eks.cluster_oidc_issuer_url
}

# IAM Policy for accessing S3
resource "aws_iam_policy" "s3_access" {
  name        = "${var.cluster_name}-s3-access"
  description = "Policy for accessing SoundScape-AI S3 bucket"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Effect   = "Allow"
        Resource = [
          aws_s3_bucket.storage.arn,
          "${aws_s3_bucket.storage.arn}/*"
        ]
      }
    ]
  })
}

# Outputs
output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "cluster_security_group_id" {
  description = "Security group for the EKS cluster"
  value       = module.eks.cluster_security_group_id
}

output "region" {
  description = "AWS region"
  value       = var.aws_region
}

output "db_hostname" {
  description = "RDS instance hostname"
  value       = module.rds.db_instance_address
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = aws_elasticache_cluster.redis.cache_nodes.0.address
}

output "kafka_bootstrap_brokers" {
  description = "Kafka bootstrap brokers"
  value       = aws_msk_cluster.soundscape.bootstrap_brokers_tls
}

output "cloudfront_domain_name" {
  description = "CloudFront domain name"
  value       = aws_cloudfront_distribution.audio_cdn.domain_name
}

output "mongo_connection_string" {
  description = "MongoDB Atlas connection string (masked)"
  value       = "mongodb+srv://user:password@${mongodbatlas_cluster.soundscape.name}.mongodb.net/soundscape"
  sensitive   = true
}