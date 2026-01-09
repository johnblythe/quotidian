-- Quotidian V1.5 Initial Schema
-- Tables for cross-device sync with Row Level Security

-- ============================================
-- PREFERENCES TABLE
-- Stores user settings and preferences
-- ============================================
CREATE TABLE IF NOT EXISTS preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  notification_time TEXT NOT NULL DEFAULT '08:00', -- HH:MM format
  onboarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  algorithm_enabled_at TIMESTAMPTZ,
  personalization_celebrated BOOLEAN DEFAULT FALSE,
  last_timing_calculation_date TEXT, -- YYYY-MM-DD format
  digest_enabled BOOLEAN DEFAULT FALSE, -- For email digest feature
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id) -- One preferences row per user
);

-- ============================================
-- JOURNAL_ENTRIES TABLE
-- User reflections on quotes
-- ============================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_quote
  ON journal_entries(user_id, quote_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_updated
  ON journal_entries(user_id, updated_at DESC);

-- ============================================
-- FAVORITES TABLE
-- User's saved favorite quotes
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_id TEXT NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, quote_id) -- Prevent duplicate favorites
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_favorites_user
  ON favorites(user_id, saved_at DESC);

-- ============================================
-- QUOTE_HISTORY TABLE
-- Record of quotes shown to user
-- ============================================
CREATE TABLE IF NOT EXISTS quote_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_id TEXT NOT NULL,
  shown_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fresh_pull BOOLEAN NOT NULL DEFAULT FALSE -- true if user requested "another quote"
);

-- Index for efficient lookups and deduplication
CREATE INDEX IF NOT EXISTS idx_quote_history_user_quote
  ON quote_history(user_id, quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_history_shown
  ON quote_history(user_id, shown_at DESC);

-- ============================================
-- SIGNALS TABLE
-- User behavior signals for algorithm learning
-- ============================================
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_id TEXT NOT NULL,
  signal TEXT NOT NULL, -- 'favorite', 'reflected', 'reflected_long', 'viewed', 'another', 'unfavorited'
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  themes TEXT[] NOT NULL DEFAULT '{}' -- Array of theme strings
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_signals_user
  ON signals(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_signals_quote
  ON signals(user_id, quote_id);

-- ============================================
-- ROW LEVEL SECURITY
-- Users can only access their own data
-- ============================================

-- Enable RLS on all tables
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;

-- Preferences policies
CREATE POLICY "Users can view own preferences" ON preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON preferences
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own preferences" ON preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Journal entries policies
CREATE POLICY "Users can view own journal entries" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Quote history policies
CREATE POLICY "Users can view own quote history" ON quote_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quote history" ON quote_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Signals policies
CREATE POLICY "Users can view own signals" ON signals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own signals" ON signals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- Automatically update updated_at column
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_preferences_updated_at
  BEFORE UPDATE ON preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
