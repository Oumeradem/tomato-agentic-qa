@ordering
Feature: Ordering Journey (Checkout → Payment → Confirmation)

  As a customer
  I want to complete an ordering journey from cart through payment
  So that I can place an order and have it confirmed

  # Full ordering journey behavior documented and verified 2026-09-26:
  # - Browse menu (/) → add to cart → open cart (/cart) → PROCEED TO CHECKOUT.
  # - Checkout page (/order): delivery form (First name, Last name, Email, etc.)
  #   + Cart Total summary + PROCEED TO PAYMENT.
  # - Payment page: hosted Stripe Checkout (sandbox) with order items + total.
  #   Card entry lives in deeply-nested, cross-origin iframes + hCaptcha
  #   (not CI-stable for automation; verified manually via Stripe sandbox).
  # - Success: /verify?success=true → /myorders (order confirmation).
  #   This page only renders for real, backend-verified orders (manual/Stripe step).
  # - Failure: /verify?success=false → home page (automatable redirect test).

  @regression
  Scenario: A cancelled or failed payment returns to the home page
    Given I open the Tomato order verification page for a failed payment
    Then I am returned to the Tomato home page
