@navigation @view-menu
Feature: View Menu Button

  As a customer
  I want the "View Menu" button on the home page hero
  So that I can jump straight to the "Explore our menu" section

  # Live-app behavior verified 2026-09-25:
  # - The hero renders a "View Menu" button under the heading
  #   "Order your favourite food here".
  # - Clicking it smooth-scrolls to the "Explore our menu" section (the
  #   heading is pinned to the top of the viewport) without navigating away.

  Background:
    Given I open the Tomato home page

  @smoke
  Scenario: View Menu button is shown on the home page
    Then the View Menu button is visible
    And the hero heading "Order your favourite food here" is visible

  @smoke @critical
  Scenario: View Menu scrolls to the Explore our menu section
    When I click the View Menu button
    Then the Explore our menu section is scrolled into view

  @regression
  Scenario: View Menu reveals the menu categories
    When I click the View Menu button
    Then the menu categories are visible

  @sanity
  Scenario: View Menu keeps the user on the home page
    When I click the View Menu button
    Then the page URL stays on the home page
