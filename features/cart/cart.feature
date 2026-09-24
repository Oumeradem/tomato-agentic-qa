@cart
Feature: Menu Browsing and Cart Management

  As a customer
  I want to browse the menu, filter dishes by category, and manage my cart
  So that I can review available dishes and verify accurate cart totals before checkout

  # Locator note: the live app renders "Butter Noodles" as "Buttter Noodles" (app typo).
  # Keep the exact UI spelling in this file so role/text locators match.
  # Checkout requires sign-in and is covered by a separate feature.

  @smoke
  Scenario: Browse the menu and filter dishes by category
    Given I open the Tomato home page
    When I select the menu category "Noodles"
    Then only noodle dishes are shown
    And the dish list includes "Buttter Noodles" priced at $14
    And no non-noodle dishes are displayed

  @sanity
  Scenario: All dishes are shown by default
    Given I open the Tomato home page
    Then "Top dishes near you" shows dishes from multiple categories
    And a salad dish and a noodle dish are both present

  @regression
  Scenario Outline: Category filter shows only matching dishes
    Given I open the Tomato home page
    When I select the menu category "<category>"
    Then the dish list includes "<dish>"
    And the dish list does not include "<other-category-dish>"

    Examples:
      | category | dish          | other-category-dish |
      | Salad    | Green salad   | Somen Noodles       |
      | Noodles  | Somen Noodles | Green salad         |
      | Rolls    | Lasagna Rolls | Green salad         |

  @smoke
  Scenario: Add a dish to the cart from the menu
    Given I open the Tomato home page
    When I add "Green salad" to the cart
    Then the quantity stepper for "Green salad" shows 1
    And "Green salad" no longer shows an "Add to cart" control

  @sanity
  Scenario: Increase the quantity of an item from the menu
    Given I open the Tomato home page
    And "Green salad" is in the cart with quantity 1
    When I increase the quantity of "Green salad"
    Then the quantity stepper for "Green salad" shows 2

  @regression
  Scenario: Removing the last unit reverts to the Add to cart control
    Given I open the Tomato home page
    And "Green salad" is in the cart with quantity 1
    When I decrease the quantity of "Green salad"
    Then "Green salad" shows an "Add to cart" control
    And "Green salad" is no longer in the cart

  @sanity
  Scenario: Multiple dishes appear as separate rows in the cart
    Given I open the Tomato home page
    When I add "Green salad" and "Veg Noodles" to the cart
    And I open the cart
    Then the cart shows a row for "Green salad" priced at $12
    And the cart shows a row for "Veg Noodles" priced at $12

  @smoke @critical
  Scenario: Cart totals are computed correctly
    Given I open the Tomato home page
    And "Buttter Noodles" is in the cart with quantity 2
    When I open the cart
    Then the "Buttter Noodles" row shows quantity 2 and a line total of $28
    And the cart Subtotal is $28
    And the Delivery Fee is $2
    And the cart Total is $30

  @sanity
  Scenario: Cart contents persist across navigation
    Given I open the Tomato home page
    And "Green salad" is in the cart with quantity 1
    When I open the cart
    And I return to the menu
    Then the quantity stepper for "Green salad" still shows 1

  @sanity
  Scenario: Items are removed from the cart one at a time
    Given I open the cart
    And "Buttter Noodles" is in the cart with quantity 2
    When I remove one "Buttter Noodles" from the cart
    Then the "Buttter Noodles" row shows quantity 1 and a line total of $14

  @regression
  Scenario: Empty cart shows zeroed totals
    Given I open the cart
    And "Green salad" is in the cart with quantity 1
    When I remove all items from the cart
    Then the cart shows no item rows
    And the Subtotal, Delivery Fee, and Total all equal $0

  @regression
  Scenario: A free item is added with a zero line total
    Given I open the Tomato home page
    When I add the $0 dish "San" to the cart
    Then the quantity stepper for "San" shows 1
    And the cart line total for "San" is $0

  @wip
  Scenario: Invalid promo code leaves cart totals unchanged
    Given I open the cart
    And "Green salad" is in the cart with quantity 1
    When I enter an invalid promo code "INVALID2026"
    Then the cart Total is unchanged
    # Live behavior: no visible error/feedback is shown - confirm the product
    # expectation before promoting this scenario beyond @wip.
