# Test Plan — View Menu Button

Workflow: Create Test (orchestrator)
Feature area: navigation
Status: Planned (awaiting approval)

## Live app findings (verified via browser)

- The home page hero renders a **button "View Menu"** (`getByRole('button', { name: 'View Menu' })`) below the heading **"Order your favourite food here"**.
- Clicking **View Menu** smooth-scrolls the page to the **"Explore our menu"** section — the section heading becomes pinned to the top of the viewport (verified: `scrollY = 575`, explore heading `top = 0`, fully in view).
- The URL does **not** change when clicking (stays `/`) — it is an in-page scroll, not navigation.
- The "Explore our menu" section renders 8 category cards: Salad, Rolls, Deserts, Sandwich, Cake, Pure Veg, Pasta, Noodles.

## Reusable framework assets

- `Given('I open the Tomato home page')` — `src/steps/navigation.steps.ts`
- `Then('the explore-menu section is in view')` — `src/steps/header.steps.ts` (asserts heading visible)
- `MenuPage` — `src/pages/MenuPage.ts` (represents the home/menu page; expose the new locators here)
- `world.pages.menuPage`, `world.pages.header` — via `src/fixtures/pages.ts`

## Scenarios

Feature: View Menu Button (`features/navigation/view-menu.feature`)

### Scenario 1: View Menu button is shown on the home page

Preconditions: none
Steps:
Given I open the Tomato home page
Then the View Menu button is visible
And the hero heading "Order your favourite food here" is visible
Priority: High
Tag: @smoke

### Scenario 2: View Menu scrolls to the Explore our menu section

Preconditions: none
Steps:
Given I open the Tomato home page
When I click the View Menu button
Then the Explore our menu section is scrolled into view
Priority: Critical
Tag: @smoke @critical

### Scenario 3: View Menu reveals the menu categories

Preconditions: none
Steps:
Given I open the Tomato home page
When I click the View Menu button
Then the menu categories are visible
Priority: Medium
Tag: @regression

### Scenario 4: View Menu keeps the user on the home page

Preconditions: none
Steps:
Given I open the Tomato home page
When I click the View Menu button
Then the page URL stays on the home page
Priority: Medium
Tag: @sanity

## Implementation notes for the Test Generator

- Add `viewMenuButton`, `heroHeading`, and `exploreMenuHeading` locators to `MenuPage`.
- "Scrolled into view" must assert the bounding box is within the viewport (e.g. `boundingClientRect().top >= 0` and `< innerHeight`) — Playwright's `toBeVisible()` alone does not prove viewport scroll.
- Reuse existing steps where possible; add thin new steps in a dedicated `view-menu.steps.ts` delegating to `MenuPage`.
- Do not hardcode URLs — use `config.baseUrl`.
