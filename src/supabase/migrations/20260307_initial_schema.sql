-- Discovery Loop Coach - Initial Database Schema
-- Migration: 20260307_initial_schema
-- Description: Complete database schema for Discovery Loop Coach MVP

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- Extends Clerk authentication with app-specific user data
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL, -- Clerk user ID (external auth)
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  github_access_token TEXT, -- Encrypted GitHub OAuth token
  linear_access_token TEXT, -- Encrypted Linear OAuth token
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'team')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

-- Indexes for users table
CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);

-- Updated_at trigger for users
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SPECIFICATIONS TABLE
-- ============================================================================
-- Core entity: product specifications created through discovery dialogue
CREATE TABLE specifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  requirements_json JSONB, -- Structured requirements from AI
  acceptance_tests_json JSONB, -- BDD acceptance tests in JSON format
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'complete', 'archived')),
  linked_github_pr TEXT, -- GitHub PR URL
  linked_linear_issue TEXT, -- Linear issue ID/URL
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- Indexes for specifications table
CREATE INDEX idx_specifications_user_id ON specifications(user_id);
CREATE INDEX idx_specifications_status ON specifications(status);
CREATE INDEX idx_specifications_created_at ON specifications(created_at DESC);
CREATE INDEX idx_specifications_user_status ON specifications(user_id, status);

-- Full-text search on title and description
CREATE INDEX idx_specifications_search ON specifications USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Updated_at trigger for specifications
CREATE TRIGGER update_specifications_updated_at BEFORE UPDATE ON specifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DIALOGUE_TURNS TABLE
-- ============================================================================
-- Stores the Q&A dialogue between user and AI personas during discovery
CREATE TABLE dialogue_turns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spec_id UUID NOT NULL REFERENCES specifications(id) ON DELETE CASCADE,
  persona_type TEXT NOT NULL CHECK (persona_type IN ('product_coach', 'security_expert', 'ux_analyst', 'domain_expert')),
  question TEXT NOT NULL, -- User's question/response
  answer TEXT NOT NULL, -- AI persona's response
  turn_order INTEGER NOT NULL, -- Order in the dialogue (1, 2, 3, ...)
  tokens_used INTEGER, -- AI tokens consumed for this turn
  latency_ms INTEGER, -- Response time in milliseconds
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for dialogue_turns table
CREATE INDEX idx_dialogue_turns_spec_id ON dialogue_turns(spec_id);
CREATE INDEX idx_dialogue_turns_spec_order ON dialogue_turns(spec_id, turn_order);
CREATE INDEX idx_dialogue_turns_persona_type ON dialogue_turns(persona_type);
CREATE INDEX idx_dialogue_turns_created_at ON dialogue_turns(created_at DESC);

-- Unique constraint: prevent duplicate turn orders per spec
CREATE UNIQUE INDEX idx_dialogue_turns_spec_turn_order ON dialogue_turns(spec_id, turn_order);

-- ============================================================================
-- PROMPT_TEMPLATES TABLE
-- ============================================================================
-- Manages AI persona prompts for A/B testing and versioning
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  persona_type TEXT NOT NULL CHECK (persona_type IN ('product_coach', 'security_expert', 'ux_analyst', 'domain_expert')),
  version TEXT NOT NULL, -- Semantic version (e.g., "1.0", "1.1")
  system_prompt TEXT NOT NULL, -- Full system prompt for the persona
  is_active BOOLEAN NOT NULL DEFAULT false, -- Only one version per persona can be active
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for prompt_templates table
CREATE INDEX idx_prompt_templates_persona_type ON prompt_templates(persona_type);
CREATE INDEX idx_prompt_templates_is_active ON prompt_templates(is_active);
CREATE INDEX idx_prompt_templates_persona_active ON prompt_templates(persona_type, is_active) WHERE is_active = true;

-- Unique constraint: only one active version per persona
CREATE UNIQUE INDEX idx_prompt_templates_active_persona ON prompt_templates(persona_type) WHERE is_active = true;

-- Updated_at trigger for prompt_templates
CREATE TRIGGER update_prompt_templates_updated_at BEFORE UPDATE ON prompt_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SPEC_ANALYTICS TABLE
-- ============================================================================
-- Analytics data for each completed specification
CREATE TABLE spec_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spec_id UUID NOT NULL REFERENCES specifications(id) ON DELETE CASCADE,
  time_to_complete_sec INTEGER, -- Total time from start to completion
  dialogue_turns INTEGER NOT NULL, -- Number of dialogue turns
  ai_tokens_used INTEGER NOT NULL, -- Total AI tokens consumed
  user_satisfaction_score INTEGER CHECK (user_satisfaction_score BETWEEN 1 AND 5), -- 1-5 rating
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for spec_analytics table
CREATE INDEX idx_spec_analytics_spec_id ON spec_analytics(spec_id);
CREATE INDEX idx_spec_analytics_created_at ON spec_analytics(created_at DESC);

-- Unique constraint: one analytics record per spec
CREATE UNIQUE INDEX idx_spec_analytics_spec_id_unique ON spec_analytics(spec_id);

-- ============================================================================
-- USER_RATE_LIMITS TABLE
-- ============================================================================
-- Tracks API rate limits per user per endpoint
CREATE TABLE user_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL, -- API endpoint (e.g., "/api/discovery")
  request_count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for user_rate_limits table
CREATE INDEX idx_user_rate_limits_user_endpoint ON user_rate_limits(user_id, endpoint);
CREATE INDEX idx_user_rate_limits_window_start ON user_rate_limits(window_start);

-- Unique constraint: one rate limit record per user per endpoint
CREATE UNIQUE INDEX idx_user_rate_limits_user_endpoint_unique ON user_rate_limits(user_id, endpoint);

-- Updated_at trigger for user_rate_limits
CREATE TRIGGER update_user_rate_limits_updated_at BEFORE UPDATE ON user_rate_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialogue_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE spec_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rate_limits ENABLE ROW LEVEL SECURITY;

-- Users: Can only read/update their own record
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Specifications: Users can CRUD their own specs
CREATE POLICY specifications_select_own ON specifications
  FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY specifications_insert_own ON specifications
  FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY specifications_update_own ON specifications
  FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY specifications_delete_own ON specifications
  FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

-- Dialogue turns: Users can CRUD turns for their own specs
CREATE POLICY dialogue_turns_select_own ON dialogue_turns
  FOR SELECT
  USING (spec_id IN (
    SELECT id FROM specifications WHERE user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  ));

CREATE POLICY dialogue_turns_insert_own ON dialogue_turns
  FOR INSERT
  WITH CHECK (spec_id IN (
    SELECT id FROM specifications WHERE user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  ));

CREATE POLICY dialogue_turns_update_own ON dialogue_turns
  FOR UPDATE
  USING (spec_id IN (
    SELECT id FROM specifications WHERE user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  ));

CREATE POLICY dialogue_turns_delete_own ON dialogue_turns
  FOR DELETE
  USING (spec_id IN (
    SELECT id FROM specifications WHERE user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  ));

-- Prompt templates: Everyone can read active templates (for AI personas)
CREATE POLICY prompt_templates_select_active ON prompt_templates
  FOR SELECT
  USING (is_active = true);

-- Spec analytics: Users can read/insert analytics for their own specs
CREATE POLICY spec_analytics_select_own ON spec_analytics
  FOR SELECT
  USING (spec_id IN (
    SELECT id FROM specifications WHERE user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  ));

CREATE POLICY spec_analytics_insert_own ON spec_analytics
  FOR INSERT
  WITH CHECK (spec_id IN (
    SELECT id FROM specifications WHERE user_id IN (
      SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  ));

-- User rate limits: Users can read/update their own rate limits
CREATE POLICY user_rate_limits_select_own ON user_rate_limits
  FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY user_rate_limits_update_own ON user_rate_limits
  FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY user_rate_limits_insert_own ON user_rate_limits
  FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get or create user from Clerk ID
CREATE OR REPLACE FUNCTION get_or_create_user(
  p_clerk_user_id TEXT,
  p_email TEXT,
  p_name TEXT
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Try to find existing user
  SELECT id INTO v_user_id FROM users WHERE clerk_user_id = p_clerk_user_id;

  -- If not found, create new user
  IF v_user_id IS NULL THEN
    INSERT INTO users (clerk_user_id, email, name)
    VALUES (p_clerk_user_id, p_email, p_name)
    RETURNING id INTO v_user_id;
  END IF;

  -- Update last active timestamp
  UPDATE users SET last_active_at = NOW() WHERE id = v_user_id;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active prompt template for a persona
CREATE OR REPLACE FUNCTION get_active_prompt(p_persona_type TEXT)
RETURNS TEXT AS $$
DECLARE
  v_prompt TEXT;
BEGIN
  SELECT system_prompt INTO v_prompt
  FROM prompt_templates
  WHERE persona_type = p_persona_type AND is_active = true;

  RETURN v_prompt;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default prompt templates (initially all inactive - will be activated after testing)
INSERT INTO prompt_templates (persona_type, version, system_prompt, is_active) VALUES
(
  'product_coach',
  '1.0',
  'You are the Discovery Loop Coach — Product Coach persona. Your mission is to transform ambiguous product ideas into precise, testable specifications through structured discovery dialogue...',
  false
),
(
  'security_expert',
  '1.0',
  'You are the Security Expert persona for Discovery Loop Coach. Your role is to identify security risks, vulnerabilities, and compliance requirements for product specifications...',
  false
),
(
  'ux_analyst',
  '1.0',
  'You are the UX Analyst persona for Discovery Loop Coach. Your role is to ensure specifications consider user experience, accessibility, and usability best practices...',
  false
),
(
  'domain_expert',
  '1.0',
  'You are the Domain Expert persona for Discovery Loop Coach. Your role is to provide domain-specific knowledge and industry best practices relevant to the product specification...',
  false
);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Schema version: 1.0
-- Tables created: 6 (users, specifications, dialogue_turns, prompt_templates, spec_analytics, user_rate_limits)
-- RLS enabled: Yes
-- Indexes created: 23
-- Functions created: 3 (update_updated_at_column, get_or_create_user, get_active_prompt)
