import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const migrationPath = path.resolve(
  process.cwd(),
  "supabase/migrations/20260307_initial_schema.sql"
);

function readMigration() {
  return fs.readFileSync(migrationPath, "utf8");
}

function assertPattern(sql: string, pattern: RegExp) {
  expect(sql).toMatch(pattern);
}

test.describe("Database schema migration contracts", () => {
  test("includes all required core tables", () => {
    const sql = readMigration();

    [
      /create table users\s*\(/i,
      /create table specifications\s*\(/i,
      /create table dialogue_turns\s*\(/i,
      /create table prompt_templates\s*\(/i,
      /create table spec_analytics\s*\(/i,
      /create table user_rate_limits\s*\(/i,
    ].forEach((pattern) => assertPattern(sql, pattern));
  });

  test("defines required foreign key relationships with cascading deletes", () => {
    const sql = readMigration();

    [
      /user_id\s+uuid\s+not null\s+references\s+users\(id\)\s+on delete cascade/i,
      /spec_id\s+uuid\s+not null\s+references\s+specifications\(id\)\s+on delete cascade/i,
      /user_id\s+uuid\s+not null\s+references\s+users\(id\)\s+on delete cascade/i,
    ].forEach((pattern) => assertPattern(sql, pattern));
  });

  test("enables RLS on all tables and defines ownership policies", () => {
    const sql = readMigration();

    [
      /alter table users enable row level security;/i,
      /alter table specifications enable row level security;/i,
      /alter table dialogue_turns enable row level security;/i,
      /alter table prompt_templates enable row level security;/i,
      /alter table spec_analytics enable row level security;/i,
      /alter table user_rate_limits enable row level security;/i,
      /create policy specifications_select_own/i,
      /create policy specifications_insert_own/i,
      /create policy specifications_update_own/i,
      /create policy specifications_delete_own/i,
    ].forEach((pattern) => assertPattern(sql, pattern));
  });

  test("enforces key integrity constraints", () => {
    const sql = readMigration();

    [
      /subscription_tier\s+text\s+not null default 'free' check\s*\(subscription_tier in \('free', 'pro', 'team'\)\)/i,
      /status\s+text\s+not null default 'draft' check\s*\(status in \('draft', 'complete', 'archived'\)\)/i,
      /user_satisfaction_score integer check\s*\(user_satisfaction_score between 1 and 5\)/i,
      /create unique index idx_dialogue_turns_spec_turn_order on dialogue_turns\(spec_id, turn_order\)/i,
      /create unique index idx_spec_analytics_spec_id_unique on spec_analytics\(spec_id\)/i,
    ].forEach((pattern) => assertPattern(sql, pattern));
  });

  test("creates performance indexes for expected access paths", () => {
    const sql = readMigration();

    const createIndexCount = (sql.match(/create (unique )?index /gi) ?? []).length;
    expect(createIndexCount).toBeGreaterThanOrEqual(20);

    [
      /create index idx_specifications_user_status on specifications\(user_id, status\)/i,
      /create index idx_specifications_search on specifications using gin/i,
      /create index idx_dialogue_turns_spec_order on dialogue_turns\(spec_id, turn_order\)/i,
      /create index idx_user_rate_limits_user_endpoint on user_rate_limits\(user_id, endpoint\)/i,
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
