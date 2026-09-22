# Tomato Agentic QA

A production-ready **Playwright + TypeScript + Cucumber BDD** automation framework with **Allure reporting**, **multi-environment support**, **CI/CD pipelines**, and **Cline AI agents** (Planner, Test Generator, Healer, Git, Jira).

The project is the concrete implementation of the specification in
[`Tomato-Agentic-QA-Framework-Prompt.md`](./Tomato-Agentic-QA-Framework-Prompt.md).

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Running Tests](#running-tests)
- [Tagging](#tagging)
- [Cross-Browser & Modes](#cross-browser--modes)
- [Reporting](#reporting)
- [Failure Artifacts](#failure-artifacts)
- [CI/CD](#cicd)
- [Cline AI Agents](#cline-ai-agents)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [License](#license)

---

## Features

- **BDD with Cucumber** (Gherkin `.feature` files) driven by TypeScript step definitions.
- **Page Object Model (POM)** — clean separation between locators, page actions, and assertions.
- **Multi-environment** support (`dev`, `qa`, `stage`, `prod`) via a central `config` object.
- **Cross-browser** — Chromium, Firefox, WebKit.
- **Allure reporting** (v3 via `allure-cucumberjs`) plus native Cucumber HTML/JSON reports.
- **Failure artifacts** — screenshots, traces, videos, and page HTML captured on failure.
- **CI/CD** — GitHub Actions (test / smoke / regression) and a Jenkins pipeline.
- **AI agents** — Cline agents/skills/workflows for planning, test generation, self-healing, Git, and Jira.
- **Lint / format / typecheck** — ESLint + Prettier + TypeScript strict validation.
- **Resilient timeouts** — configurable action/navigation/expect and step timeouts.

---

## Tech Stack

| Layer          | Technology                                                       |
| -------------- | ---------------------------------------------------------------- |
| Language       | TypeScript (strict)                                              |
| Test runner    | `@cucumber/cucumber` v13 (BDD)                                   |
| Browser driver | Playwright `@playwright/test` (browser + expect utils)           |
| Reporting      | `allure-cucumberjs` / `allure-js-commons` + `allure-commandline` |
| Config         | `dotenv` + typed environment modules                             |
| CI             | GitHub Actions + Jenkins                                         |
| Code quality   | ESLint, Prettier                                                 |

---

## Prerequisites

- **Node.js >= 18** (the project targets Node 20/22 in CI; Node 24 works locally).
- **npm** (or your preferred package manager).
- **Playwright browsers** (install with `npx playwright install chromium` for the demo; add `firefox`/`webkit` as needed).

---

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install chromium

# 3. (Optional) Create your local env file from the template
cp .env.example .env
```

> `.env` holds **local-only** secrets and is never committed. `.env.example` documents every supported variable.

---

## Quick Start

The repo ships a **self-contained demo app** (`demo/login.html` → `demo/dashboard.html`).
It accepts the credentials `demo` / `password`.

```bash
# 1. Start the demo server (port 3100, see scripts/demo-server.js)
npm run demo

# 2. In another terminal, run the full suite
ENV=qa HEADLESS=true npm test
```

You should see both scenarios of `features/login/login.feature` pass.

---

## Configuration

### Environment Variables

All environment variables are read **only** in `src/config/config.ts` and exposed through the
`config` object — the rest of the framework must use `config.*`, never `process.env` directly.

| Variable                | Default                    | Description                                                |
| ----------------------- | -------------------------- | ---------------------------------------------------------- |
| `ENV`                   | `qa`                       | Environment: `dev` \| `qa` \| `stage` \| `prod`            |
| `BASE_URL`              | per-environment            | Overrides the environment's `baseUrl`                      |
| `BROWSER`               | `chromium`                 | `chromium` \| `firefox` \| `webkit`                        |
| `HEADLESS`              | `true`                     | Headless mode (`true`/`false`)                             |
| `USERNAME` / `PASSWORD` | —                          | Application credentials (from `.env`)                      |
| `ACTION_TIMEOUT`        | `15000`                    | Action timeout (ms)                                        |
| `NAVIGATION_TIMEOUT`    | `30000`                    | Navigation timeout (ms)                                    |
| `EXPECT_TIMEOUT`        | `15000`                    | Assertion / element wait timeout (ms)                      |
| `STEP_TIMEOUT`          | `60000`                    | Cucumber step timeout (ms, read in `src/support/world.ts`) |
| `RETRIES`               | `1` in CI, else `0`        | Scenario retry count                                       |
| `VIDEO` / `TRACE`       | `false` / `on-first-retry` | Failure artifact toggles                                   |
| `JIRA_*`                | —                          | Jira integration (optional)                                |

### Environments

Environment modules live in `src/config/environments/` (`dev`, `qa`, `stage`, `prod`).
Each exports a typed object (`name`, `baseUrl`, `appTitle`). The demo targets `qa` at
`http://localhost:3100`.

```ts
// src/config/environments/qa.ts
export const qa: EnvironmentConfig = {
  name: 'qa',
  baseUrl: 'http://localhost:3100',
  appTitle: 'Login',
};
```

---

## Project Structure

```text
.
├── cucumber.js                    # Cucumber config: formats, options, world params
├── playwright.config.ts           # Single source of truth for browser/trace/artifact options
├── tsconfig.json
├── eslint.config.js
├── prettier.config.js
├── package.json
├── Jenkinsfile                    # Jenkins pipeline
├── .github/workflows/             # GitHub Actions: test.yml, smoke.yml, regression.yml
├── .env / .env.example            # Local env vars (never commit .env)
├── demo/                          # Self-contained demo app (login.html, dashboard.html)
├── scripts/
│   └── demo-server.js             # Static demo server on port 3100
├── features/
│   └── login/login.feature        # Gherkin feature files
├── src/
│   ├── config/
│   │   ├── config.ts              # Central config (reads process.env here only)
│   │   └── environments/          # dev | qa | stage | prod
│   ├── types/config.ts            # Shared config typings
│   ├── data/users.ts              # Test data / fixtures
│   ├── fixtures/index.ts          # Fixture helpers
│   ├── support/
│   │   ├── world.ts               # Custom Cucumber World + browser/context/page
│   │   └── browser.ts             # Browser/context launch helpers
│   ├── hooks/hooks.ts             # Cucumber Before/After lifecycle + failure artifacts
│   ├── pages/
│   │   ├── base/BasePage.ts       # Shared page behaviour (navigation, etc.)
│   │   ├── components/Header.ts   # Reusable components
│   │   ├── login/LoginPage.ts
│   │   └── dashboard/DashboardPage.ts
│   ├── steps/                     # Cucumber step definitions
│   │   ├── common.steps.ts
│   │   └── login.steps.ts
│   └── utils/
│       ├── artifacts.ts           # Failure artifact capture
│       ├── reporter.ts            # Allure environment info
│       └── logger.ts              # Structured logging
├── reports/                       # Generated reports (git-ignored)
└── .cline/                        # Cline AI agents / skills / workflows
```

---

## How It Works

### World & Browser Lifecycle

- A custom **World** (`src/support/world.ts`) holds the active `page`, `context`, and the
  instantiated page objects. Steps and hooks access them via `this`.
- **`BeforeAll` / `AfterAll`** in `src/hooks/hooks.ts` launch and close a single browser.
- **`Before` / `After`** create and dispose a fresh **BrowserContext per scenario** for
  guaranteed isolation, and capture failure artifacts on failure.
- `setDefaultTimeout()` (from `@cucumber/cucumber`) sets the step timeout (60s default,
  overridable via `STEP_TIMEOUT`).

> ⚠️ Never create your own browser inside a step — always use `this.page` / `this.context`
> from the World (see `.cline/skills/playwright/SKILL.md`).

### Page Object Model

Pages extend `BasePage`, receive the `Page` instance, and encapsulate locators + actions +
assertions. Example (`DashboardPage`):

```ts
export class DashboardPage extends BasePage {
  private readonly heading: Locator;
  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
  }
  async isLoaded(): Promise<void> {
    await this.heading.waitFor({ state: 'visible', timeout: config.timeout.expect });
  }
}
```

### Step Definitions

Steps are plain `Given` / `When` / `Then` functions typed against the `World`:

```ts
Given('the user is on the login page', async function (this: World) {
  await this.loginPage.goto();
  await this.loginPage.isLoaded();
});
```

### Timeouts

| Timeout          | Key (`config.timeout.*`) | Notes                                               |
| ---------------- | ------------------------ | --------------------------------------------------- |
| Action           | `action`                 | Applied to locator actions                          |
| Navigation       | `navigation`             | Applied to page navigations                         |
| Expect / element | `expect`                 | Passed explicitly to `locator.waitFor` / assertions |
| Cucumber step    | `STEP_TIMEOUT`           | Set via `setDefaultTimeout()`                       |

> **Playwright note:** `expect.setDefaultTimeout()` was removed in Playwright 1.63.
> The framework therefore passes the configured `expect` timeout explicitly to
> `locator.waitFor({ state: 'visible', timeout: config.timeout.expect })` rather than relying
> on a global default.

---

## Running Tests

```bash
# Full suite (defaults: ENV=qa, chromium, headless)
npm test

# Tag-filtered suites
npm run test:smoke        # @smoke
npm run test:regression   # @regression
npm run test:sanity       # @sanity
npm run test:critical     # @critical

# Headed / debug
npm run test:headed
npm run test:debug        # DEBUG=pw:api

# Cross-browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Code quality
npm run lint
npm run format
npm run typecheck
```

---

## Tagging

Scenarios can be tagged with any of `@smoke`, `@regression`, `@sanity`, `@critical` (or custom
tags) to be selected by the matching npm script or CI job. Example from
`features/login/login.feature`:

```gherkin
@smoke @critical
Scenario: Successful login with valid credentials
  Given the user is on the login page
  When the user logs in with valid credentials
  Then the dashboard should be displayed
```

---

## Cross-Browser & Modes

- Browser is selected via `BROWSER` env or the `--world-parameters` npm scripts.
- `HEADLESS=true|false` toggles headed mode.
- `playwright.config.ts` keeps a single source of truth for viewport, trace, screenshot, and
  video options and is read by supporting tooling. Cucumber drives the actual run.

---

## Reporting

### Allure

```bash
# Generate + open the Allure report
npm run report:allure
```

- Raw results are written to `reports/allure-results/` (configured via `formatOptions.resultsDir`
  in `cucumber.js`).
- The HTML report is generated into `reports/allure-report/`.
- Environment info (OS, Node version, env, browser, headless) is attached automatically via
  `formatOptions.environmentInfo`.

### Cucumber

Native HTML and JSON reports are written during each run:

- `reports/cucumber-report/cucumber-report.html`
- `reports/cucumber-report/cucumber-report.json`

---

## Failure Artifacts

On a failed scenario, the `After` hook (`src/hooks/hooks.ts` → `src/utils/artifacts.ts`)
captures and attaches to Allure:

- **Screenshot** (PNG)
- **Page HTML**
- **Trace** (`on-first-retry` by default; enable fully via `TRACE=true`)
- **Video** (enable via `VIDEO=true`)

Artifacts are also written to `screenshots/` and `traces/` for inspection.

---

## CI/CD

### GitHub Actions (`.github/workflows/`)

| Workflow         | Trigger              | Runs                      |
| ---------------- | -------------------- | ------------------------- |
| `test.yml`       | PRs + pushes to main | Full suite (chromium)     |
| `smoke.yml`      | PRs (fast feedback)  | `npm run test:smoke`      |
| `regression.yml` | Nightly / schedule   | `npm run test:regression` |

Each workflow installs Node, dependencies, Playwright browsers, starts the demo server, runs
the relevant suite, and uploads Allure + Cucumber reports as artifacts. All workflows use port
**3100** for the demo server.

### Jenkins (`Jenkinsfile`)

A declarative pipeline that mirrors the GitHub Actions flow: `checkout → setup → lint/typecheck
→ start demo → test → publish reports` and archives the reports.

---

## Cline AI Agents

This project includes ready-to-use **Cline** AI agent definitions (`.cline/agents/`), skills
(`.cline/skills/`), and workflows (`.cline/workflows/`):

| Agent                         | Purpose                                        |
| ----------------------------- | ---------------------------------------------- |
| `planner`                     | Plans test coverage from requirements/features |
| `test-generator`              | Generates Gherkin features + step definitions  |
| `healer`                      | Self-heals flaky locators/tests                |
| `git`                         | Commits, branches, and manages the repo        |
| `jira-import` / `jira-status` | Syncs results with Jira                        |

Skills codify the framework's conventions (Playwright, Page Object Model, locator strategy,
Cucumber, test design, test healing, reporting, environment management, Git, Jira) so AI
assistants produce code consistent with this codebase.

---

## Troubleshooting

- **`EADDRINUSE` / port 3000 occupied** — the demo server runs on port **3100** on purpose so it
  never collides with a local app on 3000. See `scripts/demo-server.js`.
- **`allure` command not found** — run via `npx allure ...` or `npm run report:allure`
  (the `allure-commandline` devDependency provides the binary).
- **Allure results missing** — ensure the format is `allure-cucumberjs/reporter` (with the
  `/reporter` suffix) in `cucumber.js`.
- **Step timeout** — the Cucumber v13 config key `defaultTimeout` is invalid; the step timeout is
  set with `setDefaultTimeout()` in `src/support/world.ts`.
- **Assertions timing out** — increase `EXPECT_TIMEOUT` or use `locator.waitFor(...)` with an
  explicit timeout in the page objects.

---

## Roadmap

- Expand the demo app and feature coverage (checkout, registration, etc.).
- Add Jira TestOps / Allure TestOps publishing.
- Add Dockerized test execution for parity across environments.
- Add per-browser matrix jobs to CI.

---

## License

UNLICENSED — private project.
