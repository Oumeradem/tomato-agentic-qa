# Ordering Journey — Test Plan

**Feature:** Full Ordering Journey — browse → add to cart → cart → checkout (delivery info) → place order (payment hand-off) → order confirmation.

**Workflow:** `create-test` (Planner → Test Generator → Run/Verify)

**Status:** Approved by Planner (live app inspected 2026-09-26).

---

## Live application mapping (verified against the deployed app)

| Step                           | URL                                  | Key elements                                                                                                                                                         |
| ------------------------------ | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Browse menu                    | `/`                                  | "Top dishes near you", dish cards with "Add to cart"                                                                                                                 |
| Add to cart                    | `/`                                  | Click "Add to cart" image on a dish card → stepper appears                                                                                                           |
| Cart                           | `/cart`                              | Item rows, Cart Total (Subtotal / Delivery Fee / Total), **PROCEED TO CHECKOUT**                                                                                     |
| Checkout (delivery info)       | `/order`                             | Labelled textboxes: First name, Last name, Email address, Street, City, State, Zip code, Country, Phone (all `required`); Cart Total summary; **PROCEED TO PAYMENT** |
| Place order (payment hand-off) | `checkout.stripe.com` (hosted)       | Stripe Checkout sandbox showing order items + total + Pay                                                                                                            |
| Order confirmation             | `/verify?success=true` → `/myorders` | ✅ "THANK YOU FOR YOUR PAYMENT!", "Your order has been confirmed...", My Orders summary (items, total, "Food Processing", Track Order)                               |
| Cancelled / failed payment     | `/verify?success=false`              | Redirects to home page                                                                                                                                               |

### Notes / decisions

- **`/order` only renders with a non-empty cart** — it redirects to `/cart` when empty.
- **The payment step runs on a 3rd-party hosted Stripe page.** The card fields sit in deeply-nested, cross-origin Stripe element iframes and an invisible hCaptcha is present — completing actual card entry is **not CI-stable**. Automated coverage therefore verifies the **hand-off** to Stripe (redirect + correct order items/total), which is the part owned by our app.
- **The confirmation page only renders for a real, backend-verified order** (`/verify?success=true` with a valid orderId). Fabricated orderIds redirect home. Completing the order through the Stripe sandbox (test card) is documented as a **manual / sandbox verification step** rather than an automated test, to keep the suite reliable.
- The failed/cancelled-payment redirect (`/verify?success=false` → home) **is** reliably automatable and is covered.

## Scenarios to generate

1. **@smoke @critical** — Customer proceeds from the cart to the delivery information form
2. **@sanity** — Empty delivery form is blocked by required-field validation
3. **@smoke** — Delivery information is handed off to Stripe payment (order data + total verified)
4. **@regression** — A cancelled or failed payment returns to the home page

## Files to create / modify

- `features/ordering/ordering.feature` (new, tag `@ordering`)
- `src/pages/OrderPage.ts` (new — delivery info form + Cart Total summary)
- `src/pages/CartPage.ts` (add `proceedToCheckout()`)
- `src/fixtures/pages.ts` (register `orderPage`)
- `src/steps/ordering.steps.ts` (new)
