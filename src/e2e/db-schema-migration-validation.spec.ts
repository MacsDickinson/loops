import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const schemaPath = path.resolve(process.cwd(), "supabase/init.sql");

function readSchema() {
  return fs.readFileSync(schemaPath, "utf8");
}

function assertPattern(sql: string, pattern: RegExp) {
  expect(sql).toMatch(pattern);
}

test.describe("Database schema migration contracts", () => {
  test("includes all required core tables", () => {
    const sql = readSchema();

    [
      /create table users\s*\(/i,
      /create table workspaces\s*\(/i,
      /create table memberships\s*\(/i,
      /create table products\s*\(/i,
      /create table ideas\s*\(/i,
      /create table features\s*\(/i,
      /create table specifications\s*\(/i,
      /create table specification_changes\s*\(/i,
      /create table discovery_sessions\s*\(/i,
      /create table dialogue_turns\s*\(/i,
      /create table prompt_templates\s*\(/i,
      /create table spec_analytics\s*\(/i,
      /create table user_rate_limits\s*\(/i,
    ].forEach((pattern) => assertPattern(sql, pattern));
  });

  test("defines required foreign key relationships with cascading deletes", () => {
    const sql = readSchema();

    [
      // Memberships cascade from workspace and user
      /workspace_id\s+uuid\s+not null\s+references\s+workspaces\(id\)\s+on delete cascade/i,
      /user_id\s+uuid\s+not null\s+references\s+users\(id\)\s+on delete cascade/i,
      // Products cascade from workspace
      /workspace_id\s+uuid\s+not null\s+references\s+workspaces\(id\)\s+on delete cascade/i,
      // Specifications cascade from workspace
      /workspace_id\s+uuid\s+not null\s+references\s+workspaces\(id\)\s+on delete cascade/i,
      // Discovery sessions cascade from specification
      /specification_id\s+uuid\s+not null\s+references\s+specifications\(id\)\s+on delete cascade/i,
      // Dialogue turns cascade from session
      /session_id\s+uuid\s+not null\s+references\s+discovery_sessions\(id\)\s+on delete cascade/i,
      // Spec analytics cascade from specification
      /spec_id\s+uuid\s+not null\s+references\s+specifications\(id\)\s+on delete cascade/i,
    ].forEach((pattern) => assertPattern(sql, pattern));
  });

  test("enables RLS on all tables and defines workspace-scoped policies", () => {
    const sql = readSchema();

    // RLS enabled on all tables
    [
      /alter table users enable row level security;/i,
      /alter table workspaces enable row level security;/i,
      /alter table memberships enable row level security;/i,
      /alter table products enable row level security;/i,
      /alter table ideas enable row level security;/i,
      /alter table features enable row level security;/i,
      /alter table specifications enable row level security;/i,
      /alter table specification_changes enable row level security;/i,
      /alter table discovery_sessions enable row level security;/i,
      /alter table dialogue_turns enable row level security;/i,
      /alter table prompt_templates enable row level security;/i,
      /alter table spec_analytics enable row level security;/i,
      /alter table user_rate_limits enable row level security;/i,
    ].forEach((pattern) => assertPattern(sql, pattern));

    // Workspace-scoped policies (not user-scoped)
    [
      /create policy specifications_select on specifications/i,
      /create policy specifications_insert on specifications/i,
      /create policy specifications_update on specifications/i,
      /create policy sessions_select on discovery_sessions/i,
      /create policy turns_select on dialogue_turns/i,
    ].forEach((pattern) => assertPattern(sql, pattern));
  });

  test("enforces key integrity constraints", () => {
    const sql = readSchema();

    [
      /subscription_tier\s+text\s+not null\s+default\s+'free'\s*\n\s*check\s*\(subscription_tier\s+in\s*\('free',\s*'pro',\s*'team'\)\)/i,
      /status\s+text\s+not null\s+default\s+'draft'\s*\n\s*check\s*\(status\s+in\s*\('draft',\s*'complete',\s*'archived'\)\)/i,
      /user_satisfaction_score\s+integer\s+check\s*\(user_satisfaction_score\s+between\s+1\s+and\s+5\)/i,
      /unique\s*\(session_id,\s*turn_order\)/i,
      /create unique index idx_spec_analytics_spec_unique on spec_analytics\(spec_id\)/i,
    ].forEach((pattern) => assertPattern(sql, pattern));
  });

  test("creates performance indexes for expected access paths", () => {
    const sql = readSchema();

    const createIndexCount = (sql.match(/create (unique )?index /gi) ?? []).length;
    expect(createIndexCount).toBeGreaterThanOrEqual(15);

    [
      /create index idx_specifications_status on specifications\(workspace_id, status\)/i,
      /create index idx_specifications_search on specifications\s+using gin/i,
      /create index idx_dialogue_turns_session_order on dialogue_turns\(session_id, turn_order\)/i,
      /create unique index idx_user_rate_limits_user_endpoint/i,
    ].forEach((pattern) => assertPattern(sql, pattern));
  });
});

test.describe("Database integration coverage gaps", () => {
  test.skip("migration up/down execution should be validated against a disposable Postgres instance", async () => {
    // Requires CI job spinning up Postgres/Supabase and executing migration + rollback flow.
  });

  test.skip("RLS runtime behavior should be validated with authenticated user fixtures", async () => {
    // Requires integration harness with JWT auth context and multi-user test data.
  });

  test.skip("query performance benchmarks should assert indexed query latency budgets", async () => {
    // Requires seeded dataset and repeatable benchmark environment.
  });
});
