-- =============================================
-- HairMatch MVP — Initial Database Schema
-- Supabase PostgreSQL Migration
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
-- Profiles (extends Supabase auth.users)
-- ──────────────────────────────────────────────
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'stylist')) DEFAULT 'user',
    display_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        COALESCE(NEW.raw_user_meta_data->>'display_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ──────────────────────────────────────────────
-- User Questionnaires
-- ──────────────────────────────────────────────
CREATE TABLE user_questionnaires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    hair_length TEXT NOT NULL CHECK (hair_length IN ('short', 'bob', 'medium', 'long', 'very_long')),
    bleach_count INTEGER NOT NULL DEFAULT 0 CHECK (bleach_count >= 0 AND bleach_count <= 10),
    has_black_dye BOOLEAN NOT NULL DEFAULT FALSE,
    has_straightening BOOLEAN NOT NULL DEFAULT FALSE,
    has_perm BOOLEAN NOT NULL DEFAULT FALSE,
    current_hair_color TEXT NOT NULL DEFAULT '',
    damage_level INTEGER NOT NULL DEFAULT 1 CHECK (damage_level >= 1 AND damage_level <= 5),
    additional_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questionnaires_user ON user_questionnaires(user_id);


-- ──────────────────────────────────────────────
-- Desired Styles (uploaded images)
-- ──────────────────────────────────────────────
CREATE TABLE desired_styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    questionnaire_id UUID REFERENCES user_questionnaires(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_desired_styles_user ON desired_styles(user_id);


-- ──────────────────────────────────────────────
-- Stylist Profiles (extension of profiles)
-- ──────────────────────────────────────────────
CREATE TABLE stylist_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    bio TEXT DEFAULT '',
    specialties TEXT[] DEFAULT '{}',
    product_brands TEXT[] DEFAULT '{}',
    years_experience INTEGER DEFAULT 0,
    location TEXT DEFAULT '',
    portfolio_urls TEXT[] DEFAULT '{}',
    rating NUMERIC(2,1) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stylist_profiles_profile ON stylist_profiles(profile_id);
CREATE INDEX idx_stylist_profiles_location ON stylist_profiles(location);


-- ──────────────────────────────────────────────
-- AI Recipes
-- ──────────────────────────────────────────────
CREATE TABLE ai_recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID,  -- FK added after bookings table created
    recipe_text TEXT NOT NULL DEFAULT '',
    recommended_products JSONB DEFAULT '[]',
    procedure_steps JSONB DEFAULT '[]',
    estimated_time_minutes INTEGER DEFAULT 0,
    risk_notes TEXT DEFAULT '',
    disclaimer TEXT DEFAULT 'This AI-generated recipe is for reference only. Final treatment decisions are the responsibility of the stylist.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ──────────────────────────────────────────────
-- Bookings
-- ──────────────────────────────────────────────
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    stylist_id UUID NOT NULL REFERENCES stylist_profiles(id) ON DELETE CASCADE,
    desired_style_id UUID REFERENCES desired_styles(id) ON DELETE SET NULL,
    questionnaire_id UUID REFERENCES user_questionnaires(id) ON DELETE SET NULL,
    ai_recipe_id UUID REFERENCES ai_recipes(id) ON DELETE SET NULL,
    preferred_datetime TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
    message TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK from ai_recipes to bookings
ALTER TABLE ai_recipes ADD CONSTRAINT fk_ai_recipes_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_stylist ON bookings(stylist_id);
CREATE INDEX idx_bookings_status ON bookings(status);


-- ──────────────────────────────────────────────
-- Chat Messages
-- ──────────────────────────────────────────────
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_booking ON chat_messages(booking_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);


-- ──────────────────────────────────────────────
-- Row Level Security Policies
-- ──────────────────────────────────────────────

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Questionnaires
ALTER TABLE user_questionnaires ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own questionnaires" ON user_questionnaires
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own questionnaires" ON user_questionnaires
    FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Stylists can read questionnaires for their bookings
CREATE POLICY "Stylists can read booked questionnaires" ON user_questionnaires
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings b
            JOIN stylist_profiles sp ON b.stylist_id = sp.id
            WHERE b.questionnaire_id = user_questionnaires.id
            AND sp.profile_id = auth.uid()
        )
    );

-- Desired Styles
ALTER TABLE desired_styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own styles" ON desired_styles
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Stylists can read booked styles" ON desired_styles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings b
            JOIN stylist_profiles sp ON b.stylist_id = sp.id
            WHERE b.desired_style_id = desired_styles.id
            AND sp.profile_id = auth.uid()
        )
    );

-- Stylist Profiles
ALTER TABLE stylist_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read stylist profiles" ON stylist_profiles FOR SELECT USING (true);
CREATE POLICY "Stylists can update own profile" ON stylist_profiles
    FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Stylists can insert own profile" ON stylist_profiles
    FOR INSERT WITH CHECK (profile_id = auth.uid());

-- Bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Stylists can read assigned bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stylist_profiles sp
            WHERE sp.id = bookings.stylist_id
            AND sp.profile_id = auth.uid()
        )
    );
CREATE POLICY "Stylists can update assigned bookings" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM stylist_profiles sp
            WHERE sp.id = bookings.stylist_id
            AND sp.profile_id = auth.uid()
        )
    );

-- AI Recipes
ALTER TABLE ai_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Booking participants can read recipes" ON ai_recipes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.ai_recipe_id = ai_recipes.id
            AND (
                b.user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM stylist_profiles sp
                    WHERE sp.id = b.stylist_id AND sp.profile_id = auth.uid()
                )
            )
        )
    );

-- Chat Messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Booking participants can read messages" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.id = chat_messages.booking_id
            AND (
                b.user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM stylist_profiles sp
                    WHERE sp.id = b.stylist_id AND sp.profile_id = auth.uid()
                )
            )
        )
    );
CREATE POLICY "Booking participants can send messages" ON chat_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.id = chat_messages.booking_id
            AND (
                b.user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM stylist_profiles sp
                    WHERE sp.id = b.stylist_id AND sp.profile_id = auth.uid()
                )
            )
        )
    );


-- ──────────────────────────────────────────────
-- Enable Realtime for chat_messages
-- ──────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
