-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create weeks table
CREATE TABLE weeks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    theme TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cakes table
CREATE TABLE cakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, week_id) -- Ensure one cake per user per week
);

-- Create ratings table
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cake_id UUID REFERENCES cakes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    appearance INTEGER CHECK (appearance BETWEEN 1 AND 5),
    taste INTEGER CHECK (taste BETWEEN 1 AND 5),
    theme_adherence INTEGER CHECK (theme_adherence BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cake_id, user_id) -- Ensure one rating per user per cake
);

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users"
    ON users FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Weeks policies
CREATE POLICY "Users can view all weeks"
    ON weeks FOR SELECT
    USING (true);

CREATE POLICY "Only admins can create/update weeks"
    ON weeks FOR ALL
    USING (auth.uid() IN (
        SELECT id FROM users WHERE email LIKE '%@admin.com'
    ));

-- Cakes policies
CREATE POLICY "Users can view all cakes"
    ON cakes FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own cakes"
    ON cakes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cakes"
    ON cakes FOR UPDATE
    USING (auth.uid() = user_id);

-- Ratings policies
CREATE POLICY "Users can view all ratings"
    ON ratings FOR SELECT
    USING (true);

CREATE POLICY "Users can create ratings for others' cakes"
    ON ratings FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        auth.uid() != (SELECT user_id FROM cakes WHERE id = cake_id)
    );

CREATE POLICY "Users can update their own ratings"
    ON ratings FOR UPDATE
    USING (auth.uid() = user_id); 