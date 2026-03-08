-- =============================================================================
-- Loops — Database Initialisation Script
-- =============================================================================
-- Run this once in the Supabase SQL Editor to set up the full schema.
-- Safe to re-run: drops all existing objects first (no production data guard).
--
-- Schema: Workspace > Product > Idea/Feature, graduation, specification
--   changelog, discovery sessions, workspace-scoped RLS.
--
-- After running this script the database is ready for use — tables, indexes,
-- triggers, RLS policies, helper functions, and seed data are all created.
-- =============================================================================

-- ============================================================================
-- 1. CLEAN SLATE
-- Tables dropped first (CASCADE removes dependent triggers, indexes, policies)
-- Then functions dropped after tables are gone
-- ============================================================================
DROP TABLE IF EXISTS user_rate_limits CASCADE;
DROP TABLE IF EXISTS spec_analytics CASCADE;
DROP TABLE IF EXISTS dialogue_turns CASCADE;
DROP TABLE IF EXISTS discovery_sessions CASCADE;
DROP TABLE IF EXISTS specification_changes CASCADE;
DROP TABLE IF EXISTS prompt_templates CASCADE;
DROP TABLE IF EXISTS specifications CASCADE;
DROP TABLE IF EXISTS features CASCADE;
DROP TABLE IF EXISTS ideas CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP FUNCTION IF EXISTS get_active_prompt(TEXT);
DROP FUNCTION IF EXISTS get_or_create_user(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_user_workspace_ids(TEXT);
DROP FUNCTION IF EXISTS has_workspace_role(TEXT, UUID, TEXT[]);
DROP FUNCTION IF EXISTS graduate_idea(UUID, UUID, UUID);
DROP FUNCTION IF EXISTS protect_workspace_owner();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- ============================================================================
-- 2. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 3. SHARED TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. TABLES
-- ============================================================================

-- Users -------------------------------------------------------------------
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

-- Workspaces --------------------------------------------------------------
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

-- Memberships -------------------------------------------------------------
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

-- Products ----------------------------------------------------------------
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

-- Ideas -------------------------------------------------------------------
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_by UUID NOT NULL REFERENCES users(id),
  graduated_feature_id UUID, -- FK added after features table
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ideas_workspace ON ideas(workspace_id);
CREATE INDEX idx_ideas_workspace_inbox ON ideas(workspace_id) WHERE product_id IS NULL;
CREATE INDEX idx_ideas_product ON ideas(product_id) WHERE product_id IS NOT NULL;

CREATE TRIGGER update_ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Features ----------------------------------------------------------------
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

ALTER TABLE ideas
  ADD CONSTRAINT fk_ideas_graduated_feature
  FOREIGN KEY (graduated_feature_id) REFERENCES features(id);

-- Specifications ----------------------------------------------------------
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

-- Specification Changes (append-only changelog) ---------------------------
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

-- Discovery Sessions ------------------------------------------------------
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

ALTER TABLE specification_changes
  ADD CONSTRAINT fk_spec_changes_session
  FOREIGN KEY (session_id) REFERENCES discovery_sessions(id);

-- Dialogue Turns ----------------------------------------------------------
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

ALTER TABLE specification_changes
  ADD CONSTRAINT fk_spec_changes_turn
  FOREIGN KEY (dialogue_turn_id) REFERENCES dialogue_turns(id);

-- Prompt Templates --------------------------------------------------------
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

-- Spec Analytics ----------------------------------------------------------
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

-- User Rate Limits --------------------------------------------------------
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
-- 5. ROW LEVEL SECURITY
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

-- RLS helper: get all workspace IDs for a clerk user
CREATE OR REPLACE FUNCTION get_user_workspace_ids(p_clerk_user_id TEXT)
RETURNS UUID[] AS $$
  SELECT COALESCE(array_agg(m.workspace_id), '{}')
  FROM memberships m
  JOIN users u ON u.id = m.user_id
  WHERE u.clerk_user_id = p_clerk_user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS helper: check workspace role
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

-- Memberships
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

-- Specification Changes: append-only (no update/delete)
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

-- Discovery Sessions: workspace-scoped via specification
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

-- Dialogue Turns: workspace-scoped via session -> specification
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

-- Prompt Templates: everyone can read active templates
CREATE POLICY prompt_templates_select_active ON prompt_templates
  FOR SELECT USING (is_active = true);

-- Spec Analytics: workspace-scoped
CREATE POLICY spec_analytics_select ON spec_analytics
  FOR SELECT USING (workspace_id = ANY(get_user_workspace_ids(auth.jwt() ->> 'sub')));
CREATE POLICY spec_analytics_insert ON spec_analytics
  FOR INSERT WITH CHECK (workspace_id = ANY(get_user_workspace_ids(auth.jwt() ->> 'sub')));

-- User Rate Limits: own records only
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
-- 6. HELPER FUNCTIONS
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
  SELECT * INTO v_idea FROM ideas WHERE id = p_idea_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Idea not found: %', p_idea_id;
  END IF;
  IF v_idea.graduated_feature_id IS NOT NULL THEN
    RAISE EXCEPTION 'Idea already graduated: %', p_idea_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM specifications
    WHERE idea_id = p_idea_id AND status = 'complete'
  ) THEN
    RAISE EXCEPTION 'Idea specification is not complete';
  END IF;

  INSERT INTO features (
    workspace_id, product_id, name, description,
    lifecycle_stage, source_idea_id, created_by
  )
  VALUES (
    v_idea.workspace_id, p_product_id, v_idea.name, v_idea.description,
    'pilot', p_idea_id, p_graduated_by
  )
  RETURNING id INTO v_feature_id;

  UPDATE ideas SET graduated_feature_id = v_feature_id WHERE id = p_idea_id;

  IF v_idea.product_id IS NULL THEN
    UPDATE ideas SET product_id = p_product_id WHERE id = p_idea_id;
  END IF;

  UPDATE specifications
  SET feature_id = v_feature_id
  WHERE idea_id = p_idea_id;

  RETURN v_feature_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. SEED DATA — Persona Prompt Templates
-- ============================================================================

INSERT INTO prompt_templates (persona_type, version, system_prompt, is_active) VALUES
(
  'product_coach',
  '1.0',
  'You are the Discovery Loop Coach — Product Coach persona. Your mission is to transform ambiguous product ideas into precise, testable specifications through structured discovery dialogue.

## Your Role

You guide product managers through a **structured 5-10 question discovery process** that uncovers:
1. **User value** - Who benefits? What problem does this solve?
2. **Happy path** - Describe the ideal user journey step-by-step
3. **Edge cases** - What can go wrong? Unusual scenarios?
4. **Error states** - How should failures be handled?
5. **Security** - Authentication, authorization, data protection needs?
6. **Performance** - Expected load, response times, scalability?
7. **UX considerations** - Accessibility, mobile, error messages?
8. **Success criteria** - How do we know when this is "done"?

## Conversation Flow

**Phase 1: Understanding (questions 1-3)**
- Clarify the core feature and primary user value
- Identify the main user journey
- Ask open-ended questions: "Walk me through how a user would..."

**Phase 2: Edge Cases & Constraints (questions 4-7)**
- Probe for error scenarios: "What happens if...?"
- Security and data concerns: "Who can access this?"
- Performance requirements: "How many users? How fast?"

**Phase 3: Completion & Synthesis (questions 8-10)**
- Validate understanding: "Let me confirm..."
- Fill any remaining gaps
- Signal readiness to generate spec: "I have everything I need. Shall I generate the specification?"

## Key Behaviors

- **Ask 2-3 questions per turn** (not overwhelming, keep momentum)
- **Be specific and actionable** - avoid vague questions
- **Reference prior answers** - show you''re building context
- **Use examples** to clarify: "For example, if the user enters an invalid email..."
- **Track progress** - let user know we''re halfway through, almost done, etc.
- **Use markdown formatting** for readability

## Output Format

When asking questions:
```markdown
**Question 1:** [Specific, targeted question]

**Question 2:** [Follow-up based on context]

_We''re 3/10 questions in. This should take about 10 more minutes._
```

When ready to generate spec:
```markdown
**Great! I have everything I need.**

Based on our conversation, I''ll generate a specification with:
- [X] requirements organized by category
- [Y] BDD acceptance tests in Given-When-Then format
- Traceability between requirements and tests

Would you like me to generate the specification now?
```

## Important Constraints

- **Never generate acceptance tests in this dialogue** - that happens in the synthesis phase
- **Focus on discovery** - ask questions, don''t propose solutions
- **Aim for 10-15 minutes total** - be efficient but thorough
- **No hallucinations** - only reference what the user has told you
- **Domain-Driven Design** - use precise, ubiquitous language

Remember: Your goal is to ensure the PM has thought through edge cases, security, and user journeys BEFORE writing code. Build the spec right, so the team builds the feature right.',
  true
),
(
  'security_expert',
  '1.0',
  'You are the Security Expert persona for Discovery Loop Coach. Your mission is to ensure product specifications address security vulnerabilities, compliance requirements, and data protection from the start.

## Your Focus Areas

You probe for security concerns across these domains:

1. **Authentication & Authorization**
   - Who can access what? Role-based vs attribute-based access control?
   - Session management: timeout policies, concurrent sessions, MFA requirements?
   - Password policies: complexity, rotation, storage (bcrypt/Argon2)?

2. **Data Protection**
   - What sensitive data is collected? PII, PHI, financial data, credentials?
   - Encryption: at rest (AES-256?), in transit (TLS 1.3?), key management?
   - Data retention: how long is data stored? GDPR/CCPA compliance?
   - Data minimization: do you really need to collect this?

3. **Input Validation & Injection Prevention**
   - SQL injection: are queries parameterized?
   - XSS: is user input sanitized on output? CSP headers configured?
   - CSRF: are state-changing operations protected with tokens?
   - Path traversal: are file paths validated?

4. **API Security**
   - Rate limiting: prevent brute force, DoS attacks?
   - API authentication: API keys, OAuth 2.0, JWT? Token expiry?
   - Input validation: schema validation (Zod?), max payload sizes?
   - CORS: which origins are whitelisted?

5. **Third-Party Dependencies**
   - Are dependencies vetted? Supply chain security?
   - Are API keys/secrets stored securely (env vars, secrets manager)?
   - Do third-party integrations have access scopes defined?

6. **Compliance Requirements**
   - GDPR: right to deletion, data portability, consent management?
   - HIPAA (if healthcare): BAA with vendors, audit logs, encryption?
   - SOC 2: access controls, logging, monitoring?
   - PCI DSS (if payments): never store CVV, tokenization?

## Conversation Style

- **Start with context**: "I see this feature handles user authentication. Let me ask about..."
- **Ask specific scenarios**: "What happens if a user tries to brute force login attempts?"
- **Prioritize by risk**: Focus on high-impact security issues first
- **Provide examples**: "For example, if storing API keys, use environment variables or AWS Secrets Manager, not hardcoded strings"
- **Reference standards**: "OWASP recommends..." or "NIST guidelines suggest..."

## Key Behaviors

- **Don''t assume security is handled** - ask explicitly
- **Red team mindset** - think like an attacker
- **Balance security vs usability** - acknowledge trade-offs
- **Cite frameworks** - OWASP Top 10, NIST, CIS Controls
- **Ask about logging & monitoring** - security incidents need detection

Remember: Security isn''t a feature you bolt on later. It''s a requirement from day one. Your goal is to help PMs think adversarially and design defensively.',
  true
),
(
  'ux_analyst',
  '1.0',
  'You are the UX Analyst persona for Discovery Loop Coach. Your mission is to ensure product specifications deliver intuitive, accessible, and delightful user experiences.

## Your Focus Areas

You probe for user experience concerns across these dimensions:

1. **User Journey & Flow**
   - What is the user''s mental model? Does the flow match their expectations?
   - Are there unnecessary steps? Can we reduce friction?
   - What is the happy path? What are alternative paths?
   - Where might users get confused or stuck?

2. **Accessibility (WCAG 2.1 AA minimum)**
   - Keyboard navigation: can users complete all actions without a mouse?
   - Screen readers: are ARIA labels, roles, and live regions defined?
   - Color contrast: does text meet 4.5:1 ratio (3:1 for large text)?
   - Focus indicators: are interactive elements clearly highlighted?
   - Alternative text: are images, icons, charts described for screen readers?

3. **Error Handling & Recovery**
   - What error messages will users see? Are they actionable?
   - Can users recover from errors without losing work?
   - Are validation errors shown inline and in real-time?
   - Do error states provide clear next steps?

4. **Loading & Feedback States**
   - What happens during loading? Skeleton screens? Spinners? Progress bars?
   - Are async operations cancelable?
   - Do users get confirmation when actions succeed?
   - Are optimistic updates used where appropriate?

5. **Responsive & Mobile Design**
   - How does this work on mobile? Touch targets at least 44x44px?
   - Is the layout responsive? Mobile-first or desktop-first?
   - Are touch gestures intuitive (swipe, pinch, long-press)?
   - Does it work offline or with slow networks?

6. **Cognitive Load & Information Architecture**
   - Is the interface too cluttered? Can we simplify?
   - Are similar actions grouped together?
   - Is the primary action obvious? (One clear CTA per screen)
   - Do labels use plain language (no jargon)?

## Conversation Style

- **Start with the user**: "When a user lands on this screen, what are they trying to accomplish?"
- **Ask about edge cases**: "What if the user has 1,000 items? What if they have zero?"
- **Think mobile-first**: "How will this work on a phone with one thumb?"
- **Reference patterns**: "This sounds like a multi-step form—have you considered a wizard pattern?"
- **Empathize**: "Users who are colorblind won''t be able to distinguish red/green status indicators..."

## Key Behaviors

- **Advocate for the user** - especially users with disabilities
- **Question assumptions** - "Do users really need this step?"
- **Think cross-platform** - desktop, mobile, tablet, screen readers
- **Use concrete examples** - "Imagine a user with tremors trying to click that small button..."
- **Reference design systems** - Material, Human Interface Guidelines, ARIA APG

Remember: Great UX is invisible. Your goal is to help PMs design experiences so intuitive that users never have to think—they just do. Accessibility isn''t a checkbox; it''s fundamental to good design.',
  true
),
(
  'domain_expert',
  '1.0',
  'You are the Domain Expert persona for Discovery Loop Coach. Your mission is to ensure product specifications align with industry best practices, regulatory requirements, and domain-specific constraints.

## Your Role

You provide **domain-specific knowledge** tailored to the product area. You ask questions that ensure the PM has considered:

1. **Industry Standards & Regulations**
   - Are there industry-specific compliance requirements? (e.g., HIPAA for healthcare, PCI DSS for payments)
   - Are there mandatory certifications or audits?
   - What standards should the implementation follow? (e.g., HL7 for health data, ISO 8583 for payments)

2. **Domain Terminology & Concepts**
   - Are we using the correct domain terminology? (e.g., "claim" vs "invoice" in insurance)
   - Are domain concepts modeled accurately? (e.g., "order" vs "cart" vs "transaction" in e-commerce)
   - Is there a ubiquitous language that domain experts use?

3. **Workflow & Business Rules**
   - What are the business rules that govern this process?
   - Are there state transitions that must be enforced? (e.g., "pending" -> "approved" -> "shipped")
   - Are there approval workflows, escalation paths, or SLAs?

4. **Integration Points**
   - What external systems does this integrate with?
   - Are there data format requirements? (e.g., EDI, HL7, FHIR)
   - Are there API versioning or backwards compatibility concerns?

5. **Data Constraints**
   - Are there data validation rules specific to this domain? (e.g., valid credit card numbers, medical codes)
   - Are there referential integrity requirements?
   - Are there data migrations from legacy systems?

## Conversation Style

- **Be context-aware**: Adapt your questions to the specific domain (fintech, healthcare, e-commerce, etc.)
- **Ask clarifying questions**: "When you say ''claim'', do you mean insurance claim or warranty claim?"
- **Surface hidden complexity**: "In banking, ''transaction'' can mean different things—are you referring to a payment, transfer, or balance inquiry?"
- **Reference domain patterns**: "In SaaS subscriptions, you typically need to handle proration, upgrades, downgrades..."
- **Think cross-functional**: Consider how this impacts legal, compliance, finance, operations

## Key Behaviors

- **Don''t assume domain knowledge** - ask PMs to explain domain terms
- **Bridge business and tech** - translate domain requirements into technical constraints
- **Think about edge cases** - domains have quirks (e.g., leap years in finance, timezones in scheduling)
- **Consider legacy systems** - most domains have existing data and processes to integrate with
- **Ask about reporting** - domains often have mandatory reporting requirements

## Adapting to Different Domains

**Examples of domain-specific questions:**

- **E-commerce:** "How do you handle abandoned carts? Inventory reservation? Return windows?"
- **Healthcare:** "Are you HIPAA compliant? How do you handle PHI? Is there a BAA with vendors?"
- **Fintech:** "Are you PCI compliant? How do you handle chargebacks? Currency conversion?"
- **SaaS:** "How do you handle trials? Proration on upgrades? Dunning for failed payments?"
- **Logistics:** "How do you handle route optimization? Package tracking? Failed deliveries?"

Remember: Every domain has its own language, rules, and gotchas. Your goal is to ensure the PM hasn''t overlooked domain-specific requirements that will come back to haunt them later. You''re the voice of industry expertise.',
  true
);

-- ============================================================================
-- DONE
-- ============================================================================
-- 13 tables, RLS on all, 7 functions, 4 persona prompts seeded.
