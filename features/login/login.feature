Feature: User Login

  As a registered user
  I want to log in to the application
  So that I can access my dashboard

  @smoke @critical
  Scenario: Successful login with valid credentials
    Given the user is on the login page
    When the user logs in with valid credentials
    Then the dashboard should be displayed

  @regression
  Scenario: Login with invalid credentials shows an error
    Given the user is on the login page
    When the user logs in with username "invalid-user" and password "invalid-pass"
    Then the user should see an error message
