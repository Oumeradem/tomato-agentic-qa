@login
Feature: Authentication (Login)

  As a customer
  I want to sign in to my account
  So that I can access my profile and place orders

  # Live-app behavior verified 2026-09-24:
  # - Login modal fields: "Your email", "Password", required; "Login" submit button.
  # - The terms-of-use checkbox is required: an unchecked box blocks submit (no API call).
  # - Backend errors are surfaced as native alert() dialogs (must be handled in tests):
  #     * unknown email      -> "User Doesn't exist"
  #     * wrong password     -> "Invalid credentials"
  # - After a successful login the header "Sign In" button is replaced by a "Profile" avatar.
  # - "Create a new account? Click here" toggles to the Sign Up modal.
  #   (Note: "Already have an account? Login here" does NOT toggle back in the
  #   current build — it is static text — so no scenario asserts a back-toggle.)

  @smoke
  Scenario: Sign In button opens the Login modal
    Given I open the Tomato home page
    When I open the sign-in modal
    Then the Login modal is shown with email and password fields

  @sanity
  Scenario: Empty form is blocked by required-field validation
    Given I open the Tomato home page
    When I open the sign-in modal
    And I submit the login form with empty fields
    Then the login form is not submitted
    And the email field shows a required-field validation message

  @regression
  Scenario: Invalid email format is rejected
    Given I open the Tomato home page
    When I open the sign-in modal
    And I enter the email "not-an-email"
    And I submit the login form
    Then the login form is not submitted
    And the email field shows an email-format validation message

  @regression
  Scenario: Login is blocked until terms are accepted
    Given I open the Tomato home page
    When I open the sign-in modal
    And I enter a registered user's email and password
    And I submit the login form without accepting the terms
    Then no login request is sent

  @smoke @critical
  Scenario: Unknown email shows "User Doesn't exist"
    Given I open the Tomato home page
    And I have credentials for an unregistered account
    When I open the sign-in modal
    And I log in accepting the terms
    Then an alert "User Doesn't exist" is shown

  @smoke
  Scenario: Wrong password shows "Invalid credentials"
    Given I open the Tomato home page
    And I have a registered account
    When I open the sign-in modal
    And I log in with a wrong password accepting the terms
    Then an alert "Invalid credentials" is shown

  @smoke @critical
  Scenario: Successful login shows the profile avatar
    Given I open the Tomato home page
    And I have a registered account
    When I open the sign-in modal
    And I log in with valid credentials accepting the terms
    Then the Login modal closes
    And the header shows the profile avatar instead of the "Sign In" button

  @sanity
  Scenario: Create a new account link opens the Sign Up modal
    Given I open the Tomato home page
    When I open the sign-in modal
    And I click "Create a new account"
    Then the Sign Up modal is shown with name, email, and password fields

  @regression
  Scenario: Login modal can be closed
    Given I open the Tomato home page
    When I open the sign-in modal
    And I close the modal
    Then the Login modal is no longer shown
