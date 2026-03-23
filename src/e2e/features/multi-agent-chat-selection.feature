Feature: Multi-Agent Chat Selection
  As a user
  I want to converse with specialized AI agents during discovery
  So that I can get expert advice on specific topics while maintaining a coherent specification

  Background:
    Given I am signed in
    And I have an active idea with a specification

  Scenario: Start with Product Coach by default
    When I open the discovery page for my idea
    Then I should see the Product Coach as the active agent
    And the welcome message should be from the Product Coach

  Scenario: See available agents when creating a new session
    Given I am on the discovery page
    When I click the "New Session" button
    Then I should see the agent selector with 5 agents
    And I should see "Product Coach" with a "Coach" badge
    And I should see "Security Expert" with a "Specialist" badge
    And I should see "UX Designer" with a "Specialist" badge
    And I should see "Domain Expert" with a "Specialist" badge
    And I should see "Architecture Expert" with a "Specialist" badge

  Scenario: Create a session with a specialist agent
    Given I am on the discovery page with an existing Product Coach session
    When I click "New Session" and select "Security Expert"
    Then a new session should be created with the Security Expert agent
    And the agent indicator should show "Security Expert"
    And the welcome message should be from the Security Expert

  Scenario: Switch between sessions with different agents
    Given I have a Product Coach session and a Security Expert session
    When I switch to the Security Expert session
    Then the agent indicator should show "Security Expert"
    And I should see the Security Expert conversation history
    When I switch back to the Product Coach session
    Then the agent indicator should show "Product Coach"
    And I should see the Product Coach conversation history

  Scenario: Session selector shows agent names
    Given I have multiple sessions with different agents
    When I view the session selector dropdown
    Then each session should be labelled with its agent name

  Scenario: Specialist receives context from Product Coach
    Given I have discussed "SSO login with Google" with the Product Coach
    When I start a new session with the Security Expert
    Then the Security Expert should have context about "SSO login"
    And the Security Expert should be able to ask security-specific questions

  Scenario: PRD and tests update from all agent conversations
    Given I have a Product Coach session with some PRD content
    When I discuss security concerns with the Security Expert
    Then the PRD should be updated with security considerations
    And new acceptance tests related to security should appear

  Scenario: Agent indicator shows in status bar
    Given I am chatting with the Architecture Expert
    Then the status bar should display "Architecture Expert"
    And the chat messages should show "Architecture Expert" as the persona
