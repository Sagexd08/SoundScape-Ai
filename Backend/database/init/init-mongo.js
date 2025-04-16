// MongoDB initialization script

// Create databases if they don't exist
db = db.getSiblingDB('soundscape-auth');
db = db.getSiblingDB('soundscape-users');
db = db.getSiblingDB('soundscape-storage');
db = db.getSiblingDB('soundscape-recommendations');
db = db.getSiblingDB('soundscape-analytics');

// Create users collection and indexes in the users database
db = db.getSiblingDB('soundscape-users');
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

// Create profiles collection
db.createCollection('profiles');
db.profiles.createIndex({ userId: 1 }, { unique: true });

// Create audio collection in the storage database
db = db.getSiblingDB('soundscape-storage');
db.createCollection('audio_files');
db.audio_files.createIndex({ userId: 1 });
db.audio_files.createIndex({ createdAt: 1 });
db.audio_files.createIndex({ tags: 1 });

// Create playlists collection
db.createCollection('playlists');
db.playlists.createIndex({ userId: 1 });
db.playlists.createIndex({ isPublic: 1 });

// Create user_preferences collection for recommendations
db = db.getSiblingDB('soundscape-recommendations');
db.createCollection('user_preferences');
db.user_preferences.createIndex({ userId: 1 }, { unique: true });

// Create audio_features collection for recommendations
db.createCollection('audio_features');
db.audio_features.createIndex({ audioId: 1 }, { unique: true });

// Create analytics collections
db = db.getSiblingDB('soundscape-analytics');
db.createCollection('user_activity');
db.user_activity.createIndex({ userId: 1 });
db.user_activity.createIndex({ timestamp: 1 });
db.user_activity.createIndex({ action: 1 });

// Create metrics collection for aggregated statistics
db.createCollection('metrics');
db.metrics.createIndex({ metricName: 1, date: 1 }, { unique: true });

print('MongoDB initialization completed successfully');