@header @navigation
Feature: Header Navigation Tabs

  As a customer
  I want the header to show the main navigation tabs
  So that I can quickly reach Home, Menu, Mobile App, Contact Us, Search, Cart, and Sign In

  # Live-app behavior verified 2026-09-25:
  # - The top header renders: Tomato logo, Home, Menu, Mobile App, Contact Us,
  #   Search (an image), Cart (a link), and a "Sign In" button.
  # - When signed in, "Sign In" is replaced by the "Profile" avatar.
  # - Nav destinations: Home "/", Menu "#explore-menu", Mobile App "#app-download",
  #   Contact Us "#footer", Cart "/cart".

  Background:
    Given I open the Tomato home page

  @smoke
  Scenario: Header shows all navigation tabs
    Then the header shows the Tomato logo
    And the header shows a "Home" tab
    And the header shows a "Menu" tab
    And the header shows a "Mobile App" tab
    And the header shows a "Contact Us" tab
    And the header shows a "Search" control
    And the header shows a "Cart" tab
    And the header shows a "Sign In" tab

  @smoke
  Scenario: Navigation links point to their destinations
    Then the Home tab points to the home page
    And the Menu tab points to the explore-menu section
    And the Mobile App tab points to the app-download section
    And the Contact Us tab points to the footer
    And the Cart tab points to the cart page

  @sanity
  Scenario: Tomato logo navigates to the home page
    When I click the Tomato logo
    Then the home page is shown

  @sanity
  Scenario: Cart tab opens the cart page
    When I click the "Cart" tab
    Then the cart page is shown

  @smoke
  Scenario: Sign In tab opens the Login modal
    When I click the "Sign In" tab
    Then the Login modal is shown with email and password fields

  @regression
  Scenario: Sign In is replaced by Profile when signed in
    Given I have a registered account
    When I open the sign-in modal
    And I log in with valid credentials accepting the terms
    Then the header shows the profile avatar instead of the "Sign In" button

  @regression
  Scenario: Menu tab scrolls to the explore-menu section
    When I click the "Menu" tab
    Then the explore-menu section is in view
