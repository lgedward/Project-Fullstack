-- Do not delete this table
DROP TABLE IF EXISTS member CASCADE;
CREATE TABLE member(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb);

-- Your schema DDL (create table statements etc.) goes below here 
-- Creating the friend table to manage friend requests and relationships
DROP TABLE IF EXISTS friend CASCADE;
CREATE TABLE friend (
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    status VARCHAR(10) CHECK (status IN ('accepted', 'rejected', 'pending')) DEFAULT 'pending'
);

-- Creating the post table for storing user posts
DROP TABLE IF EXISTS post CASCADE;
CREATE TABLE post (
    user_id UUID NOT NULL,
    content JSONB,
    posted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);