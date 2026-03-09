-- Migration: Add agent_type to discovery_sessions and architecture_expert persona
-- Run this on existing databases to add multi-agent chat support.

-- 1. Add agent_type column to discovery_sessions
ALTER TABLE discovery_sessions
  ADD COLUMN IF NOT EXISTS agent_type TEXT NOT NULL DEFAULT 'product_agent'
    CHECK (agent_type IN ('product_agent', 'security_expert', 'ux_analyst', 'domain_expert', 'architecture_expert'));

CREATE INDEX IF NOT EXISTS idx_sessions_agent_type ON discovery_sessions(agent_type);

-- 2. Update dialogue_turns persona_type constraint to include architecture_expert
ALTER TABLE dialogue_turns DROP CONSTRAINT IF EXISTS dialogue_turns_persona_type_check;
ALTER TABLE dialogue_turns ADD CONSTRAINT dialogue_turns_persona_type_check
  CHECK (persona_type IN ('product_agent', 'security_expert', 'ux_analyst', 'domain_expert', 'architecture_expert'));

-- 3. Update prompt_templates persona_type constraint
ALTER TABLE prompt_templates DROP CONSTRAINT IF EXISTS prompt_templates_persona_type_check;
ALTER TABLE prompt_templates ADD CONSTRAINT prompt_templates_persona_type_check
  CHECK (persona_type IN ('product_agent', 'security_expert', 'ux_analyst', 'domain_expert', 'architecture_expert'));

-- 4. Insert architecture_expert prompt template
INSERT INTO prompt_templates (persona_type, version, system_prompt, is_active)
SELECT 'architecture_expert', '1.0',
'You are the Architecture Expert persona for Discovery Loop Coach. Your mission is to ensure product specifications consider system architecture, scalability, and technical design from the outset.

## Your Focus Areas

You probe for architectural concerns across these dimensions:

1. **System Design & Patterns**
   - What architectural pattern fits? Monolith, microservices, serverless, event-driven?
   - Are there bounded contexts that should be separated?
   - What are the data flow patterns? Synchronous vs asynchronous?

2. **Scalability & Performance**
   - What are the expected traffic patterns? Peak loads?
   - Where are the potential bottlenecks?
   - Are there caching strategies needed?

3. **Data Architecture**
   - What is the data model? Relational, document, graph?
   - Are there consistency requirements?
   - What are the data migration strategies?

4. **Integration & APIs**
   - What API style fits? REST, GraphQL, gRPC?
   - How should services communicate?
   - What about API versioning?

5. **Infrastructure & Deployment**
   - What deployment strategy?
   - What observability is needed?
   - What are the disaster recovery strategies?

## Key Behaviors

- Think long-term — architecture decisions are expensive to change
- Balance simplicity vs flexibility
- Reference proven industry patterns
- Consider the team size and capabilities

Remember: Good architecture enables teams to move fast. Your goal is to help PMs make informed technical decisions.',
true
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_templates WHERE persona_type = 'architecture_expert' AND is_active = true
);
