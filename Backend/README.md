# SoundScape-AI Backend

This advanced backend architecture for SoundScape-AI is designed with scalability, performance, and maintainability in mind. It follows a microservice architecture pattern to allow for independent scaling and development of different components.

## Architecture Overview

```
├── api-gateway          # API Gateway service for routing requests
├── auth-service         # Authentication and authorization service
├── user-service         # User management and profiles
├── audio-processor      # Real-time audio processing and analysis
├── storage-service      # Audio file storage and management
├── recommendation-engine # ML-based audio recommendation system
├── analytics-service    # Usage and performance analytics
├── notification-service # User notifications (email, push, etc.)
├── database             # Database migrations and schemas
│   ├── postgres         # Relational data (users, metadata)
│   └── mongodb          # Audio feature data and unstructured data
└── infrastructure       # Kubernetes, Docker, and deployment configs
```

## Key Features

- **Microservices Architecture**: Independent services communicating via REST and gRPC
- **Real-time Audio Processing**: FFT analysis, feature extraction, and audio fingerprinting
- **Advanced Authentication**: JWT with refresh tokens, OAuth, and role-based permissions
- **Scalable Data Storage**: PostgreSQL for structured data, MongoDB for audio features and metadata
- **Redis Cache**: For session management and frequently accessed data
- **Message Queue**: RabbitMQ/Kafka for asynchronous processing of audio files
- **WebSocket Support**: For real-time updates and notifications
- **Machine Learning Integration**: Audio classification, recommendation engine
- **Comprehensive Logging & Monitoring**: ELK stack (Elasticsearch, Logstash, Kibana)
- **Infrastructure as Code**: Terraform configurations for cloud deployment
- **CI/CD Pipeline**: Automated testing and deployment with GitHub Actions
- **Containerization**: Docker and Kubernetes for deployment and scaling

## Getting Started

### Prerequisites

1. Install [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose
2. Install [Node.js](https://nodejs.org/) (v16 or later) and npm
3. Install [Python](https://www.python.org/downloads/) (v3.9 or later) and pip

### Building and Deploying

#### Option 1: Using the deployment scripts

**Windows:**
```powershell
.\deploy.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Option 2: Manual deployment

1. Navigate to the Backend directory
2. Build and start the Docker containers:
   ```bash
   docker-compose build
   docker-compose up -d
   ```
3. Access the API Gateway at `http://localhost:8000`
4. Access the API documentation at `http://localhost:8000/api/docs`

### Stopping the Services

```bash
docker-compose down
```

### Viewing Logs

```bash
docker-compose logs -f
```

To view logs for a specific service:
```bash
docker-compose logs -f [service-name]
```
Example: `docker-compose logs -f api-gateway`

## Development Workflow

This project follows a trunk-based development approach with feature flags for new features. All services use a common CI/CD pipeline defined in the infrastructure directory.

## Supabase Deployment Guide

SoundScape-AI can be deployed using Supabase for database, authentication, and storage services, providing a simpler alternative to the full microservices architecture.

### Prerequisites for Supabase Deployment

1. Node.js (v14+)
2. npm or yarn
3. A Supabase account and project (https://supabase.com)

### Supabase Setup

#### 1. Environment Variables

Create a `.env` file in the `/Backend` directory with your Supabase credentials:

```
# Supabase Credentials
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_API_KEY=your-supabase-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Grok API key (if using Grok AI features)
SOUNDSCAPE_GROK_API_KEY=your-grok-api-key
```

For the frontend, create another `.env.local` file in the `/Frontend` directory:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### 2. Install Dependencies

In the Backend directory:

```bash
cd Backend
npm install
```

#### 3. Deploy Supabase Resources

Run the deployment script to set up your Supabase project:

```bash
cd Backend
node scripts/deploy-supabase.js
```

This script will:
- Create storage buckets for audio files, waveforms, and profile images
- Create database tables
- Set up Row Level Security (RLS) policies
- Create database functions and triggers

#### 4. Test the Supabase Connection

To verify your Supabase setup is working correctly:

```bash
cd Backend
node scripts/test-supabase.js
```

### Using Supabase in the Backend

#### Storage

The audio processor service uses Supabase for storing audio files and waveform images:

```javascript
const { supabase } = require('../config/supabase');

// Upload an audio file
const { data, error } = await supabase.storage
  .from('audio-files')
  .upload(`public/${filename}`, fileBuffer, {
    contentType: 'audio/mpeg',
    cacheControl: '3600'
  });

// Create a signed URL for access
const { signedURL } = await supabase.storage
  .from('audio-files')
  .createSignedUrl(`public/${filename}`, 3600);
```

#### Database

Database operations are performed using the Supabase client:

```javascript
const { supabase } = require('../config/supabase');

// Query users table
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);

// Insert new audio metadata
const { data, error } = await supabase
  .from('audio_files')
  .insert([
    {
      title: 'My Recording',
      user_id: userId,
      duration: 120,
      file_path: filePath,
      is_public: true
    }
  ]);
```

### Using Supabase in the Frontend

#### Authentication

```typescript
import { supabase } from "@/lib/supabase";

// Sign in with email/password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign out
await supabase.auth.signOut();
```

#### Database Queries

```typescript
import { supabase } from "@/lib/supabase";

// Get all audio files for the current user
const { data, error } = await supabase
  .from('audio_files')
  .select('*')
  .eq('user_id', userId);
```

### Security Considerations

1. **API Keys**: Never expose service role keys in the frontend code
2. **Row Level Security**: All tables are protected with RLS policies
3. **JWT**: Server-side token generation for secure operations
4. **Environment Variables**: Store sensitive credentials in environment variables

### Troubleshooting Supabase Deployment

#### Common Issues

1. **"Cannot insert null value into column"**
   - Check that your data includes all required fields

2. **"Permission denied" errors**
   - RLS policies might be blocking access. Check you're authenticated and have permission to access the resource.

3. **Storage bucket not found**
   - Ensure you've run the deployment script to create all required buckets.

#### Support

If you encounter issues, run the test script to diagnose the problem:

```bash
node scripts/test-supabase.js
```

For more information, refer to the [Supabase documentation](https://supabase.com/docs).
