# Supabase Database Schema

This directory contains the Supabase database schema, migrations, and type definitions for Discovery Loop Coach.

## Schema Overview

The database schema supports the complete Discovery Loop Coach workflow:
- **User management** with Clerk authentication integration
- **Specification creation** through AI-powered discovery dialogue
- **Multi-persona conversations** (Product Coach, Security Expert, UX Analyst, Domain Expert)
- **Analytics tracking** for product metrics
- **Rate limiting** for API usage control

## Tables

### 1. `users`
Extends Clerk authentication with app-specific user data.

**Key fields:**
- `clerk_user_id` - Links to Clerk user ID (external auth)
- `email`, `name` - User profile data
- `github_access_token`, `linear_access_token` - Encrypted OAuth tokens
- `subscription_tier` - User's subscription level (free/pro/team)

**Indexes:**
- `clerk_user_id` (unique)
- `email` (unique)
- `subscription_tier`

### 2. `specifications`
Core entity representing product specifications created through discovery dialogue.

**Key fields:**
- `user_id` - Foreign key to users table
- `title`, `description` - Spec metadata
- `requirements_json` - Structured requirements from AI (JSONB)
- `acceptance_tests_json` - BDD acceptance tests (JSONB)
- `status` - Workflow state (draft/complete/archived)
- `linked_github_pr`, `linked_linear_issue` - Integration links

**Indexes:**
- `user_id`
- `status`
- `created_at` (DESC)
- `user_id + status` (composite)
- Full-text search on title + description

### 3. `dialogue_turns`
Stores Q&A dialogue between user and AI personas during spec discovery.

**Key fields:**
- `spec_id` - Foreign key to specifications
- `persona_type` - Which AI persona (product_coach, security_expert, ux_analyst, domain_expert)
- `question` - User's question/response
- `answer` - AI persona's response
- `turn_order` - Sequential order (1, 2, 3, ...)
- `tokens_used` - AI tokens consumed
- `latency_ms` - Response time

**Indexes:**
- `spec_id`
- `spec_id + turn_order` (composite, unique)
- `persona_type`
- `created_at` (DESC)

### 4. `prompt_templates`
Manages AI persona system prompts for A/B testing and versioning.

**Key fields:**
- `persona_type` - Which persona this prompt is for
- `version` - Semantic version (e.g., "1.0", "1.1")
- `system_prompt` - Full system prompt text
- `is_active` - Only one version per persona can be active

**Indexes:**
- `persona_type`
- `is_active`
- `persona_type + is_active` (unique constraint on active)

### 5. `spec_analytics`
Analytics data for each completed specification.

**Key fields:**
- `spec_id` - Foreign key to specifications (unique)
- `time_to_complete_sec` - Total time from start to completion
- `dialogue_turns` - Number of turns in the dialogue
- `ai_tokens_used` - Total AI tokens consumed
- `user_satisfaction_score` - 1-5 rating

**Indexes:**
- `spec_id` (unique)
- `created_at` (DESC)

### 6. `user_rate_limits`
Tracks API rate limits per user per endpoint.

**Key fields:**
- `user_id` - Foreign key to users
- `endpoint` - API endpoint path
- `request_count` - Number of requests in current window
- `window_start` - Start of the rate limit window

**Indexes:**
- `user_id + endpoint` (composite, unique)
- `window_start`

## Row Level Security (RLS)

All tables have RLS enabled. Policies ensure:
- Users can only access their own data
- Prompt templates are readable by all authenticated users
- No data leakage between users

### RLS Policies

**users:**
- `users_select_own` - Users can read their own record
- `users_update_own` - Users can update their own record

**specifications:**
- `specifications_select_own` - Users can read their own specs
- `specifications_insert_own` - Users can create specs
- `specifications_update_own` - Users can update their own specs
- `specifications_delete_own` - Users can delete their own specs

**dialogue_turns:**
- `dialogue_turns_select_own` - Users can read turns for their specs
- `dialogue_turns_insert_own` - Users can create turns for their specs
- `dialogue_turns_update_own` - Users can update turns for their specs
- `dialogue_turns_delete_own` - Users can delete turns for their specs

**prompt_templates:**
- `prompt_templates_select_active` - All users can read active prompts

**spec_analytics:**
- `spec_analytics_select_own` - Users can read analytics for their specs
- `spec_analytics_insert_own` - Users can create analytics for their specs

**user_rate_limits:**
- `user_rate_limits_select_own` - Users can read their own rate limits
- `user_rate_limits_update_own` - Users can update their own rate limits
- `user_rate_limits_insert_own` - Users can create their own rate limits

## Helper Functions

### `get_or_create_user(clerk_user_id, email, name)`
Finds or creates a user record based on Clerk user ID. Automatically updates `last_active_at` timestamp.

**Usage:**
```sql
SELECT get_or_create_user('clerk_user_123', 'user@example.com', 'John Doe');
```

### `get_active_prompt(persona_type)`
Returns the active system prompt for a given persona type.

**Usage:**
```sql
SELECT get_active_prompt('product_coach');
```

## Database Setup

Run `supabase/init.sql` in the Supabase SQL Editor to create all tables, indexes,
RLS policies, helper functions, and seed persona prompts in one step.
The script is idempotent — it drops existing objects before recreating them.

## Type Safety

TypeScript types are generated from the database schema in `/lib/database.types.ts`. These types are auto-synced with the actual database schema.

To regenerate types:
```bash
npx supabase gen types typescript --project-id <your-project-id> > lib/database.types.ts
```

## Best Practices

1. **Never disable RLS** - All tables must have RLS enabled for security
2. **Use helper functions** - Prefer `get_or_create_user()` over raw INSERTs
3. **Index foreign keys** - All foreign key columns are indexed for performance
4. **JSONB for flexibility** - Requirements and acceptance tests use JSONB for schema flexibility
5. **Timestamps everywhere** - All tables have `created_at` and most have `updated_at`
6. **Soft deletes** - Consider adding `deleted_at` for soft deletes if needed

## Performance Considerations

- **Indexes** - 23 indexes created for common query patterns
- **JSONB** - Requirements and tests stored as JSONB for efficient querying
- **Full-text search** - Specifications have GIN index for text search
- **Triggers** - `updated_at` automatically maintained via triggers
- **Cascading deletes** - Foreign keys use `ON DELETE CASCADE` for data integrity

## Security

- **Encrypted tokens** - OAuth tokens stored encrypted (application-level encryption required)
- **RLS policies** - Prevent data leakage between users
- **CSRF protection** - Use Supabase auth tokens (not exposed to client)
- **No PII in logs** - Sensitive data never logged

## Future Enhancements

- [ ] Soft deletes for specifications (`deleted_at` column)
- [ ] Audit log table for compliance
- [ ] Materialized views for analytics dashboards
- [ ] Partitioning for `dialogue_turns` (when volume increases)
- [ ] Read replicas for analytics queries
