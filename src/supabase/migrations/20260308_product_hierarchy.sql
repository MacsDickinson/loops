-- Discovery Loop Coach - Product Hierarchy Schema
-- Migration: 20260308_product_hierarchy
-- Description: Greenfield schema with full product hierarchy
--   Workspace > Product > Idea/Feature, graduation, specification changelog,
--   discovery sessions, workspace-scoped RLS.
--
-- This REPLACES the initial schema (no production data to preserve).

-- ============================================================================
-- DROP EXISTING OBJECTS (clean slate)
-- ============================================================================
DROP TRIGGER IF EXISTS update_user_rate_limits_updated_at ON user_rate_limits;
DROP TRIGGER IF EXISTS update_prompt_templates_updated_at ON prompt_templates;
DROP TRIGGER IF EXISTS update_specifications_updated_at ON specifications;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

DROP FUNCTION IF EXISTS get_active_prompt(TEXT);
DROP FUNCTION IF EXISTS get_or_create_user(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS update_updated_at_column();

DROP TABLE IF EXISTS user_rate_limits CASCADE;
DROP TABLE IF EXISTS spec_analytics CASCADE;
DROP TABLE IF EXISTS dialogue_turns CASCADE;
DROP TABLE IF EXISTS prompt_templates CASCADE;
DROP TABLE IF EXISTS specifications CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SHARED TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  github_access_token TEXT,
  linear_access_token TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'pro', 'team')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX idx_users_email ON users(email);

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- WORKSPACES TABLE
-- ============================================================================
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  subscription_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'pro', 'team')),
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workspaces_owner ON workspaces(owner_user_id);

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MEMBERSHIPS TABLE
-- ============================================================================
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by UUID REFERENCES users(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, user_id)
);

CREATE INDEX idx_memberships_workspace ON memberships(workspace_id);
CREATE INDEX idx_memberships_user ON memberships(user_id);

-- Prevent removing or changing the workspace owner's membership
CREATE OR REPLACE FUNCTION protect_workspace_owner()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role = 'owner' THEN
    IF TG_OP = 'DELETE' THEN
      RAISE EXCEPTION 'Cannot remove workspace owner membership';
    END IF;
    IF TG_OP = 'UPDATE' AND NEW.role <> 'owner' THEN
      RAISE EXCEPTION 'Cannot change workspace owner role';
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_workspace_owner_trigger
  BEFORE UPDATE OR DELETE ON memberships
  FOR EACH ROW EXECUTE FUNCTION protect_workspace_owner();

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  lifecycle_stage TEXT NOT NULL DEFAULT 'idea'
    CHECK (lifecycle_stage IN ('idea', 'pilot', 'incubating', 'graduating', 'growth', 'sunset')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_workspace ON products(workspace_id);
CREATE INDEX idx_products_workspace_stage ON products(workspace_id, lifecycle_stage);

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- IDEAS TABLE
-- ============================================================================
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_by UUID NOT NULL REFERENCES users(id),
  graduated_feature_id UUID, -- FK added after features table is created
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ideas_workspace ON ideas(workspace_id);
CREATE INDEX idx_ideas_workspace_inbox ON ideas(workspace_id) WHERE product_id IS NULL;
CREATE INDEX idx_ideas_product ON ideas(product_id) WHERE product_id IS NOT NULL;

CREATE TRIGGER update_ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FEATURES TABLE
-- ============================================================================
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  lifecycle_stage TEXT NOT NULL DEFAULT 'pilot'
    CHECK (lifecycle_stage IN ('pilot', 'incubating', 'graduating', 'growth', 'sunset')),
  source_idea_id UUID REFERENCES ideas(id),
  parent_feature_id UUID REFERENCES features(id),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_features_workspace ON features(workspace_id);
CREATE INDEX idx_features_workspace_product_stage ON features(workspace_id, product_id, lifecycle_stage);
CREATE INDEX idx_features_product ON features(product_id);

CREATE TRIGGER update_features_updated_at
  BEFORE UPDATE ON features
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add the FK from ideas.graduated_feature_id -> features.id
ALTER TABLE ideas
  ADD CONSTRAINT fk_ideas_graduated_feature
  FOREIGN KEY (graduated_feature_id) REFERENCES features(id);

-- ============================================================================
-- SPECIFICATIONS TABLE
-- ============================================================================
CREATE TABLE specifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE SET NULL,
  feature_id UUID REFERENCES features(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  requirements_json JSONB NOT NULL DEFAULT '[]',
  acceptance_tests_json JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'complete', 'archived')),
  linked_github_pr TEXT,
  linked_linear_issue TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT spec_must_have_owner CHECK (idea_id IS NOT NULL OR feature_id IS NOT NULL)
);

CREATE INDEX idx_specifications_workspace ON specifications(workspace_id);
CREATE INDEX idx_specifications_idea ON specifications(idea_id) WHERE idea_id IS NOT NULL;
CREATE INDEX idx_specifications_feature ON specifications(feature_id) WHERE feature_id IS NOT NULL;
CREATE INDEX idx_specifications_status ON specifications(workspace_id, status);
CREATE INDEX idx_specifications_search ON specifications
  USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

CREATE TRIGGER update_specifications_updated_at
  BEFORE UPDATE ON specifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SPECIFICATION_CHANGES TABLE (append-only changelog)
-- ============================================================================
CREATE TABLE specification_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  specification_id UUID NOT NULL REFERENCES specifications(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('ai_generated', 'manual')),
  field_changed TEXT NOT NULL,
  previous_value JSONB,
  new_value JSONB NOT NULL,
  session_id UUID, -- FK added after discovery_sessions table
  dialogue_turn_id UUID, -- FK added after dialogue_turns table
  changed_by UUID NOT NULL REFERENCES users(id),
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_spec_changes_spec ON specification_changes(specification_id, created_at DESC);

-- ============================================================================
-- DISCOVERY_SESSIONS TABLE
-- ============================================================================
CREATE TABLE discovery_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  specification_id UUID NOT NULL REFERENCES specifications(id) ON DELETE CASCADE,
  started_by UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  personas_used TEXT[] NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_sessions_spec ON discovery_sessions(specification_id);
CREATE INDEX idx_sessions_status ON discovery_sessions(status) WHERE status = 'active';

-- Add FK from specification_changes.session_id -> discovery_sessions.id
ALTER TABLE specification_changes
  ADD CONSTRAINT fk_spec_changes_session
  FOREIGN KEY (session_id) REFERENCES discovery_sessions(id);

-- ============================================================================
-- DIALOGUE_TURNS TABLE (re-parented to session)
-- ============================================================================
CREATE TABLE dialogue_turns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES discovery_sessions(id) ON DELETE CASCADE,
  persona_type TEXT NOT NULL
    CHECK (persona_type IN ('product_coach', 'security_expert', 'ux_analyst', 'domain_expert')),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  turn_order INTEGER NOT NULL,
  tokens_used INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, turn_order)
);

CREATE INDEX idx_dialogue_turns_session_order ON dialogue_turns(session_id, turn_order);

-- Add FK from specification_changes.dialogue_turn_id -> dialogue_turns.id
ALTER TABLE specification_changes
  ADD CONSTRAINT fk_spec_changes_turn
  FOREIGN KEY (dialogue_turn_id) REFERENCES dialogue_turns(id);

-- ============================================================================
-- PROMPT_TEMPLATES TABLE (unchanged structure)
-- ============================================================================
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  persona_type TEXT NOT NULL
    CHECK (persona_type IN ('product_coach', 'security_expert', 'ux_analyst', 'domain_expert')),
  version TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_prompt_templates_active_persona
  ON prompt_templates(persona_type) WHERE is_active = true;

CREATE TRIGGER update_prompt_templates_updated_at
  BEFORE UPDATE ON prompt_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SPEC_ANALYTICS TABLE (extended with workspace_id)
-- ============================================================================
CREATE TABLE spec_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spec_id UUID NOT NULL REFERENCES specifications(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  time_to_complete_sec INTEGER,
  dialogue_turns INTEGER NOT NULL DEFAULT 0,
  ai_tokens_used INTEGER NOT NULL DEFAULT 0,
  user_satisfaction_score INTEGER CHECK (user_satisfaction_score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_spec_analytics_spec_unique ON spec_analytics(spec_id);
CREATE INDEX idx_spec_analytics_workspace ON spec_analytics(workspace_id);

-- ============================================================================
-- USER_RATE_LIMITS TABLE (extended with workspace_id)
-- ============================================================================
CREATE TABLE user_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_user_rate_limits_user_endpoint
  ON user_rate_limits(user_id, endpoint);

CREATE TRIGGER update_user_rate_limits_updated_at
  BEFORE UPDATE ON user_rate_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE specification_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialogue_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE spec_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rate_limits ENABLE ROW LEVEL SECURITY;

-- Helper: get all workspace IDs for a clerk user
CREATE OR REPLACE FUNCTION get_user_workspace_ids(p_clerk_user_id TEXT)
RETURNS UUID[] AS $$
  SELECT COALESCE(array_agg(m.workspace_id), '{}')
  FROM memberships m
  JOIN users u ON u.id = m.user_id
  WHERE u.clerk_user_id = p_clerk_user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check workspace role
CREATE OR REPLACE FUNCTION has_workspace_role(
  p_clerk_user_id TEXT,
  p_workspace_id UUID,
  p_roles TEXT[]
)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM memberships m
    JOIN users u ON u.id = m.user_id
    WHERE u.clerk_user_id = p_clerk_user_id
      AND m.workspace_id = p_workspace_id
      AND m.role = ANY(p_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Users: own record only
CREATE POLICY users_select_own ON users
  FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');
CREATE POLICY users_update_own ON users
  FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Workspaces: workspace members can read
CREATE POLICY workspaces_select ON workspaces
  FOR SELECT USING (id = ANY(get_user_workspace_ids(auth.jwt() ->> 'sub')));
CREATE POLICY workspaces_update ON workspaces
  FOR UPDATE USING (
    has_workspace_role(auth.jwt() ->> 'sub', id, ARRAY['owner', 'admin'])
  );

-- Memberships: workspace members can read
CREATE POLICY memberships_select ON memberships
  FOR SELECT USING (workspace_id = ANY(get_user_workspace_ids(auth.jwt() ->> 'sub')));
CREATE POLICY memberships_insert ON memberships
  FOR INSERT WITH CHECK (
    has_workspace_role(auth.jwt() ->> 'sub', workspace_id, ARRAY['owner', 'admin'])
  );
CREATE POLICY memberships_update ON memberships
  FOR UPDATE USING (
    has_workspace_role(auth.jwt() ->> 'sub', workspace_id, ARRAY['owner', 'admin'])
  );
CREATE POLICY memberships_delete ON memberships
  FOR DELETE USING (
    has_workspace_role(auth.jwt() ->> 'sub', workspace_id, ARRAY['owner'])
  );

-- Products: workspace-scoped
CREATE POLICY products_select ON products
  FOR SELECT USING (workspace_id = ANY(get_user_workspace_ids(auth.jwt() ->> 'sub')));
CREATE POLICY products_insert ON products
  FOR INSERT WITH CHECK (
    has_workspace_role(auth.jwt() ->> 'sub', workspace_id, ARRAY['owner', 'admin', 'member'])
  );
CREATE POLICY products_update ON products
  FOR UPDATE USING (
    has_workspace_role(auth.jwt() ->> 'sub', workspace_id, ARRAY['owner', 'admin', 'member'])
  );

-- Ideas: workspace-scoped
CREATE POLICY ideas_select ON ideas
  FOR SELECT USING (workspace_id = ANY(get_user_workspace_ids(auth.jwt() ->> 'sub')));
CREATE POLICY ideas_insert ON ideas
  FOR INSERT WITH CHECK (
    has_workspace_role(auth.jwt() ->> 'sub', workspace_id, ARRAY['owner', 'admin', 'member'])
  );
CREATE POLICY ideas_update ON ideas
  FOR UPDATE USING (
    has_workspace_role(auth.jwt() ->> 'sub', workspace_id, ARRAY['owner', 'admin', 'member'])
  );

-- Features: workspace-scoped
CREATE POLICY features_select ON features
  FOR SELECT USING (workspace_id = ANY(get_user_workspace_ids(auth.jwt() ->> 'sub')));
CREATE POLICY features_insert ON features
  FOR INSERT WITH CHECK (
    has_workspace_role(auth.jwt() ->> 'sub', workspace_id, ARRAY['owner', 'admin', 'member'])
  );
CREATE POLICY features_update ON features
  FOR UPDATE USING (
    has_workspace_role(auth.jwt() ->> 'sub', workspace_id, ARRAY['owner', 'admin', 'member'])
  );

-- Specifications: workspace-scoped
CREATE POLICY specifications_select ON specifications
  FOR SELECT USING (workspace_id = ANY(get_user_workspace_ids(auth.jwt() ->> 'sub')));
CREATE POLICY specifications_insert ON specifications
  FOR INSERT WITH CHECK (
    has_workspace_role(auth.jwt() ->> 'sub', workspace_id, ARRAY['owner', 'admin', 'member'])
  );
CREATE POLICY specifications_update ON specifications
  FOR UPDATE USING (
    has_workspace_role(auth.jwt() ->> 'sub', workspace_id, ARRAY['owner', 'admin', 'member'])
  );

-- SpecificationChanges: INSERT-only (no update/delete)
CREATE POLICY spec_changes_select ON specification_changes
  FOR SELECT USING (
    specification_id IN (
      SELECT id FROM specifications
      WHERE workspace_id = ANY(get_user_workspace_ids(auth.jwt() ->> 'sub'))
    )
  );
CREATE POLICY spec_changes_insert ON specification_changes
  FOR INSERT WITH CHECK (
    specification_id IN (
      SELECT id FROM specifications
      WHERE workspace_id = ANY(get_user_workspace_ids(auth.jwt() ->> 'sub'))
    )
  );
-- No UPDATE or DELETE policies: changelog is immutable

-- Discovery sessions: workspace-scoped via specification
CREATE POLICY sessions_select ON discovery_sessions
  FOR SELECT USING (
    specification_id IN (
      SELECT id FROM specifications
      WHERE workspace_id = ANY(get_user_workspace_ids(auth.jwt() ->> 'sub'))
    )
  );
CREATE POLICY sessions_insert ON discovery_sessions
  FOR INSERT WITH CHECK (
    specification_id IN (
      SELECT id FROM specifications
      WHERE workspace_id = ANY(get_user_workspace_ids(auth.jwt() ->> 'sub'))
    )
  );
CREATE POLICY sessions_update ON discovery_sessions
  FOR UPDATE USING (
    specification_id IN (
      SELECT id FROM specifications
      WHERE workspace_id = ANY(get_user_workspace_ids(auth.jwt() ->> 'sub'))
    )
  );

-- Dialogue turns: workspace-scoped via session -> specification
CREATE POLICY turns_select ON dialogue_turns
  FOR SELECT USING (
    session_id IN (
      SELECT ds.id FROM discovery_sessions ds
      JOIN specifications s ON s.id = ds.specification_id
      WHERE s.workspace_id = ANY(get_user_workspace_ids(auth.jwt() ->> 'sub'))
    )
  );
CREATE POLICY turns_insert ON dialogue_turns
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT ds.id FROM discovery_sessions ds
      JOIN specifications s ON s.id = ds.specification_id
      WHERE s.workspace_id = ANY(get_user_workspace_ids(auth.jwt() ->> 'sub'))
    )
  );

-- Prompt templates: everyone can read active templates
CREATE POLICY prompt_templates_select_active ON prompt_templates
  FOR SELECT USING (is_active = true);

-- Spec analytics: workspace-scoped
CREATE POLICY spec_analytics_select ON spec_analytics
  FOR SELECT USING (workspace_id = ANY(get_user_workspace_ids(auth.jwt() ->> 'sub')));
CREATE POLICY spec_analytics_insert ON spec_analytics
  FOR INSERT WITH CHECK (workspace_id = ANY(get_user_workspace_ids(auth.jwt() ->> 'sub')));

-- User rate limits: own records only
CREATE POLICY rate_limits_select ON user_rate_limits
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub')
  );
CREATE POLICY rate_limits_insert ON user_rate_limits
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub')
  );
CREATE POLICY rate_limits_update ON user_rate_limits
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub')
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get or create user + auto-create personal workspace
CREATE OR REPLACE FUNCTION get_or_create_user(
  p_clerk_user_id TEXT,
  p_email TEXT,
  p_name TEXT
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_workspace_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM users WHERE clerk_user_id = p_clerk_user_id;

  IF v_user_id IS NULL THEN
    INSERT INTO users (clerk_user_id, email, name)
    VALUES (p_clerk_user_id, p_email, p_name)
    RETURNING id INTO v_user_id;

    -- Auto-create personal workspace
    INSERT INTO workspaces (name, owner_user_id)
    VALUES (COALESCE(p_name, 'Personal'), v_user_id)
    RETURNING id INTO v_workspace_id;

    -- Add owner membership
    INSERT INTO memberships (workspace_id, user_id, role)
    VALUES (v_workspace_id, v_user_id, 'owner');
  END IF;

  UPDATE users SET last_active_at = NOW() WHERE id = v_user_id;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get active prompt template
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

-- Graduate idea to feature (atomic transaction)
CREATE OR REPLACE FUNCTION graduate_idea(
  p_idea_id UUID,
  p_product_id UUID,
  p_graduated_by UUID
)
RETURNS UUID AS $$
DECLARE
  v_idea RECORD;
  v_feature_id UUID;
BEGIN
  -- Get the idea
  SELECT * INTO v_idea FROM ideas WHERE id = p_idea_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Idea not found: %', p_idea_id;
  END IF;
  IF v_idea.graduated_feature_id IS NOT NULL THEN
    RAISE EXCEPTION 'Idea already graduated: %', p_idea_id;
  END IF;

  -- Verify spec is complete
  IF NOT EXISTS (
    SELECT 1 FROM specifications
    WHERE idea_id = p_idea_id AND status = 'complete'
  ) THEN
    RAISE EXCEPTION 'Idea specification is not complete';
  END IF;

  -- Create the feature
  INSERT INTO features (
    workspace_id, product_id, name, description,
    lifecycle_stage, source_idea_id, created_by
  )
  VALUES (
    v_idea.workspace_id, p_product_id, v_idea.name, v_idea.description,
    'pilot', p_idea_id, p_graduated_by
  )
  RETURNING id INTO v_feature_id;

  -- Update idea with graduated feature id
  UPDATE ideas SET graduated_feature_id = v_feature_id WHERE id = p_idea_id;

  -- Update idea's product_id if not already set
  IF v_idea.product_id IS NULL THEN
    UPDATE ideas SET product_id = p_product_id WHERE id = p_idea_id;
  END IF;

  -- Link specification to the new feature
  UPDATE specifications
  SET feature_id = v_feature_id
  WHERE idea_id = p_idea_id;

  RETURN v_feature_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
-- Tables: 13 (users, workspaces, memberships, products, ideas, features,
--   specifications, specification_changes, discovery_sessions, dialogue_turns,
--   prompt_templates, spec_analytics, user_rate_limits)
-- RLS: enabled on all tables with workspace-scoped policies
-- Functions: 5 (update_updated_at_column, get_user_workspace_ids,
--   has_workspace_role, get_or_create_user, get_active_prompt, graduate_idea)
