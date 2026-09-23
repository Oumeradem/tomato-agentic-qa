# Tomato Agentic QA — Agents User Guide

A practical guide to the **AI agents** that ship with this Playwright + TypeScript + Cucumber BDD
framework. Every example in this guide uses the **Tomato Food Delivery** web app at
<https://tomato-food-delivery-zeta.vercel.app/> so you can follow along with a real application.

---

## Table of Contents

1. [What Are the Agents?](#1-what-are-the-agents)
2. [How the Agents Work Together](#2-how-the-agents-work-together)
3. [Before You Start](#3-before-you-start)
4. [Planner Agent — Plan Test Coverage](#4-planner-agent--plan-test-coverage)
5. [Test Generator Agent — Turn Plans into Code](#5-test-generator-agent--turn-plans-into-code)
6. [Healer Agent — Fix Failing Tests](#6-healer-agent--fix-failing-tests)
7. [Git Agent — Branch, Commit, Push, PR](#7-git-agent--branch-commit-push-pr)
8. [Jira Import & Jira Status Agents](#8-jira-import--jira-status-agents)
9. [Skills at a Glance](#9-skills-at-a-glance)
10. [Prebuilt Workflows](#10-prebuilt-workflows)
11. [Command Reference](#11-command-reference)
12. [Example Prompt Library](#12-example-prompt-library)
13. [Guardrails You Should Know](#13-guardrails-you-should-know)
14. [Troubleshooting & Tips](#14-troubleshooting--tips)

---

## 1. What Are the Agents?

The repository ships ready-to-use **Cline agent definitions** (`.cline/agents/`), **skills**
(`.cline/skills/`), and **workflows** (`.cline/workflows/`). Each agent is a specialized role with
strict boundaries — it never does another agent's job.

| Agent | Location | What it does |
| --- | --- | --- |
| **Planner** | `.cline/agents/planner/planner-agent.md` | Turns a requirement into a structured BDD test plan. Inspects the **live app** with the browser before proposing scenarios. Never writes code. |
| **Test Generator** | `.cline/agents/test-generator/test-generator-agent.md` | Turns a Planner's plan into Gherkin feature files, thin step definitions, and Page Objects. Reuses existing framework code. |
| **Healer** | `.cline/agents/healer/healer-agent.md` | Diagnoses and repairs failing tests. **Max 3 attempts**, then it stops and asks you. Never masks a real failure. |
| **Git Agent** (4 sub-agents) | `.cline/agents/git/` | `branch-agent`, `commit-agent`, `push-agent`, `pr-agent` — safe Git operations following the team's conventions. |
| **Jira Import** | `.cline/agents/jira-import/jira-import-agent.md` | Converts feature-file scenarios into Jira test issues. Searches for duplicates first; creates only after your approval. |
| **Jira Status** | `.cline/agents/jira-status/jira-status-agent.md` | Synchronizes Jira issue results with the latest test report. Never marks a test PASS when the latest run was FAIL. |

The agents follow the rules in `.clinerules/` (agent roles, approvals, architecture, coding
standards, Cucumber, environment, Git, locators, Playwright, security). You can paste those rules
into any AI coding assistant, or let the agents reference the skills automatically.

### How to call a single agent

Each agent is a **Cline agent definition** (`.cline/agents/<name>/<name>-agent.md`). You can call
any one of them directly — you do not have to run the whole pipeline. Three ways:

**1. Agent mention / agent mode (Cline)** — select the agent in the agent dropdown, or reference
it in your prompt with `@<name>`:

| Call it with | Definition file |
| --- | --- |
| `@planner-agent` | `.cline/agents/planner/planner-agent.md` |
| `@test-generator-agent` | `.cline/agents/test-generator/test-generator-agent.md` |
| `@healer-agent` | `.cline/agents/healer/healer-agent.md` |
| `@branch-agent` / `@commit-agent` / `@push-agent` / `@pr-agent` | `.cline/agents/git/<name>.md` |
| `@jira-import-agent` | `.cline/agents/jira-import/jira-import-agent.md` |
| `@jira-status-agent` | `.cline/agents/jira-status/jira-status-agent.md` |

> The only agent with an explicit `name:` frontmatter is the Planner (`planner-agent`); the rest
> are identified by their folder + file name.

**2. Point the assistant at the definition** — works in any coding assistant:

> "Read `.cline/agents/planner/planner-agent.md` and act as that agent: plan BDD coverage for the
> Tomato Food Delivery cart flow."

**3. Paste the definition** — attach the agent's markdown file and add your task in business
language.

Keep the prompt scoped to that agent's job: ask the Planner only to plan, the Healer only to heal,
the PR agent only to open a PR. Single-agent prompt examples for every agent are in Section 12.

---

## 2. How the Agents Work Together

Agents operate as a **pipeline**, not in isolation:

```text
User Requirement
       ↓
Planner Agent          ← inspects the live Tomato site first
       ↓
Structured Test Plan   ← specs/<feature>-test-plan.md (after your approval)
       ↓
Test Generator Agent   ← reuses existing pages/steps
       ↓
Feature + Steps + Page Objects
       ↓
Test Execution
       ↓
  ┌───────────────┐
  │               │
 PASS           FAIL
  │               │
  ↓               ↓
Report        Healer Agent   ← max 3 attempts
                  ↓
           ┌──────┴──────┐
           │             │
         PASS           FAIL
           │             │
           ↓             ↓
        Report       Ask User
```

Optional Jira flow:

```text
Feature/Scenarios
       ↓
Jira Import Agent        ← search for duplicates first
       ↓
Jira Test Issues
       ↓
Automation Execution
       ↓
Latest Report            ← reports/cucumber-report/cucumber-report.json
       ↓
Jira Status Update Agent ← never PASS on FAIL
```

---

## 3. Before You Start

### 3.1 Prerequisites

- Node.js ≥ 18 and npm installed.
- Playwright browsers installed: `npx playwright install chromium`.
- Dependencies installed: `npm install`.
- A `.env` file (copy from `.env.example`).

### 3.2 Point the framework at the Tomato site

The framework **never hardcodes URLs** — it reads `config.baseUrl`. To target the Tomato Food
Delivery app for your examples, either set the environment variable or update the environment
config.

**Option A — via `.env` (recommended for one-off runs):**

```bash
# .env
ENV=qa
BASE_URL=https://tomato-food-delivery-zeta.vercel.app
BROWSER=chromium
HEADLESS=true
```

**Option B — via the environment module** (`src/config/environments/qa.ts`):

```ts
export const qa: EnvironmentConfig = {
  name: 'qa',
  baseUrl: 'https://tomato-food-delivery-zeta.vercel.app',
  appTitle: 'Food Del',
};
```

> ⚠️ `BASE_URL` set in `.env` always overrides the environment module — useful when you don't want
> to touch source files.

### 3.3 Credentials

Never type credentials into prompts or source code. Put them in `.env` (git-ignored) and access
them through `config.credentials.*`. The Tomato site's **Sign In modal** creates accounts at
runtime, so for automation you typically create a dedicated test account once and store it in
`.env`:

```bash
USERNAME=qa-tomato-user
PASSWORD=<a-real-test-password>
```

---

## 4. Planner Agent — Plan Test Coverage

### What it does

The Planner converts a requirement into a **structured BDD test plan** — and only that. It:

1. Reads and understands the requirement.
2. **Inspects the live application** (Playwright browser / Playwright MCP) to confirm real labels,
   buttons, headings, and behavior — it never guesses.
3. Identifies user journeys and the pages/components involved.
4. Enumerates scenario categories: positive, negative, boundary, validation, empty-state.
5. Searches `src/pages/` and `src/steps/` for reusable steps and Page Objects.
6. Assigns priority and suite tags (`@smoke`, `@sanity`, `@critical`, `@regression`, `@wip`).
7. Saves the plan under `specs/<feature>-test-plan.md` — **only after you explicitly approve** the
   path and summary.

### How to invoke it

Keep prompts in business language. Name the feature and the flows you care about:

> "Plan BDD coverage for the Tomato Food Delivery shopping cart flow. A customer should be able to
> browse the menu on the home page, add a dish to the cart, see the cart totals, and apply a promo
> code. Inspect the live site first, then produce a structured test plan."

### What you get back

A markdown plan in `specs/<feature>-test-plan.md` (after approval), formatted like:

```text
Test Plan
---------
Feature: Shopping Cart

Scenario 1: Add a dish to the cart from the home page
Preconditions: None (public home page)
Steps:
  Given the user is on the Tomato home page
  When the user adds "Green salad" to the cart
  Then the cart should contain 1 item
Priority: High
Tag: @smoke

Scenario 2: Cart totals reflect the selected dishes
Preconditions: None
Steps:
  Given the user is on the Tomato home page
  When the user adds "Green salad" to the cart
  And the user adds "Somen Noodles" to the cart
  Then the user opens the cart
  Then the cart should show subtotal and delivery fee entries
Priority: Medium
Tag: @regression

Scenario 3: Apply a promo code in the cart
Preconditions: Cart contains at least one dish
Steps:
  Given the user is on the Tomato home page
  And the user adds "Green salad" to the cart
  When the user opens the cart
  And the user applies promo code "SAVE10"
  Then a promo confirmation is shown
Priority: Medium
Tag: @regression
```

Because the Planner uses the browser, the plan reflects what is actually on
`tomato-food-delivery-zeta.vercel.app` — the **Sign In modal** (`Your email` / `Password` fields),
the **Explore our menu** category cards (Salad, Rolls, Deserts, Sandwich, Cake, Pure Veg, Pasta,
Noodles), dish cards under **Top dishes near you** (e.g. *Green salad*, *Somen Noodles*), the
**Cart** page (`PROCEED TO CHECKOUT` button, `Promo code` textbox + `Submit`) — rather than
assumptions.

> **Boundary:** the Planner never generates `.feature` files or step definitions. That's the Test
> Generator's job.

---

## 5. Test Generator Agent — Turn Plans into Code

 What it does

The Test Generator takes the Planner's plan and produces working BDD automation:

- Feature files under `features/`
- Thin step definitions under `src/steps/`
- Page Objects under `src/pages/` — **only when needed**
- Supporting utilities if required

It follows the framework rules: **search before creating** (reuse existing Page Objects and
steps), use the locator priority (`getByRole` → `getByLabel` → `getByPlaceholder` → `getByText`
→ `getByTestId` → stable CSS → XPath), keep steps thin, and never hardcode URLs or credentials.

### Example — cart flow for the Tomato site

**Input:** the Shopping Cart plan from the Planner (Section 4).

**Output 1 — feature file** `features/cart/cart.feature`:

```gherkin
Feature: Shopping Cart

  As a hungry customer
  I want to add dishes to my cart
  So that I can order my favourite food

  @smoke
  Scenario: Add a dish to the cart from the home page
    Given the user is on the Tomato home page
    When the user adds "Green salad" to the cart
    Then the cart should contain 1 item

  @regression
  Scenario: Cart totals reflect the selected dishes
    Given the user is on the Tomato home page
    When the user adds "Green salad" to the cart
    And the user adds "Somen Noodles" to the cart
    When the user opens the cart
    Then the cart should show subtotal and delivery fee entries

  @regression
  Scenario: Apply a promo code in the cart
    Given the user is on the Tomato home page
    And the user adds "Green salad" to the cart
    When the user opens the cart
    And the user applies promo code "SAVE10"
    Then a promo confirmation is shown
```

**Output 2 — Page Object** `src/pages/home/HomePage.ts` (extends `BasePage`, locators first):

```ts
import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { config } from '../../config/config';

/**
 * Tomato home page — hero, menu categories, and dish cards.
 */
export class HomePage extends BasePage {
  private readonly heroHeading = this.page.getByRole('heading', {
    name: 'Order your favourite food here',
  });

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.gotoPath('/');
  }

  async isLoaded(): Promise<void> {
    await this.heroHeading.waitFor({ state: 'visible', timeout: config.timeout.expect });
  }

  /** Adds a dish by its card name (the "Add to cart" control lives on the same card). */
  async addToCart(dishName: string): Promise<void> {
    const dishCard = this.page.locator('div').filter({ hasText: dishName }).last();
    await dishCard.getByRole('img', { name: 'Add to cart' }).click();
  }
}
```

**Output 3 — Page Object** `src/pages/cart/CartPage.ts`:

```ts
import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { config } from '../../config/config';

/**
 * Tomato cart page — /cart
 */
export class CartPage extends BasePage {
  private readonly itemsColumn = this.page.getByText('Items', { exact: true });
  private readonly subtotalRow = this.page.getByText('Subtotal', { exact: true });
  private readonly deliveryFeeRow = this.page.getByText('Delivery Fee', { exact: true });
  private readonly proceedToCheckout = this.page.getByRole('button', {
    name: 'PROCEED TO CHECKOUT',
  });
  private readonly promoCodeInput = this.page.getByLabel('Promo code');
  private readonly promoSubmit = this.page.getByRole('button', { name: 'Submit' });

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.gotoPath('/cart');
  }

  async isLoaded(): Promise<void> {
    await this.itemsColumn.waitFor({ state: 'visible', timeout: config.timeout.expect });
  }

  async isSubtotalVisible(): Promise<boolean> {
    return this.subtotalRow.isVisible();
  }

  async isDeliveryFeeVisible(): Promise<boolean> {
    return this.deliveryFeeRow.isVisible();
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.fill(this.promoCodeInput, code);
    await this.click(this.promoSubmit);
  }
}
```

**Output 4 — thin steps** `src/steps/cart.steps.ts`:

```ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { World } from '../support/world';

Given('the user is on the Tomato home page', async function (this: World): Promise<void> {
  await this.homePage.open();
  await this.homePage.isLoaded();
});

When('the user adds {string} to the cart', async function (this: World, dish: string): Promise<void> {
  await this.homePage.addToCart(dish);
});

When('the user opens the cart', async function (this: World): Promise<void> {
  await this.cartPage.open();
  await this.cartPage.isLoaded();
});

When('the user applies promo code {string}', async function (this: World, code: string): Promise<void> {
  await this.cartPage.applyPromoCode(code);
});

Then('the cart should contain {int} item(s)', async function (this: World, count: number): Promise<void> {
  // Quantity per item is rendered in the cart table; assert against the row count.
  await expect(this.page.getByText(count.toString(), { exact: true })).toBeVisible();
});

Then('the cart should show subtotal and delivery fee entries', async function (this: World): Promise<void> {
  expect(await this.cartPage.isSubtotalVisible()).toBe(true);
  expect(await this.cartPage.isDeliveryFeeVisible()).toBe(true);
});
```

### Wiring new Page Objects into the World

When the generator creates a new Page Object, it must also:

1. Import it in `src/support/world.ts` and expose it as a property (e.g. `homePage!: HomePage`).
2. Instantiate it in the `Before` hook in `src/hooks/hooks.ts` (e.g.
   `this.homePage = new HomePage(this.page);`).

### Validation

After generation, the agent runs the new test and fixes obvious issues:

```bash
ENV=qa BASE_URL=https://tomato-food-delivery-zeta.vercel.app npm run test:smoke
```

> **Boundary:** the Test Generator writes code but does not change requirements, and it never
> disables assertions or adds arbitrary waits to force a pass.

---

## 6. Healer Agent — Fix Failing Tests

### When to use it

A scenario fails in a run (locally or in CI). Ask the Healer to diagnose and repair it. It:

1. Analyzes the failed test, the error message, the screenshot, the trace, the relevant Page
   Object, and the feature file.
2. Identifies the probable **root cause**.
3. Applies the **smallest fix**.
4. Re-runs the affected test after each attempt and validates.

### The 3-attempt limit (critical)

```text
Attempt #1 → run → fail?
Attempt #2 → run → fail?
Attempt #3 → run → fail?
→ STOP and ask the user
```

After **3 failed attempts** the Healer stops, reports the failure, lists the 3 attempts, proposes a
next action, and asks you for help. It never silently attempts a 4th fix.

### What the Healer must NEVER do

- Disable assertions
- Delete or skip tests/scenarios
- Add arbitrary waits (`waitForTimeout`) to force a pass
- Replace good locators with XPath unnecessarily
- Modify unrelated code or change requirements
- Hide failures

### Example — a flaky "Add to cart" locator on the Tomato site

**Symptom:** `Then the cart should contain 1 item` fails. The screenshot shows the dish card is
rendered but the click missed.

**Healer analysis:**
1.Reads the error: `Timeout waiting for locator('div').filter({ hasText: "Green salad" })...`
2. Inspects the screenshot + trace — the card exists; the card-scoped `div` filter matched several
   containers, so the click went to the wrong node.
3. Checks the live DOM on `tomato-food-delivery-zeta.vercel.app` — each dish card contains an
   `<img>` with `alt="Add to cart"` next to the dish name.
4. Root cause: ambiguous `div` scoping.

**Smallest fix — constrain the card to the dish name text and click the image by accessible name:**

```ts
async addToCart(dishName: string): Promise<void> {
  const card = this.page.getByText(dishName, { exact: true }).locator('..').locator('..');
  await card.getByRole('img', { name: 'Add to cart' }).click();
}
```

5.Re-runs the scenario → passes. Done.

If the fix had failed, the Healer would retry with the next smallest hypothesis (max 3 attempts)
and then escalate to you.

> **Tip:** screenshots go to `screenshots/`, traces to `traces/`, and the scenario error is
> attached in the Allure report — point the Healer at these artifacts.

---

## 7. Git Agent — Branch, Commit, Push, PR

The Git Agent is split into four sub-agents. It never works directly on `main` and it never
pushes without your approval.

### Branch Agent

Creates properly named branches from the latest `main`:

| Prefix | Use case |
| --- | --- |
| `feature/<description>` | New functionality / test scenarios |
| `bugfix/<description>` | Fixing a failing selector or test |
| `test/<description>` | Adding test coverage |
| `chore/<description>` | Maintenance (deps, config) |

Example for the Tomato cart tests:

```bash
git checkout main && git pull
git checkout -b feature/tomato-cart-tests
```

### Commit Agent

Reviews the working tree and produces **Conventional Commits**:

```text
<type>(<scope>): <description>
```

Examples:

```bash
git add features/cart/cart.feature src/pages/home/HomePage.ts \
        src/pages/cart/CartPage.ts src/steps/cart.steps.ts
git commit -m "test: add shopping cart flow coverage for Tomato site"
```

The Commit Agent first checks `git status` and `git diff`, verifies **no secrets** are staged
(`.env`, tokens, passwords), and never commits `reports/`, `screenshots/`, `traces/`, or
`node_modules/`.

### Push Agent

Pushes only after you approve, and only after verifying:

- Correct branch (`git branch --show-current`)
- Clean status (`git status`)
- Remote configured (`git remote -v`)
- No secrets tracked or staged
- Quality checks pass where practical: `npm run typecheck` and `npm run lint`

```bash
git push -u origin feature/tomato-cart-tests
```

### PR Agent

Creates a well-documented PR with a meaningful title, a summary of what changed and why, test
coverage notes, important changes, known failures, and validation details:

> **Title:** `test: add shopping cart flow coverage for Tomato site`
>
> **Summary:** Adds BDD coverage for browsing the menu, adding dishes to the cart, and applying a
> promo code on the Tomato Food Delivery app.
>
> **Test coverage:** `features/cart/cart.feature` — 3 scenarios tagged `@smoke` / `@regression`.
>
> **Validation:** `npm run lint`, `npm run typecheck`, and the new `@smoke` scenarios pass.

It never merges automatically and never closes issues or deletes branches without approval.

---

## 8. Jira Import & Jira Status Agents

Both Jira agents work against the Jira instance configured via environment variables:

```bash
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=qa-bot@example.com
JIRA_API_TOKEN=<your-api-token>
JIRA_PROJECT_KEY=QA
```

Credentials live in `.env` / CI secrets — never in code or prompts, and never in logs.

### Jira Import Agent

Converts feature-file scenarios into **Jira test issues**:

1. Reads the generated feature files (e.g. `features/cart/cart.feature`).
2. Converts each scenario into a Jira-compatible test case, preserving the **feature**, **scenario**,
   **preconditions**, **steps**, **expected results**, **tags**, and **priority**.
3. **Searches for duplicates first** — if an equivalent test already exists, it reports the existing
   issue instead of creating a new one.
4. Creates the issues **only after you approve**.

> Example prompt: *"Import the scenarios from `features/cart/cart.feature` into Jira as test
> cases. Search for duplicates first and show me what would be created before doing anything."*

### Jira Status Update Agent

Synchronizes Jira issues with the latest automation results:

1. Reads the latest report — `reports/cucumber-report/cucumber-report.json` (or Allure results).
2. Identifies passed, failed, and skipped scenarios.
3. Maps scenarios to Jira issues.
4. Updates the status/result for each mapped issue.
5. Adds execution info (timestamp, environment, browser) and failure details when applicable.

**Golden rule: never mark a test as PASS when the latest automation result is FAIL.** Status
updates are always based on the latest report only, and it never closes or deletes issues without
approval.

> Example prompt: *"Update the Jira statuses for the cart scenarios based on the latest
> `reports/cucumber-report/cucumber-report.json`. Do not mark anything PASS unless the latest run
> passed."*

---

## 9. Skills at a Glance

Skills codify the framework's conventions so any AI assistant produces code consistent with this
repository. Each skill lives in `.cline/skills/<name>/SKILL.md`.

| Skill | Purpose |
| --- | --- |
| `playwright` | Playwright best practices: World usage, auto-waiting, no `waitForTimeout`. |
| `cucumber` | Gherkin conventions: business behavior, thin steps, tags, one file per domain. |
| `page-object-model` | Page Objects extend `BasePage`, encapsulate locators, prefer composition. |
| `locator-strategy` | Locator priority: role → label → placeholder → text → testid → stable CSS → XPath. |
| `test-design` | Scenario design: happy path, negative, boundary, validation, empty-state. |
| `test-healing` | Diagnosis and repair of failing tests — max 3 attempts. |
| `environment-management` | `ENV=` selection, `config.baseUrl`, credentials via `.env`, never hardcode. |
| `reporting` | Allure + Cucumber reports, failure artifacts, `environment.properties`. |
| `git` | Safe Git: branch naming, Conventional Commits, review before commit, push/PR only on approval. |
| `jira` | Import scenarios / update statuses via the Jira integration scripts, dedupe + dry-run first. |

---

## 10. Prebuilt Workflows

Workflows chain the agents end-to-end. They live in `.cline/workflows/`.

| Workflow | Purpose | Chain |
| --- | --- | --- |
| `create-test` | Create a new automated BDD test from a requirement | Planner → Test Generator → Validation → Report |
| `heal-test` | Diagnose and fix a failing test | Healer (max 3 attempts) → validate → report |
| `jira-import` | Import generated scenarios into Jira as test cases | Read features → search duplicates → approve → create |
| `jira-status-update` | Sync Jira issue results with the latest report | Read report → map scenarios → update statuses |

**Example — run the `create-test` workflow for the Tomato site:**

1. Ask the **Planner**: "Plan BDD coverage for the Tomato Food Delivery cart flow."
2. Approve the resulting `specs/cart-test-plan.md`.
3. Ask the **Test Generator**: "Generate the test from `specs/cart-test-plan.md`."
4. Run the validation: `ENV=qa BASE_URL=https://tomato-food-delivery-zeta.vercel.app npm run test:smoke`.
5. If a scenario fails, invoke the **Healer** with the artifacts.

---

## 11. Command Reference

### Running tests against the Tomato site

```bash
# Full suite (ENV defaults to qa; chromium, headless)
ENV=qa BASE_URL=https://tomato-food-delivery-zeta.vercel.app npm test

# Tag-filtered suites
npm run test:smoke        # @smoke
npm run test:regression   # @regression
npm run test:sanity       # @sanity
npm run test:critical     # @critical

# Headed / debug / cross-browser
npm run test:headed
npm run test:debug        # DEBUG=pw:api
npm run test:firefox
npm run test:webkit
```

> If you prefer, set `BASE_URL` inside `.env` once and drop the inline variable.

### Reports & artifacts

```bash
npm run report:allure     # generate + open Allure HTML report
npm run report:cucumber   # notes about reports/cucumber-report/
```

| Report / artifact | Path |
| --- | --- |
| Cucumber JSON | `reports/cucumber-report/cucumber-report.json` |
| Cucumber HTML | `reports/cucumber-report/cucumber-report.html` |
| Allure raw results | `reports/allure-results/` |
| Allure HTML report | `reports/allure-report/` |
| Failure screenshots | `screenshots/` |
| Failure traces | `traces/` |

### Quality gates (run before finishing any change)

```bash
npm run lint
npm run format:check
npm run typecheck
```

---

## 12. Example Prompt Library

Copy-paste prompts for the Tomato Food Delivery site.

### 12.1 Plan menu + cart coverage (Planner)

> "Plan BDD coverage for the Tomato Food Delivery menu and cart. A customer should be able to
> browse dishes by category, add a dish to the cart, open the cart, see subtotal and delivery fee,
> and apply a promo code. Inspect https://tomato-food-delivery-zeta.vercel.app first, then produce
> a structured test plan."

### 12.2 Generate tests from a plan (Test Generator)

> "Read `specs/cart-test-plan.md` and generate the BDD automation for it. Reuse existing Page
> Objects and steps where possible, follow the locator priority, and keep step definitions thin.
> Then run the generated `@smoke` scenarios against the Tomato site."

### 12.3 Heal a failing scenario (Healer)

> "The scenario 'Add a dish to the cart from the home page' is failing against the Tomato site.
> Analyze the error, screenshot, and trace, identify the root cause, and apply the smallest fix.
> Re-run after each attempt and stop after 3 failed attempts."

### 12.4 Commit & push generated tests (Git Agent)

> "Create branch `feature/tomato-cart-tests`, commit the new cart feature, page objects, and steps
> with a Conventional Commit, run lint/typecheck, and show me the PR body — do not push until I
> approve."

### 12.5 Import scenarios into Jira (Jira Import)

> "Import the scenarios from `features/cart/cart.feature` into Jira as test cases. Search for
> duplicates first, preserve tags and priority, and preview the issues before creating anything."

### 12.6 Update Jira from the latest run (Jira Status)

> "Update Jira issue results from `reports/cucumber-report/cucumber-report.json` for the cart
> scenarios. Add the environment and browser info. Never mark a test PASS if the latest result is
> FAIL."

---

## 13. Guardrails You Should Know

These rules are encoded in `.clinerules/` and enforced by the agents. Knowing them helps you use
the agents safely and predictably.

### Approval rules (destructive actions)

Agents **never** perform destructive operations without your explicit approval. They stop and
explain *what* will be deleted, *why* it's necessary, and *what* will be affected:

- Deleting files, directories, tests, scenarios, or Page Objects
- Resetting Git history, force-pushing, or deleting branches
- Overwriting large portions of the framework
- Deleting or closing Jira issues
- Modifying production configuration

### Healing limit

- The Healer has a **maximum of 3 attempts**. After 3 failures it stops and asks you for help.
  It never attempts a 4th fix.

### Agent boundaries

- The **Planner** plans; it never generates implementation code.
- The **Test Generator** reuses existing Page Objects/steps before creating new ones.
- The **Healer** fixes tests but must never disable assertions, delete/skip tests, add arbitrary
  waits, or modify unrelated code.

### Security

- **Never** hardcode credentials, tokens, API keys, or cookies.
- `.env` is git-ignored; only `.env.example` with placeholders is committed.
- Sensitive values must never appear in code, feature files, git history, reports, screenshots,
  logs, or prompts.
- The logger and console-message capture filter out likely secrets.
- Before committing/pushing, verify nothing sensitive is staged (`git diff`, `git status`).

### Framework conventions to keep

- Describe **business behavior** in Gherkin, never DOM implementation.
- Scenarios are independent and isolated (fresh `BrowserContext` per scenario).
- Use `config.baseUrl`, `config.credentials.*`, and `config.timeout.*` — never hardcode.
- Prefer role/accessibility-based locators; never use arbitrary `waitForTimeout`.
- Keep step definitions thin; put logic in Page Objects.

---

## 14. Troubleshooting & Tips

### The Planner inspects the site, not the repo

If you want the plan to match the live Tomato app, make sure the Planner has browser access
(Playwright browser / MCP). The snapshots it takes are what feed the feature files — keep them in
mind when reviewing the plan.

### Locators for the Tomato site are only as stable as its DOM

This guide's examples (e.g. `getByRole('img', { name: 'Add to cart' })`) reflect the app at the
time of writing. If the site changes, run the scenario, check the failure artifacts, and ask the
**Healer** to adjust the smallest locator rather than hand-rewriting everything.

### The `World` must know about new Page Objects

If generated steps reference `this.homePage` or `this.cartPage` and TypeScript complains, the new
Page Object was not added to `src/support/world.ts` and initialized in `src/hooks/hooks.ts`
(see Section 5 — *Wiring new Page Objects into the World*).

### Credentials for the Sign In modal

The Tomato site creates accounts at runtime. Create a dedicated QA account once, store its
credentials in `.env`, and reference them through `config.credentials.*`. Never paste the password
into a prompt.

### One feature file per domain

Put cart scenarios in `features/cart/cart.feature`, login-modal scenarios in
`features/auth/auth.feature`, etc. Match existing step wording so you don't create near-duplicate
steps.

### Keep suites fast

Tag scenarios deliberately: `@smoke` for the critical happy paths you want in every PR, and
`@regression` for the broader nightly coverage. That way the Healer has small, fast feedback
loops.

### Where to look when a test fails

1. The scenario error in the console / Allure.
2. The screenshot in `screenshots/`.
3. The trace in `traces/` (enable full tracing with `TRACE=true` if needed).
4. The Cucumber JSON report for statuses.
5. Then hand all of that to the **Healer** in one message.

---

*End of guide. For framework details (config, structure, CI/CD), see `README.md`.*
