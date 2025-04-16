# Supabase Integration for SoundScape-AI

This document outlines how Supabase is integrated within the SoundScape-AI backend architecture.

## Overview

SoundScape-AI uses Supabase as its primary database and authentication provider. Supabase offers PostgreSQL database, authentication, storage, and real-time capabilities, which are ideal for our audio streaming platform.

## Configuration

Supabase is configured with the following parameters:

- **Supabase URL**: `https://mxvcweenflmanyknwccr.supabase.co`
- **Anon Public Key**: Used for unauthenticated API access
- **JWT Secret**: Used for custom JWT token verification

These credentials are stored in the `.env` file and accessed through the configuration service.

## Services Using Supabase

### Authentication Service

The Authentication Service uses Supabase Auth for:
- User registration
- Email/password authentication
- Social authentication (Google, etc.)
- Password reset
- Email verification
- Session management

### Database Service

A centralized Database Service provides access to Supabase PostgreSQL across the application:
- CRUD operations for all entities
- Relationship queries
- Raw SQL execution when needed
- Data validation

### Storage Service

The Storage Service uses Supabase Storage for:
- Audio file uploads
- Profile pictures
- Cover art
- Waveform images

### Real-time Features

Supabase's real-time capabilities are used for:
- Live notifications
- Chat features
- Collaborative playlist editing
- Live comment updates

## Database Schema

The PostgreSQL database in Supabase follows the schema defined in `/Backend/database/postgres/init/01-schema.sql`, with tables for:

- Users and authentication
- Audio tracks and metadata
- Playlists
- Comments and likes
- User relationships
- Analytics data

## Row-Level Security (RLS)

Supabase's Row-Level Security policies control data access:

- Public tracks are readable by everyone
- Private tracks are only accessible by their owners
- User profiles can have custom visibility settings
- Only admins can access certain analytics data

## Configuration in Different Environments

Environment-specific Supabase configurations are managed through environment variables:

- Development: Local .env file
- Testing: CI/CD pipeline variables
- Production: Secure environment variable storage

## Migrations and Schema Changes

Database migrations are managed through:
1. SQL migration files
2. Version-controlled schema definitions
3. Migration scripts that use Supabase's administrative APIs

## Best Practices

When working with Supabase in SoundScape-AI:

1. Always use parameterized queries to prevent SQL injection
2. Leverage Supabase's RLS for security instead of application-level checks
3. Use Supabase's built-in functions for common operations
4. Cache frequently accessed data to reduce database load
5. Use transactions for operations that update multiple tables