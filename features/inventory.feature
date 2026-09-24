@regression
Feature: Menu & Cart
  As a hungry customer
  I want to browse dishes and manage my cart
  So that I can order the food I want

  Background:
    Given I open the application

  @sanity
  Scenario: Add and remove a dish from the cart
    When I add the dish "Green salad" to the cart
    And I open the cart
    Then the cart contains 1 items
    And the cart total is $14
    When I remove the dish "Green salad" from the cart
    Then the cart contains 0 items
    And the cart total is $0

  Scenario: Add two dishes to the cart
    When I add the dish "Green salad" to the cart
    And I add the dish "Somen Noodles" to the cart
    And I open the cart
    Then the cart contains 2 items
