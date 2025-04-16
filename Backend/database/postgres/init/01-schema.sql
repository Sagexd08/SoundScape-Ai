-- PostgreSQL Schema for SoundScape-AI
-- This handles relational data like users, relationships, and metadata

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255),
    name VARCHAR(100),
    auth_provider VARCHAR(20) DEFAULT 'local',
    provider_id VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Create user profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    bio TEXT,
    profile_picture_url VARCHAR(255),
    header_image_url VARCHAR(255),
    location VARCHAR(100),
    website VARCHAR(255),
    twitter VARCHAR(255),
    instagram VARCHAR(255),
    soundcloud VARCHAR(255),
    spotify VARCHAR(255),
    youtube VARCHAR(255),
    theme VARCHAR(20) DEFAULT 'auto',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Create refresh tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- Create user privacy settings table
CREATE TABLE user_privacy_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_visibility VARCHAR(20) DEFAULT 'public',
    activity_visibility VARCHAR(20) DEFAULT 'public',
    allow_messages_from VARCHAR(20) DEFAULT 'everyone',
    show_listening_activity BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_privacy_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_user_privacy_settings_user_id ON user_privacy_settings(user_id);

-- Create followers relationship table
CREATE TABLE user_followers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_followed FOREIGN KEY (followed_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_follower_relationship UNIQUE (follower_id, followed_id)
);

CREATE INDEX idx_user_followers_follower_id ON user_followers(follower_id);
CREATE INDEX idx_user_followers_followed_id ON user_followers(followed_id);

-- Create audio tracks table
CREATE TABLE audio_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    waveform_url VARCHAR(255),
    cover_art_url VARCHAR(255),
    file_format VARCHAR(10) NOT NULL,
    file_size INTEGER NOT NULL,
    sample_rate INTEGER,
    bit_depth INTEGER,
    channels INTEGER,
    visibility VARCHAR(20) DEFAULT 'public',
    allow_downloads BOOLEAN DEFAULT TRUE,
    is_original BOOLEAN DEFAULT TRUE,
    license VARCHAR(50) DEFAULT 'all-rights-reserved',
    bpm FLOAT,
    key VARCHAR(10),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_audio_track_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_audio_tracks_user_id ON audio_tracks(user_id);
CREATE INDEX idx_audio_tracks_visibility ON audio_tracks(visibility);
CREATE INDEX idx_audio_tracks_created_at ON audio_tracks(created_at);

-- Create audio track tags table
CREATE TABLE audio_track_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID NOT NULL REFERENCES audio_tracks(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    CONSTRAINT fk_track_tag FOREIGN KEY (track_id) REFERENCES audio_tracks(id) ON DELETE CASCADE
);

CREATE INDEX idx_audio_track_tags_track_id ON audio_track_tags(track_id);
CREATE INDEX idx_audio_track_tags_tag ON audio_track_tags(tag);

-- Create genres table
CREATE TABLE genres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES genres(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_genres_name ON genres(name);
CREATE INDEX idx_genres_parent_id ON genres(parent_id);

-- Create audio track genres table
CREATE TABLE audio_track_genres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID NOT NULL REFERENCES audio_tracks(id) ON DELETE CASCADE,
    genre_id UUID NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    CONSTRAINT fk_track_genre_track FOREIGN KEY (track_id) REFERENCES audio_tracks(id) ON DELETE CASCADE,
    CONSTRAINT fk_track_genre_genre FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE,
    CONSTRAINT unique_track_genre UNIQUE (track_id, genre_id)
);

CREATE INDEX idx_audio_track_genres_track_id ON audio_track_genres(track_id);
CREATE INDEX idx_audio_track_genres_genre_id ON audio_track_genres(genre_id);

-- Create playlists table
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_art_url VARCHAR(255),
    visibility VARCHAR(20) DEFAULT 'public',
    is_collaborative BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_playlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlists_visibility ON playlists(visibility);

-- Create playlist tracks table
CREATE TABLE playlist_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES audio_tracks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_at TIMESTAMP NOT NULL DEFAULT NOW(),
    added_by UUID REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_playlist_track_playlist FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    CONSTRAINT fk_playlist_track_track FOREIGN KEY (track_id) REFERENCES audio_tracks(id) ON DELETE CASCADE,
    CONSTRAINT unique_track_in_playlist UNIQUE (playlist_id, track_id)
);

CREATE INDEX idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX idx_playlist_tracks_track_id ON playlist_tracks(track_id);

-- Create playlist followers table
CREATE TABLE playlist_followers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_playlist_follower_playlist FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    CONSTRAINT fk_playlist_follower_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_playlist_follower UNIQUE (playlist_id, user_id)
);

CREATE INDEX idx_playlist_followers_playlist_id ON playlist_followers(playlist_id);
CREATE INDEX idx_playlist_followers_user_id ON playlist_followers(user_id);

-- Create comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES audio_tracks(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    timestamp_seconds FLOAT,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_track FOREIGN KEY (track_id) REFERENCES audio_tracks(id) ON DELETE CASCADE
);

CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_track_id ON comments(track_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);

-- Create likes table
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL,
    entity_type VARCHAR(20) NOT NULL, -- 'track', 'playlist', 'comment'
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_like UNIQUE (user_id, entity_id, entity_type)
);

CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_entity ON likes(entity_id, entity_type);

-- Create user listening history table
CREATE TABLE user_listening_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES audio_tracks(id) ON DELETE CASCADE,
    listened_at TIMESTAMP NOT NULL DEFAULT NOW(),
    duration_seconds INTEGER,
    completion_percentage FLOAT,
    source VARCHAR(50), -- 'search', 'profile', 'playlist', 'recommendation'
    CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_track FOREIGN KEY (track_id) REFERENCES audio_tracks(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_listening_history_user_id ON user_listening_history(user_id);
CREATE INDEX idx_user_listening_history_track_id ON user_listening_history(track_id);
CREATE INDEX idx_user_listening_history_listened_at ON user_listening_history(listened_at);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Create audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_user_profile_modtime
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_user_privacy_settings_modtime
    BEFORE UPDATE ON user_privacy_settings
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_audio_tracks_modtime
    BEFORE UPDATE ON audio_tracks
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_playlists_modtime
    BEFORE UPDATE ON playlists
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_comments_modtime
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();