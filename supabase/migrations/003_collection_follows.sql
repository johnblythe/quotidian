-- Quotidian V2.0 Collection Follows Schema
-- Track who follows which collections

-- ============================================
-- COLLECTION_FOLLOWS TABLE
-- Tracks user follows on public collections
-- ============================================
CREATE TABLE IF NOT EXISTS collection_follows (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  followed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, collection_id)
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_collection_follows_collection
  ON collection_follows(collection_id, followed_at DESC);
CREATE INDEX IF NOT EXISTS idx_collection_follows_user
  ON collection_follows(user_id, followed_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE collection_follows ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own follows
CREATE POLICY "Users can view own follows" ON collection_follows
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can view followers of public collections (for follower counts)
CREATE POLICY "Anyone can view follows on public collections" ON collection_follows
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_follows.collection_id
      AND collections.visibility = 'public'
    )
  );

-- Policy: Users can insert their own follows
CREATE POLICY "Users can follow collections" ON collection_follows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own follows (unfollow)
CREATE POLICY "Users can unfollow collections" ON collection_follows
  FOR DELETE USING (auth.uid() = user_id);
