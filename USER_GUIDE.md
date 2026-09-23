# Tomato Agentic QA — User Guide for the AI Agents

A practical, example-driven guide to using the **Cline AI agents** in this repository:
Planner, Test Generator, Healer, Git, and Jira agents.

Every example in this guide uses the public demo application
**[Tomato Food Delivery](https://tomato-food-delivery-zeta.vercel.app/)** so you can follow
along with real UI elements instead of made-up ones.

> **Tip:** the agents never guess UI behavior — they inspect the live application first
> (Planner), reuse existing framework code (Test Generator), and diagnose real artifacts
> (Healer). The examples below show exactly that mindset.

---

## Table of Contents

- [1. What Are the Agents?](#1-what-are-the-agents)
- [2. How the Agents Work Together](#2-how-the-agents-work-together)
- [3. Before You Start](#3-before-you-start)
- [4. The Reference App: Tomato Food Delivery](#4-the-reference-app-tomato-food-delivery)
- [5. Planner Agent](#5-planner-agent)
- [6. Test Generator Agent](#6-test-generator-agent)
- [7. Healer Agent](#7-healer-agent)
- [8. Git Agent](#8-git-agent)
- [9. Jira Import Agent](#9-jira-import-agent)
- [10. Jira Status Agent](#10-jira-status-agent)
- [11. Skills Quick Reference](#11-skills-quick-reference)
- [12. End-to-End Walkthrough](#12-end-to-end-walkthrough)
- [13. Validation & Quality Gates](#13-validation--quality-gates)
- [14. Rules & Guardrails](#14-rules--guardrails)
- [15. Troubleshooting](#15-troubleshooting)

---

## 1. What Are the Agents?

The framework ships six ready-to-use agent definitions under `.cline/agents/`, plus
workflows (`.cline/workflows/`) and skills (`.cline/skills/`).

| Agent              | Purpose                                                                                     | Workflow it powers   |
| ------------------ | ------------------------------------------------------------------------------------------- | -------------------- |
| **Planner**        | Turns a requirement into a structured BDD test plan (no code). Inspects the live app first. | `create-test`        |
| **Test Generator** | Turns the plan into Gherkin feature files, thin step definitions, and Page Objects.         | `create-test`        |
| **Healer**         | Diagnoses and fixes a failing test (max 3 attempts, then asks you).                         | `heal-test`          |
| **Git Agent**      | Four sub-agents: **Branch**, **Commit**, **Push**, **PR**.                                  | —                    |
| **Jira Import**    | Imports generated scenarios into Jira as test cases (dedupe + approval first).              | `jira-import`        |
| **Jira Status**    | Syncs Jira issue results with the latest automation report (never PASS on FAIL).            | `jira-status-update` |

You "use" an agent by giving Cline a natural-language instruction in the relevant mode
(e.g. **Act** mode to implement, **Plan** mode to plan). The agent then loads its skill
files and follows the framework rules automatically.

---

## 2. How the Agents Work Together

The agents follow a fixed pipeline (see `.clinerules/agent-rules.md`):

```
User Requirement
      │
      ▼
┌─────────────────┐        ┌──────────────────────┐        ┌─────────────────┐
│ Planner Agent   │───────▶│ Test Generator Agent │───────▶│    Execution    │
│ (test plan only)│        │ (features+steps+POs) │        │  (npm run test) │
└─────────────────┘        └──────────────────────┘        └────────┬────────┘
                                                                    │
                                              ┌─────────────────────┴────────┐
                                              │                             │
                                              ▼                             ▼
                                         PASS: Report                FAIL: Healer Agent
                                         (Jira Status)               (≤ 3 attempts, then you)
```

Never skip ahead: the Planner plans, the Test Generator codes, the Healer fixes — each
role has a strict boundary.

---

## 3. Before You Start

### 3.1 Prerequisites

```bash
npm install
npx playwright install chromium
cp .env.example .env   # then edit values (never commit .env)
```

### 3.2 Environment variables that matter for the agents

| Variable                                                            | Purpose                                              | Example                                         |
| ------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| `ENV`                                                               | Target environment (`dev` / `qa` / `stage` / `prod`) | `ENV=qa`                                        |
| `BASE_URL`                                                          | Overrides the environment base URL                   | `https://tomato-food-delivery-zeta.vercel.app/` |
| `USERNAME` / `PASSWORD`                                             | Credentials used by `config.credentials.*`           | `demo` / `password`                             |
| `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT_KEY` | Jira integration                                     | —                                               |

### 3.3 Pointing the framework at the Tomato site

Open `src/config/environments/qa.ts` (or your target env file) and set the base URL:

```ts
// src/config/environments/qa.ts
export const qa: EnvironmentConfig = {
  name: 'qa',
  baseUrl: 'https://tomato-food-delivery-zeta.vercel.app', // <-- real app
  appTitle: 'Food Del',
};
```

The agents will then generate code that uses `config.baseUrl` — never a hardcoded URL.

### 3.4 How to invoke an agent

Give Cline a clear instruction in **Act** mode, e.g.:

> Create a BDD test for adding a dish to the cart on the Tomato Food Delivery app.

Cline routes this through the Planner → Test Generator pipeline automatically.
To invoke a specific skill explicitly (e.g. locator guidance), reference it:

---

## 4. The Reference App: Tomato Food Delivery

The examples below use these real elements from
[`https://tomato-food-delivery-zeta.vercel.app/`](https://tomato-food-delivery-zeta.vercel.app/):

**Home page (`/`)** — header navigation (`Home`, `Menu`, `Mobile App`, `Contact Us`),
a **Search** icon, a **Cart** link (`/cart`), a **Sign In** button, hero heading
"Order your favourite food here", a **View Menu** button, the "Explore our menu" category
row (Salad, Rolls, Deserts, Sandwich, Cake, Pure Veg, Pasta, Noodles), the "Top dishes
near you" grid (e.g. Green salad `$12`, Veg salad `$12`, Somen Noodles `$20`), and each
dish card has an **Add to cart** image.

**Login modal (opened by "Sign In")** — heading **Login**, textbox **Your email**,
textbox **Password**, **Login** button, terms checkbox, and the
"Create a new account? Click here" link.

**Cart page (`/cart`)** — cart table (Items / Name / Price / Quantity / Total / Remove),
**Cart Total** panel (Subtotal, Delivery Fee, Total), the **PROCEED TO CHECKOUT** button,
and a **Promo code** textbox with a **Submit** button.

> **Note:** on the real site the "Add to cart" control is an `<img>` with alt text
> `"Add to cart"` — a great real-world example of why the Planner inspects the live DOM
> before choosing locators. The correct locator there is
> `getByRole('img', { name: 'Add to cart' })` (the alt text provides the accessible name).

---

## 5. Planner Agent

### 5.1 What it does

Converts a requirement into a structured BDD **test plan** (markdown under `specs/`).
It does **not** write code. It inspects the live app first so scenarios match the real UI.

### 5.2 Example request

> Plan test coverage for the shopping cart on the Tomato Food Delivery app.
> Focus on adding items to the cart and the cart total. Inspect the live site first.

### 5.3 What the Planner does

1. Browses `https://tomato-food-delivery-zeta.vercel.app/` and `/cart`.
2. Notes the real elements (dish cards, "Add to cart" images, Cart Total panel,
   PROCEED TO CHECKOUT button, promo-code box).
3. Searches `src/pages/` and `src/steps/` for reusable objects (e.g. `BasePage`,
   the existing `login.steps.ts`).
4. Asks for approval to write `specs/cart-test-plan.md`.

### 5.4 Example plan output

```text
Test Plan
---------
Feature: Shopping Cart

Scenario 1: Add a dish to the cart from the menu
Preconditions: none
Steps:
  Given the customer is on the home page
  When the customer adds "Green salad" to the cart
  Then the cart should contain "Green salad"
Priority: High
Tag: @smoke @critical

Scenario 2: Cart subtotal updates when several dishes are added
Preconditions: empty cart
Steps:
  Given the customer is on the home page
  When the customer adds "Green salad" to the cart
  And the customer adds "Somen Noodles" to the cart
  Then the cart subtotal should be $32
Priority: High
Tag: @regression

Scenario 3: Empty cart state
Preconditions: none
Steps:
  Given the customer opens the cart page
  Then the cart should be empty
Priority: Medium
Tag: @sanity

Scenario 4: Promo code submission with an invalid code
Preconditions: none
Steps:
  Given the customer opens the cart page
  When the customer applies promo code "TOMATO10"
  Then the cart should show an invalid promo code message
Priority: Medium
Tag: @regression
```

The Planner then presents this summary and the intended file path
(`specs/cart-test-plan.md`), and **only writes the file after you approve**.

### 5.5 Planner checklist

- [ ] Inspected the live application (real labels/behaviors)
- [ ] Covered positive, negative, boundary, empty-state
- [ ] Identified reusable steps / Page Objects
- [ ] Assigned priority + suite tags
- [ ] Got approval before writing `specs/`

> Use the locator-strategy skill before writing any locators for the cart page.

---

## 6. Test Generator Agent

### 6.1 What it does

Turns the Planner's test plan into working BDD automation: Gherkin feature files under
`features/`, thin step definitions under `src/steps/`, and Page Objects under `src/pages/`
**only when needed**. It reuses existing framework code first.

### 6.2 Example request

> Generate the tests for the cart test plan in `specs/cart-test-plan.md`.
> Reuse existing steps and Page Objects where possible.

### 6.3 Generated feature file

```gherkin
# features/cart/cart.feature
Feature: Shopping Cart

  As a hungry customer
  I want to add dishes to my cart
  So that I can place my order

  @smoke @critical
  Scenario: Add a dish to the cart from the menu
    Given the customer is on the home page
    When the customer adds "Green salad" to the cart
    Then the cart should contain "Green salad"

  @regression
  Scenario: Cart subtotal updates when several dishes are added
    Given the customer is on the home page
    When the customer adds "Green salad" to the cart
    And the customer adds "Somen Noodles" to the cart
    Then the cart subtotal should be $32

  @sanity
  Scenario: Empty cart state
    Given the customer opens the cart page
    Then the cart should be empty
```

> Note the Gherkin describes **business behavior**, not DOM. No
> `click the element with id "add-to-cart"` anywhere.

### 6.4 Generated Page Object

The Test Generator reuses `BasePage`, follows locator priority, and uses
`config.baseUrl`:

```ts
// src/pages/home/HomePage.ts
import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { config } from '../../config/config';
import { CartPage } from '../cart/CartPage';

export class HomePage extends BasePage {
  private readonly heroHeading: Locator;
  private readonly dishCards: Locator;

  constructor(page: Page) {
    super(page);
    this.heroHeading = page.getByRole('heading', {
      name: 'Order your favourite food here',
    });
    // Each dish card is a container filtered by the dish name; the add button
    // is an <img> whose accessible name (alt text) is "Add to cart".
    this.dishCards = page.locator('[class*="food-item"]');
  }

  async open(): Promise<void> {
    await this.goto(config.baseUrl);
  }

  async addDishToCart(dishName: string): Promise<void> {
    const card = this.dishCards.filter({ hasText: dishName });
    await card.getByRole('img', { name: 'Add to cart' }).click();
  }
}
```

```ts
// src/pages/cart/CartPage.ts
import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { config } from '../../config/config';

export class CartPage extends BasePage {
  private readonly cartTotalHeading: Locator;
  private readonly subtotal: Locator;
  private readonly proceedToCheckout: Locator;

  constructor(page: Page) {
    super(page);
    this.cartTotalHeading = page.getByRole('heading', { name: 'Cart Total' });
    this.subtotal = page.getByText('Subtotal').locator('..').getByText(/^\$/);
    this.proceedToCheckout = page.getByRole('button', {
      name: 'PROCEED TO CHECKOUT',
    });
  }

  async open(): Promise<void> {
    await this.goto(`${config.baseUrl}/cart`);
  }

  async getSubtotal(): Promise<string> {
    return (await this.subtotal.textContent()) || '';
  }
}
```

### 6.5 Generated step definitions (thin)

```ts
// src/steps/cart.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { World } from '../support/world';

Given('the customer is on the home page', async function (this: World): Promise<void> {
  await this.homePage.open();
});

When(
  'the customer adds {string} to the cart',
  async function (this: World, dish: string): Promise<void> {
    await this.homePage.addDishToCart(dish);
  },
);

Then('the cart should contain {string}', async function (this: World, dish: string): Promise<void> {
  await expect(this.page.getByText(dish).first()).toBeVisible();
});

Then(
  'the cart subtotal should be ${int}',
  async function (this: World, amount: number): Promise<void> {
    const subtotal = await this.cartPage.getSubtotal();
    expect(subtotal).toBe(`$${amount}`);
  },
);
```

### 6.6 Validation

The Test Generator runs the new test and fixes obvious issues before handing off:

```bash
npx cucumber-js features/cart/cart.feature
```

---

## 7. Healer Agent

### 7.1 What it does

Diagnoses and fixes a **failing test** using the error message, screenshot, trace,
Page Object, and feature file. Maximum **3 attempts** — then it stops and asks you.

### 7.2 Example failure

Suppose a run reports:

```
FAIL "Add a dish to the cart from the menu"
Timeout 15000ms exceeded: locator.getByRole('img', { name: 'Add to cart' })
```

### 7.3 How the Healer works through it

1. **Analyze** — reads the error, opens the screenshot and trace,
   reads `HomePage.ts` and `cart.feature`.
2. **Attempt #1** — the locator `getByRole('img', { name: 'Add to cart' })` was chosen
   from the live site, but the `dishCards` filter `[class*="food-item"]` no longer matches
   (the dev renamed the CSS class). Fix: scope the dish card by the dish's paragraph text.
   Re-run → still fails.
3. **Attempt #2** — inspects the new trace: the click lands but nothing is added.
   Root cause: the dish card is located correctly now, but an overlapping element
   intercepts the click. Fix: wait for the card to be stable with `expect(card).toBeVisible()`
   before clicking the image. Re-run → passes.
4. **Validate** — reports the root cause and the successful fix.

### 7.4 What the Healer will NEVER do

- Disable an assertion or delete/skip the test
- Add `page.waitForTimeout(...)` to "fix" timing
- Replace a good role locator with a brittle XPath
- Modify unrelated code or change the requirement

### 7.5 When the Healer stops

After 3 failed attempts it reports the failure, the 3 attempts made, and a recommended
next action — then waits for your decision.

---

## 8. Git Agent

The Git Agent is composed of four sub-agents. All follow `.clinerules/git-rules.md`.

### 8.1 Branch Agent

> Create a branch for the cart tests.

1. Checks the current branch (`git branch --show-current`) — never works on `main`
   without approval.
2. Creates the branch from the latest `main`:

```bash
git checkout main && git pull && git checkout -b test/cart-suite
```

Valid prefixes: `feature/`, `bugfix/`, `test/`, `chore/` — lowercase, hyphenated.

### 8.2 Commit Agent

> Commit the cart tests.

1. Runs `git status` and `git diff` to review.
2. Verifies no secrets (scans the diff for tokens/passwords; confirms `.env` is ignored).
3. Stages only relevant files (never `reports/`, `screenshots/`, `traces/`).
4. Creates a Conventional Commit:

```text
test: add cart BDD coverage

- feature file for shopping cart scenarios
- HomePage and CartPage page objects
- thin cart step definitions
```

Types: `feat`, `fix`, `test`, `chore`, `docs`, `refactor`, `build`.

### 8.3 Push Agent

> Push the branch.

Pre-push checks: correct branch, clean status, remote configured, no secrets,
`npm run typecheck` + `npm run lint` pass. Then — **only after your approval**:

```bash
git push -u origin test/cart-suite
```

### 8.4 PR Agent

> Open a PR for test/cart-suite.

Creates a PR with:

- **Title:** `test: add cart BDD coverage`
- **Summary:** why the tests were added and what changed
- **Test coverage:** the 3 cart scenarios + tag breakdown
- **Important changes:** `features/cart/cart.feature`, `src/pages/cart/CartPage.ts`, …
- **Validation:** typecheck, lint, and `npx cucumber-js features/cart/cart.feature` results
- **Known failures:** e.g. "Promo-code scenario skipped — not yet implemented"
- **Linked Jira:** `QA-123` when applicable

It never merges, force-pushes, or closes issues without your instruction.

---

## 9. Jira Import Agent

### 9.1 What it does

Imports generated scenarios from feature files into **Jira test cases**, preserving
feature, scenario, preconditions, steps, expected results, tags, and priority.

### 9.2 Configuration

```bash
# .env (never commit real values)
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_EMAIL=qa-bot@company.com
JIRA_API_TOKEN=xxxxxxxx
JIRA_PROJECT_KEY=QA
```

### 9.3 Example request

> Import the cart scenarios from `features/cart/cart.feature` into Jira.

The agent will:

1. Read `features/cart/cart.feature`.
2. **Search Jira for duplicates first** (e.g. search `"Add a dish to the cart from the menu"`).
3. If an equivalent test exists → reports the existing issue, does **not** duplicate.
4. Otherwise prepares the test cases and **asks your approval** before creating.
5. Creates issues only after approval, using the configured Jira integration.

> The agent never creates duplicate issues blindly and never logs credentials.

---

## 10. Jira Status Agent

### 10.1 What it does

Synchronizes Jira test issues with the **latest automation report**
(`reports/cucumber-report/cucumber-report.json` or Allure results).

### 10.2 Example request

> Update Jira with the results from the latest cart test run.

The agent:

1. Reads the latest `reports/cucumber-report/cucumber-report.json`.
2. Classifies scenarios as passed / failed / skipped.
3. Maps each scenario to its Jira issue (by summary / tag).
4. Updates each issue with: result, execution timestamp, environment (`qa`), browser
   (`chromium`), and failure details when applicable.
5. Links the report URL when configured.

### 10.3 The critical rule

> **Never mark a test PASS if the latest automation result is FAIL.**

If `Add a dish to the cart from the menu` reports `failed`, the Jira issue is updated
to FAILED (with error/screenshot info) — never PASS. Updates are always based on the
**latest** report only, and issues are never closed or deleted without approval.

---

## 11. Skills Quick Reference

Skills are the framework conventions the agents load before acting. You can also ask
Cline to use a specific one explicitly.

| Skill                    | When you'd reference it                                            |
| ------------------------ | ------------------------------------------------------------------ |
| `test-design`            | Planning scenario coverage (positive/negative/boundary/validation) |
| `cucumber`               | Before writing feature files or step definitions                   |
| `playwright`             | Before writing browser automation code                             |
| `page-object-model`      | Before creating or extending Page Objects                          |
| `locator-strategy`       | Before writing any locator                                         |
| `test-healing`           | Diagnosing a failing test                                          |
| `environment-management` | Configuring envs or credentials                                    |
| `reporting`              | Generating / interpreting Allure and Cucumber reports              |
| `git`                    | Any Git operation                                                  |
| `jira`                   | Importing scenarios or updating statuses in Jira                   |

Example prompts:

> Use the **locator-strategy** skill to pick locators for the Login modal
> (Your email / Password / Login button).

> Use the **page-object-model** skill to add a `Header` component for the
> Tomato app navigation.

> Use the **reporting** skill to explain why `npm run report:allure` is empty.

---

## 12. End-to-End Walkthrough

The full **Create Test** workflow (`.cline/workflows/create-test.md`) for a real
requirement on the Tomato app:

**Requirement:** "As a customer, I want to see the menu filtered by category
(e.g. only Noodles), so I can browse faster."

### Step 1 — Planner

> Plan BDD coverage for menu category filtering on the Tomato Food Delivery app.
> Inspect the live home page's "Explore our menu" category row first.

Planner output (after inspecting the site): scenarios for filtering by a category,
switching categories, and the empty/default state. Saves `specs/menu-filtering-test-plan.md`
**after your approval**.

### Step 2 — Test Generator

> Generate tests from `specs/menu-filtering-test-plan.md`, reusing existing framework.

Generates `features/menu/menu-filtering.feature`, `src/pages/home/HomePage.ts` (extends
`BasePage`), thin steps, and runs them:

```bash
npx cucumber-js features/menu/menu-filtering.feature
```

### Step 3 — Healer (if needed)

If a scenario fails, the Healer diagnoses (screenshot + trace), applies the smallest fix,
and re-runs. Max 3 attempts.

### Step 4 — Git Agent

> Branch `test/menu-filtering`, commit `test: add menu filtering coverage`,
> push, open a PR.

### Step 5 — Jira (optional)

> Import `features/menu/menu-filtering.feature` into Jira (dedupe + approval),
> then after the run: update Jira statuses from the latest report.

---

## 13. Validation & Quality Gates

Run these before letting the Git Agent commit (the agents run them, and so can you):

```bash
npm run lint          # ESLint
npm run format:check  # Prettier
npm run typecheck     # tsc --noEmit
npm run test:smoke    # @smoke scenarios
npm run test:regression  # @regression scenarios
```

Useful run variants for the Tomato site:

```bash
ENV=qa npm test                        # default environment
ENV=qa BROWSER=firefox npm test        # cross-browser
ENV=qa HEADLESS=false npm test         # headed, watch it live
npx cucumber-js features/cart/cart.feature  # single feature
npm run test:critical                  # only @critical
```

---

## 14. Rules & Guardrails

- **Approval required** for anything destructive: deleting files/tests/Page Objects,
  resetting history, force-pushing, deleting branches, closing Jira issues, or modifying
  production config. The agent stops and explains _what / why / what's affected_.
- **No secrets anywhere**: credentials come from `.env`, never from code, feature files,
  logs, or reports.
- **No arbitrary waits**: Playwright auto-waiting only.
- **No XPath without reason**; role locators first (`getByRole` → `getByLabel` →
  `getByPlaceholder` → `getByText` → `getByTestId` → stable CSS → XPath).
- **One feature file per domain**, tags on every scenario.
- **Thin steps** — business logic lives in Page Objects.
- **Never work on `main`** without explicit approval; Conventional Commits only.
- **Healer limit**: 3 attempts, then ask the user.

---

## 15. Troubleshooting

| Symptom                                         | What to do                                                                                    |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| "Port 3000 in use"                              | The demo server uses port **3100** on purpose; don't run your local app on it.                |
| `allure: command not found`                     | Use `npx allure ...` or `npm run report:allure` (binary ships with the devDependency).        |
| Allure report empty                             | Make sure the format is `allure-cucumberjs/reporter` (with `/reporter`) in `cucumber.js`.     |
| Tests hit `localhost` instead of the Tomato app | Set `baseUrl` in `src/config/environments/*.ts` or `BASE_URL` in `.env`.                      |
| Credentials empty in tests                      | Fill `USERNAME` / `PASSWORD` in `.env` (the agents never hardcode them).                      |
| Jira skill not working                          | Ensure `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT_KEY` are set in `.env`. |
| Step timeout                                    | Override `STEP_TIMEOUT` (ms) in env; default is 60s.                                          |
| "Healer gave up"                                | Expected after 3 attempts — provide the failure + artifacts and decide the next step.         |
