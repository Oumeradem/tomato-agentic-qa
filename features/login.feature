@smoke
Feature: User Sign-In
  As a guest of Tomato Food Delivery
  I want to sign in with my credentials
  So that I can place orders

  Background:
    Given I open the application
    And I am on the Login page

  # Requires USERNAME / PASSWORD (a registered Tomato account) in .env.
  @critical
  Scenario: Successful sign-in with valid credentials
    When I sign in with my registered credentials
    Then I am signed in

  @sanity
  Scenario: Sign-in with invalid credentials shows an error alert
    When I login with username "nobody@example.com" and password "wrongpass"
    Then a login error message "User Doesn't exist" should be displayed

  Scenario: Sign-in with empty fields stays on the login form
    When I submit the login form with empty fields
    Then the login form remains open
